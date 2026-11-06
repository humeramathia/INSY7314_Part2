const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "hustlehub-analysis-"));
const checks = [];
const scopes = [
  { name: "backend", directory: path.join(root, "src") },
  { name: "frontend", directory: path.join(root, "client/src") },
];
const probes = [
  { severity: "error", code: "no-debugger", source: "debugger;\n" },
  { severity: "warning", code: "no-unused-vars", source: "const unusedAnalysisProbe = 1;\n" },
];

try {
  for (const scope of scopes) {
    for (const probe of probes) {
      const filename = path.join(scope.directory, `analysis-gate-probe-${process.pid}.js`);
      const output = path.join(temporary, `${scope.name}-${probe.severity}`);
      let created = false;
      try {
        fs.writeFileSync(filename, probe.source, { flag: "wx" });
        created = true;
        const result = spawnSync(process.execPath, [path.join(__dirname, "static-analysis.js")], {
          cwd: root,
          encoding: "utf8",
          timeout: 150000,
          env: { ...process.env, ANALYSIS_REPORT_DIR: output, GITHUB_STEP_SUMMARY: "" },
        });
        if (result.error) throw result.error;
        assert.equal(result.status, 1, `${scope.name} ${probe.severity} must fail the analysis command`);
        const summary = JSON.parse(fs.readFileSync(path.join(output, "summary.json"), "utf8"));
        assert.equal(summary.passed, false);
        assert.equal(summary.results.find((item) => item.scope === scope.name).passed, false);
        const report = JSON.parse(fs.readFileSync(path.join(output, `${scope.name}.json`), "utf8"));
        assert.ok(report.diagnostics.some((item) => item.severity === probe.severity && item.code.includes(probe.code)));
        checks.push({ scope: scope.name, severity: probe.severity, rule: probe.code, exitCode: result.status, passed: true });
        console.log(`PASS: ${scope.name} ${probe.severity} produces exit code 1`);
      } finally {
        if (created) fs.unlinkSync(filename);
      }
    }
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

const reports = path.join(root, "reports");
fs.mkdirSync(reports, { recursive: true });
fs.writeFileSync(path.join(reports, "gate-verification.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  sourceRevision: process.env.GITHUB_SHA || null,
  checks,
}, null, 2) + "\n");
