# Releasing and maintenance

This procedure releases the npm package, not a project's `gof finish release`
command. Publication, tags and GitHub releases require explicit owner authorization.
The proposed next version is 4.0.0 because the changes since 3.1.0 include breaking
behavior; the owner must confirm the version, release tag and npm distribution tag.

## Owner setup

An npm package administrator configures a trusted publisher for `git-oneflow`:
GitHub Actions, organization/user `msanguineti`, repository `git-oneflow`, workflow
filename `npm-publish.yml`, no environment name, and allow direct `npm publish`.
Fields are case-sensitive. Confirm the repository URL in package.json matches the
publishing repository. The publishing job uses a GitHub-hosted runner, Node 26,
npm 11.5.1 or newer and `id-token: write`. Saving the configuration does not test
OIDC; authentication is verified only by a real authorized publication. Review npm's
[trusted publisher instructions](https://docs.npmjs.com/trusted-publishers/) and
package access settings. Create the publisher close to the authorized first release:
a new configuration expires unless its first successful publish completes within
two days. If expired, delete it and create a new one before that release. Do not
publish merely to prevent expiry. Do not retain a write token as a workflow fallback.

## Candidate and publication

Pull requests exercise the same packing, artifact transfer and installed-package
matrix used for releases. Each consumer logs the verified SHA-256 digest. The
publishing job runs only for a published release, after that matrix succeeds;
pull requests cannot run it.

1. Before a release, check [Node lifecycle](https://nodejs.org/en/about/previous-releases),
   Git/platform constraints, dependency updates and security advisories. Align
   engines, setup, CI and documentation when supported lines change. Dependabot and
   the existing checks remain in use; run the checks in CONTRIBUTING.md.
2. Confirm the version and release type with the owner. GitHub pre-releases publish
   under npm's `next` tag; stable GitHub releases publish under `latest`. The workflow
   selects the npm tag automatically from the GitHub pre-release checkbox. For a
   release candidate, use a package version such as `4.0.0-rc.1` and matching GitHub
   tag `v4.0.0-rc.1`. Users can install it with `npm install -g git-oneflow@next`.
   Prepare release notes from the draft below and
   verify the candidate commit, version and `v<version>` tag match. Confirm the
   current branch protection and required `checks` job before integration.
3. After integration and explicit publication authorization, create the matching
   tag and publish a GitHub release. This triggers the release workflow. It checks
   the source, packs once, checks that tarball on the supported matrix and publishes
   the same bytes only after every leg succeeds. Retain the workflow run and artifact
   digest as release evidence. A successful dry run does not prove npm authentication.
4. Inspect the workflow and npm registry version, distribution tag and integrity.
   Compare registry integrity to the retained tarball (for example, using
   `npm view git-oneflow@<version> dist.integrity` and calculate the retained tarball's SHA-512 directly). Confirm
   the installed package and release notes are available.

If publishing fails or its outcome is uncertain, inspect the workflow and registry
before retrying. npm versions cannot be overwritten. If the version exists, verify
its integrity and tag; use a known prior package or publish a corrected new version
with authorization. Do not rewrite users' repositories. If no version was published,
correct the cause and repeat the authorized release workflow after verifying the tag
and artifact. A release workflow rerun creates and verifies a new candidate.

## Draft release notes for 4.0.0

- Requires Node.js 22.8.0 or newer; maintained LTS and newer non-EOL stable lines
  are supported. Linux, macOS and Windows installed-package workflows run in CI.
- Git commands use argument-based execution and stop on failures. Earlier successful
  operations are not rolled back; inspect Git state before recovery.
- Configuration values are validated and typed; invalid values and explicit files
  fail instead of being silently accepted. Command-line options override config.
- The package ships readable TypeScript-compiled JavaScript and no longer needs
  ShellJS, Rollup or the former color helper. Terminal colors use Node's detection.
- These changes may break older Node installations and configurations that relied
  on previously accepted invalid values or failure behavior.
