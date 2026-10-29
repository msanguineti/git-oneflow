# Engineering

## Purpose and sources

git-OneFlow is a command-line tool for the OneFlow Git branching model. The
[README](README.md) describes supported workflows, configuration and usage; the
implementation and tests establish current behavior. Existing experimental branches
are not approved product direction merely because they exist.

The owner's standing direction is perpetual maintenance: no new features. A finite
modernization programme will improve correctness, Git safety, distribution and
maintainability, then finish. Keep the implementation and verification small and
practical; avoid speculative abstractions and large, repetitive test suites.
Remove external dependencies wherever Node built-ins or a small direct solution
reduce total maintenance. Do not trade a library for a large home-grown framework.

Backward compatibility is not a requirement. Changes must serve the maintenance
outcomes, preserve the tool's OneFlow purpose, and document intentional behavior
changes; no compatibility layers or gratuitous redesign are required.

Support maintained Node LTS lines and newer non-EOL stable releases; drop lines
when they reach EOL. Recheck the official Node release schedule during maintenance
and before releases, updating engines, local setup, CI and documentation together.
Linux, macOS and Windows remain targets. npm/npx distribution alone does not prove
portability: Git invocation, paths, prompts and package launchers need evidence.

## Repository workflow

The owner chose lightweight trunk-based development. `main` is the integration
branch. As a routine setup default, make small changes on short-lived branches
from `main` and integrate through pull requests, respecting
the existing GitHub branch protection. Keep branches current and avoid long-lived
development branches.
Use separate worktrees or otherwise isolate concurrent writers.

Use Conventional Commits, as configured by the existing commit hook. Run checks
appropriate to the change and address relevant review findings before integration.
GitHub currently reports `CodeFactor` and `build (18.x)` as required checks on
`main`; full protection and review settings were not accessible during setup, so
confirm current hosting rules before integration. Existing CI runs a build and
dry-run tests for pull requests targeting `main`.

The executor may make local commits for authorized work. Push, merge and release
require their own authorization. A GitHub release triggers the npm publishing
workflow; creating one is a release action. Preserve existing hooks and protection.

## Development and current limits

See [CONTRIBUTING.md](CONTRIBUTING.md) for current development and verification.
The repository still selects Node 18 locally, tests Node 18 and 20 in CI, and
publishes with Node 18. Those settings have not yet been modernized.

The remaining modernization outcomes are an isolated, useful test baseline on
supported runtimes; corrected command/configuration behavior and safe Git failure
handling; a smaller dependency tree and simple npm distribution; and verified
cross-platform release preparation with a lightweight maintenance procedure.
The programme and next phase are in ignored `.dev/programme.md` and `.dev/phase.md`.
They describe planned work, not completed implementation.

The proposed packaging direction is plain TypeScript compilation to readable
JavaScript, without bundling or minification. Confirm it with an installed-tarball
smoke check; use a simple esbuild command only if plain compilation needs more
lasting machinery. Runtime dependencies are external already, so a single-file
bundle is not an established requirement.
