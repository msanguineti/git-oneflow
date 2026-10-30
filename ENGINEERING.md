# Engineering

## Purpose and sources

git-OneFlow is a command-line tool for the OneFlow Git branching model. The
[README](README.md) describes supported workflows, configuration and usage; the
implementation and tests establish current behavior. Existing experimental branches
are not approved product direction merely because they exist.

Write public documentation for its readers: README for users, CONTRIBUTING for
contributors and RELEASE for package maintainers. Keep agent instructions,
programme/acceptance state, approval discussions and unpublished release drafts in
agent guidance or ignored `.dev/` records, outside public guides.

The owner's standing direction is perpetual maintenance: no new features. The
finite modernization programme was accepted and integrated on 2026-10-30 after
improving correctness, Git safety, distribution and maintainability. Keep the implementation and verification small and
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
from `main` and integrate through pull requests, respecting the existing GitHub
branch protection. Keep branches current and avoid long-lived development branches.
Use separate worktrees or otherwise isolate concurrent writers.

Use Conventional Commits, as configured by the existing commit hook. Run checks
appropriate to the change and address relevant review findings before integration.
Protect `main` with pull requests, required `checks` and `package-checks`, strict
up-to-date checks and administrator enforcement; block force pushes and deletion.
Zero mandatory reviewer approvals keeps the owner-led maintenance workflow small;
independent engineering review remains required for consequential changes. Recheck
actual hosting settings before integration. CI runs on PRs across maintained Node
LTS lines on Linux and the latest LTS on macOS and Windows. It does not repeat the
full Node matrix after merging to `main`.

The executor may make local commits for authorized work. Push, merge and release
require their own authorization. A GitHub release triggers the npm publishing
workflow; creating one is a release action. Preserve existing hooks and protection.

## Development and current limits

See CONTRIBUTING.md for setup and checks, and RELEASE.md for the public maintainer
procedure. The baseline supports Node 22/24/26 (minimum 22.8.0), with isolated Git
fixtures and non-writing checks. Git uses argument-based child processes; failures
stop subsequent actions and configuration retains typed values. The CLI ships
readable TypeScript-compiled ESM, built by prepack with all runtime modules included.
ShellJS, Rollup/plugins/Terser and the color helper have been removed; Node built-ins
handle cleanup and styling. Configuration and prompt libraries remain because
replacing them would add parser and terminal maintenance.

The accepted baseline was integrated through PRs #999–#1002. Final PR #1002 checks
covered full source checks and one installed tarball across Linux Node 22/24/26
and macOS/Windows Node 26. The release workflow verifies artifact identity and
publishes those checked bytes. Published GitHub pre-releases select npm `next`;
stable releases select `latest`. Authentication uses npm trusted publishing.
The first RC publication failed before authentication because its relative tarball
path lacked `./`. Publication now uses an explicit local path and an actual npm
dry run before upload. Manual recovery on corrected `main` requires an existing
published release and equality with its independently verified tarball digest;
this preserves the original package bytes and honest automatic source provenance.
Actual npm setup/OIDC/publication remains unverified until a successful attempt. Do not infer success from CI or
create a release as an agent probe.

The closed modernization account is in ignored `.dev/programme.md`; the current
maintenance phase and release handoff are in `.dev/phase.md`. Phase acceptance is
separate from integration and publication. Independent technical and acceptance
reviews precede the initiating maintainer's closure decision. Finishing one phase
does not authorize another or a release. Keep requirements and evidence until
acceptance, then consolidate the phase's local records.
