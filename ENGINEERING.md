# Engineering

## Purpose and sources

git-OneFlow is a command-line tool for the OneFlow Git branching model. The
[README](README.md) describes supported workflows, configuration and usage; the
implementation and tests establish current behavior. Project intent beyond those
sources has not been established. Existing experimental branches are not approved
product direction merely because they exist.

## Repository workflow

The owner chose lightweight trunk-based development and the `chore/` branch prefix.
`main` is the integration branch. As a routine setup default, make small changes
on short-lived branches from `main` and integrate through pull requests, respecting
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

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and verification. The
repository selects Node 18 locally, tests Node 18 and 20 in CI, and publishes with
Node 18. Those versions are end of life; updating the runtime policy and automation
is a separate change. The documented package engine range remains the existing
compatibility claim until maintainers establish and verify a new one.
