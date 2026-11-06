# Static code analysis — Mo's contribution

## Requirement and scope

The requirement is to perform static code analysis in the pipeline, include evidence of the results, and briefly explain what those results mean. This contribution extends the existing repository at base commit `b4f0713b899835adfa317ee6e8fe08bb670136ec`.

Oxlint was already installed in the React application. Both applications now use version **1.85.0**, pinned in their manifests and lockfiles. The backend configuration enables Node.js globals; the frontend configuration enables browser globals and React rules, with a Node.js override for the Vite configuration. No database, credentials, TLS certificates, or running API are needed for static analysis.

| Scope | Included paths | Excluded from analysis |
| --- | --- | --- |
| Backend | `src/`, `scripts/` | Dependencies, reports, frontend, coverage |
| Frontend | `client/src/`, `client/vite.config.js` | Dependencies, production output, coverage |

Oxlint selects supported source files from these paths. Documentation, CSS, images, and YAML workflow validation are outside its source-code checks.

## Rules and failure policy

| Check | Purpose |
| --- | --- |
| Correctness category | Find selected invalid or ineffective code patterns |
| `no-undef` | Find references to undefined names |
| `no-unused-vars` | Identify unused variables; warnings fail the gate |
| `no-eval`, `no-implied-eval`, `no-new-func` | Reject selected forms of dynamic code execution |
| `no-debugger` | Reject committed debugger statements |
| `eqeqeq` | Require strict equality |
| React hook rules | Check hook placement, effect dependencies, and effect-driven state updates |
| React component exports | Preserve the existing component-export check |

Both commands use `--deny-warnings`. Express middleware arguments are not checked for unused-variable warnings: argument positions, including the fourth `next` argument in error middleware, affect Express behaviour. Unused local variables remain checked. No project-wide rule suppression was added to clear the form findings.

## Local use

From the repository root, with Node.js 24:

```powershell
npm ci
npm ci --prefix client
npm run lint
npm run lint:report
npm run analysis:verify-gate
npm --prefix client run build
```

| Command | Result |
| --- | --- |
| `npm run lint:backend` | Human-readable backend findings |
| `npm run lint:frontend` | Human-readable frontend findings |
| `npm run lint` | Backend then frontend checks; stops at the first failing scope |
| `npm run lint:report` | Both scopes, JSON reports, Markdown summary, and a combined failure status |
| `npm run analysis:verify-gate` | Four deliberate failure checks, with probe cleanup |

The report command writes `backend.json`, `frontend.json`, `summary.json`, and `summary.md` to `reports/static-analysis/`. It treats missing tools, invalid reports, empty file selection, timeouts, errors, and warnings as failures. Reports are ignored by Git because they are regenerated for each run. The gate check records its results in `reports/gate-verification.json`.

## Pipeline configuration

`.github/workflows/static-analysis.yml` runs on all branch pushes and pull requests, supports manual dispatch, and exposes `workflow_call` for reuse. It runs on Ubuntu with Node.js 24, installs both sets of locked dependencies with `npm ci`, runs analysis, verifies failure behaviour, and uploads evidence. The report command directly appends its summary to the GitHub job summary.

The analysis step does not use `continue-on-error`, `|| true`, or a shell pipeline that could hide a failure exit code. Evidence upload uses `always()` so diagnostic reports remain available after failure. If dependency installation fails before reports exist, evidence upload also reports missing files; the job remains failed. Artifacts are retained for 90 days, so download submission evidence before expiry.

The Classroom autograding workflow remains intact. This analysis workflow does not replace the full pipeline's application tests and builds. In the inspected base, neither package defines an application `test` script; Imraan must add real backend/frontend tests and the remaining pipeline stages rather than treating lint or gate verification as application tests. The backend currently runs directly as CommonJS JavaScript, so its build/validation stage must suit that setup.

Imraan can call the analysis job from the full workflow:

```yaml
jobs:
  static-analysis:
    uses: ./.github/workflows/static-analysis.yml
    permissions:
      contents: read
```

If a full workflow becomes the sole trigger, coordinate removal of the standalone push/pull-request triggers to avoid duplicate analysis runs. No secrets need to be inherited by this reusable workflow.

## Findings and fixes

The original frontend `npm run lint` returned success despite two warnings:

1. `react-hooks/exhaustive-deps`: the effect read `initialValues` without declaring that object as a dependency.
2. `react/set-state-in-effect`: resetting form state synchronously inside an effect can cause an additional render.

Under the stricter configuration those findings are errors. `GigForm` now wraps its stateful fields in a component keyed by the four incoming initial values. Changing those values resets the draft without an effect. Recreating an equivalent values object, changing loading/error props, or editing a field leaves the existing draft intact. Incoming values changing while a draft is being edited still resets the form, consistent with the previous reset behaviour.

## Recorded local results

The checked-in files under `docs/evidence/static-analysis/` are a fixed local evidence snapshot from 6 November 2026, prepared from base commit `b4f0713` plus this change. They are not a GitHub Actions run. Reports record this explicitly using `environment: local working tree` and `sourceRevision: null`; `baseRevision` identifies the starting source when present. Fresh workflow artifacts record the actual `GITHUB_SHA`.

| Check | Result |
| --- | --- |
| Backend analysis | 34 supported files; 0 errors; 0 warnings |
| Frontend analysis | 23 supported files; 0 errors; 0 warnings |
| Backend deliberate error | Exit 1, as required |
| Backend deliberate warning | Exit 1, as required |
| Frontend deliberate error | Exit 1, as required |
| Frontend deliberate warning | Exit 1, as required |
| Frontend production build | Passed |

The before-fix report uses the stricter configuration with the original form code. It therefore records two errors rather than the original command's two warnings. Its backend file count is 33 because the gate-verification script had not yet been added. The final count is 34.

## Collect the final GitHub evidence

1. Apply and review this contribution on your working branch, commit it, and push it to the existing repository.
2. Open the repository's **Actions** tab and select **Static code analysis** for that commit.
3. Confirm the analysis and deliberate-failure verification steps passed.
4. Download the `static-analysis-<run-id>-<attempt>` artifact and keep its JSON and Markdown reports.
5. Capture the workflow summary and expanded analysis results, showing the commit and successful checks.
6. Add the actual workflow run URL and evidence links to the final README. Keep the local and GitHub results clearly labelled.

The deliberate failure verification step is successful when the intentionally faulty samples return exit 1. Those samples are removed automatically; they are not committed as application code.

## Explanation of the results and limits

The final local results show no violations of the enabled rules in the selected source files. The four deliberate failure checks demonstrate that both scopes reject errors and warnings instead of silently reporting success. The two React findings were corrected rather than suppressed.

This is source-code analysis. It does not execute complete user flows, verify tax calculations, test container startup, inspect the dependency supply chain, or establish that security controls work at runtime. In particular, passing does not establish protection against injection, XSS, authentication weaknesses, or broken access control. Application tests and Humera's final security review must provide that evidence separately.

The inspected frontend at `b4f0713` is still a design preview with sample data. A passing analysis/build result must not be described as proof that authentication, booking, or transaction recording is connected end to end.

## Tool documentation

- [Oxlint CLI and warning exit policy](https://oxc.rs/docs/guide/usage/linter/cli.html)
- [Oxlint configuration](https://oxc.rs/docs/guide/usage/linter/config)
- [React: resetting state when props change](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes)
- [GitHub Actions exit codes](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/set-exit-codes)
