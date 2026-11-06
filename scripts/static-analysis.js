const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const reportDir = path.resolve(root, process.env.ANALYSIS_REPORT_DIR || "reports/static-analysis");
fs.mkdirSync(reportDir, { recursive: true });

const scopes = [
  { name: "backend", cwd: root, paths: ["src", "scripts"] },
  { name: "frontend", cwd: path.join(root, "client"), paths: ["src", "vite.config.js"] },
];

function analyse(scope) {
  const binary = path.join(scope.cwd, "node_modules/oxlint/bin/oxlint");
  const result = spawnSync(process.execPath, [binary, "--deny-warnings", "--format", "json", ...scope.paths], {
    cwd: scope.cwd,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    timeout: 60000,
  });
  const raw = result.stdout || "";
  fs.writeFileSync(path.join(reportDir, `${scope.name}.json`), raw);
  let report;
  let toolVersion;
  let failureReason = result.error?.message || null;
  try {
    report = JSON.parse(raw);
    if (!Array.isArray(report.diagnostics) || !Number.isInteger(report.number_of_files) || report.number_of_files < 1) {
      throw new Error("Oxlint did not return diagnostics for a non-empty set of files.");
    }
    toolVersion = JSON.parse(fs.readFileSync(path.join(scope.cwd, "node_modules/oxlint/package.json"), "utf8")).version;
  } catch (error) {
    failureReason = error.message;
  }
  const diagnostics = report?.diagnostics || [];
  const errors = diagnostics.filter((item) => item.severity === "error").length;
  const warnings = diagnostics.filter((item) => item.severity === "warning").length;
  const passed = !failureReason && result.status === 0 && errors === 0 && warnings === 0;
  console.log(`${scope.name}: ${passed ? "PASS" : "FAIL"} (${report?.number_of_files ?? 0} files; ${errors} errors; ${warnings} warnings)`);
  for (const item of diagnostics) {
    console.log(`  ${item.filename}: ${item.severity} ${item.code}: ${item.message}`);
  }
  if (failureReason) console.error(failureReason);
  if (result.stderr) console.error(result.stderr.trim());
  return {
    scope: scope.name,
    tool: "Oxlint",
    toolVersion: toolVersion || null,
    paths: scope.paths,
    files: report?.number_of_files ?? 0,
    errors,
    warnings,
    exitCode: result.status ?? 1,
    passed,
    failureReason,
  };
}

const results = scopes.map(analyse);
const summary = {
  generatedAt: new Date().toISOString(),
  sourceRevision: process.env.GITHUB_SHA || null,
  baseRevision: process.env.ANALYSIS_BASE_REVISION || null,
  environment: process.env.GITHUB_ACTIONS ? "GitHub Actions" : "local working tree",
  node: process.version,
  passed: results.every((result) => result.passed),
  results,
};
fs.writeFileSync(path.join(reportDir, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
const markdown = [
  "## Static code analysis",
  "",
  `Generated: ${summary.generatedAt}`,
  `Environment: ${summary.environment}; Node ${summary.node}`,
  `Revision: ${summary.sourceRevision || "local working tree (not a GitHub run)"}`,
  "",
  "| Scope | Oxlint | Files | Errors | Warnings | Result |",
  "| --- | --- | ---: | ---: | ---: | --- |",
  ...results.map((result) => `| ${result.scope} | ${result.toolVersion || "unavailable"} | ${result.files} | ${result.errors} | ${result.warnings} | ${result.passed ? "PASS" : "FAIL"} |`),
  "",
  "Both errors and warnings fail this check. Passing means the selected static rules passed; it does not prove absence of bugs or vulnerabilities.",
  "",
].join("\n");
fs.writeFileSync(path.join(reportDir, "summary.md"), markdown);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
process.exitCode = summary.passed ? 0 : 1;
