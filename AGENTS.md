# Repository guidance

## Current state

git-OneFlow provides feature, release and hotfix workflows for Git repositories
with one main branch or separate main and development branches. The CLI ships
as compiled TypeScript through npm. Git failures stop the workflow after any
successful earlier steps have taken effect. The [usage guide](USAGE.md)
describes current behavior. Use the implementation and tests to verify claims.

## Direction

Maintain git-OneFlow for correctness, security, supported runtimes and reliable
distribution. Keep its OneFlow scope. [Twigsmith](https://github.com/msanguineti/twigsmith)
is the successor with additional workflows. Maintenance may include intentional
compatibility breaks. Document those changes. Prefer Node built-ins and small
direct solutions that reduce maintenance.

## Working constraints

- Follow [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks and pull requests.
  Support the latest patches of maintained Node LTS lines and newer supported
  stable releases. Verify meaningful Git and package behavior on Linux, macOS
  and Windows as applicable.
- Use short-lived branches from `main` and isolate concurrent work. Protect
  `main` with pull requests, required `checks` and `package-checks`, strict
  up-to-date checks and administrator enforcement. Block force pushes and branch
  deletion. The owner-led workflow requires zero reviewer approvals on GitHub.
  Independently review consequential work and verify hosting settings before
  integration.
- Local commits are permitted for authorized work. Push, merge and release each
  require authorization. A published GitHub release triggers npm publication.
  Follow [RELEASE.md](RELEASE.md) and preserve the verified tarball identity.
- Use ignored `.dev/` for active plans, experiments and review evidence. Keep
  evidence needed for phase acceptance through the initiating maintainer's
  closure decision, then consolidate or remove obsolete scratch records.
  Acceptance, integration and publication are separate decisions.
