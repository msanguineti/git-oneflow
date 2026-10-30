# Releasing and maintenance

GitHub Actions publishes this project to the public npm registry when a GitHub
release is published. This guide is for package maintainers. The CLI command
`gof finish release` manages branches in a user's repository; it does not publish
this npm package.

## Configure npm publishing

In the `git-oneflow` package settings on npmjs.org, add a trusted publisher with:

- Provider: GitHub Actions
- Organization or user: `msanguineti`
- Repository: `git-oneflow`
- Workflow filename: `npm-publish.yml`
- Environment: leave blank
- Allowed action: direct `npm publish`

The workflow uses OIDC authentication on a GitHub-hosted runner; it does not need
an npm token secret. Its publishing job uses Node 26, npm 11.5.1 or newer and
`id-token: write`. The repository URL in `package.json` must match the publishing
repository.

Configure the publisher shortly before the first release. A new configuration
expires unless its first successful publish completes within two days. Delete and
recreate an expired configuration when ready to release. Saving the settings or
running a dry run does not verify authentication.

See npm's [trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/)
for current requirements and package access settings.

## Prepare a release

1. Update the version in `package.json` and `package-lock.json` together with
   `npm version <version> --no-git-tag-version`. This updates the files without
   creating a commit or tag. For a release candidate, use `4.0.0-rc.1`; use `4.0.0`
   for the corresponding stable release. Commit the change through the normal PR
   workflow. Prepare release notes describing changes and any breaking behavior.
2. Run the checks in [CONTRIBUTING.md](CONTRIBUTING.md), open a pull request and
   merge after the required checks pass. PRs test packing, artifact transfer and
   installed-package behavior on the same platform matrix used for publishing.
3. In the GitHub release form, create a tag named `v<version>` on the checked
   commit on `main` after the version PR is merged. The workflow rejects a tag
   that does not match the package version.
4. Publish the GitHub release for that tag. Select **Set as a pre-release** for a
   release candidate. GitHub Actions chooses the npm distribution tag automatically:

   | GitHub release | Example version | npm tag  |
   | -------------- | --------------- | -------- |
   | Pre-release    | `4.0.0-rc.1`    | `next`   |
   | Stable release | `4.0.0`         | `latest` |

The workflow checks the source, packs one tarball, verifies its SHA-256 digest and
installed behavior across supported runtimes/platforms, then publishes those same
bytes after every matrix job succeeds. Each consumer logs the verified digest.
PRs cannot run the publishing job.

## Verify publication and recover from failures

Check the workflow result, npm version, distribution tag and package integrity.
Use `npm view git-oneflow@<version> dist.integrity` and compare it with the retained
tarball's SHA-512 integrity. Keep the workflow run and artifact digest with the
release record. Check that the release notes and published package are available.
Pre-releases can be installed with `npm install -g git-oneflow@next`.

If publication fails or the outcome is uncertain, inspect the workflow and npm
registry before retrying. If the version already exists, verify its integrity and
distribution tag. npm versions cannot be overwritten; users can select a known
prior version while a correction is prepared under a new version number.

If no version was published, correct the cause, recheck the tag and source, and
rerun the release workflow. A rerun builds and verifies a new candidate. A failure
in this publishing workflow does not require changes to users' Git repositories.

## Ongoing maintenance

Before releases and during maintenance, check the [Node release schedule](https://nodejs.org/en/about/previous-releases),
Git/platform behavior, dependency updates and security advisories. When dropping
an EOL Node line, update package engines, local setup, CI and documentation together.
Use the checks in CONTRIBUTING.md and review Dependabot updates.
