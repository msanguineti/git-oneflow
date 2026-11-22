# Using git-OneFlow

Run git-OneFlow from a trusted Git repository. JavaScript and TypeScript
configuration can execute code before its values are validated. Git also uses
the invoking user's PATH and Git configuration, including hooks, editors and
transports.

## Branch workflows

The default workflow uses a single local `main` branch. If you configure a
separate development branch, features start from and finish onto that branch by
default. Releases still start from `main` and finish onto the development branch
by default.

### Pushing and branch deletion

By default, finishing a branch pushes to `origin`, deletes the local working
branch and asks whether to delete the matching remote branch. The confirmation
defaults to yes. Use `--no-push --no-delete` to keep the operation local and
retain the working branch. `--no-push` alone still allows the remote deletion
prompt.

### Feature branches

With the defaults, this creates and checks out `feature/my-feature` from `main`.

```sh
gof start feature my-feature
```

By default, finishing a feature interactively rebases it onto `main`,
fast-forwards `main`, pushes `main` to `origin` and deletes the local feature
branch. Rebasing can rewrite commit history. Review Git's
[guidance for shared branches](https://git-scm.com/book/en/v2/Git-Branching-Rebasing#_rebase_peril)
before rebasing commits others use.

```sh
gof finish feature my-feature
```

### Release and hotfix branches

Release branch names use the `release/` prefix. This starts `release/2.3.0`
from `main`.

```sh
gof start release 2.3.0
```

When using a separate development branch, the default still starts a release
from `main`. To include development work, select the development branch or a
specific development commit with `--ref`.

```sh
gof start release 2.3.0 --ref develop
```

In the single-main workflow, finish the release after committing the release
changes. This example tags the release tip, merges into `main` and pushes
`main` and reachable annotated tags to `origin`. It then deletes the local
release branch and prompts for remote deletion. Review the tags before running
it, since the push can include other reachable annotated tags.

```sh
gof finish release 2.3.0 -t 2.3.0
```

A hotfix starts from the nearest annotated tag reachable from the current HEAD,
as selected by `git describe --abbrev=0`, or from `main` if none is reachable.
Hotfix branch names use the `hotfix/` prefix. Use `--ref` to select a different
starting point.

`finish hotfix` requires `--onto <local-branch>`. When a release branch is open,
target that branch so its eventual release tag includes the fix. Otherwise, target
your main or development branch. A missing or invalid target stops the command
before checkout, tagging, merging or pushing.

For example, in the single-main workflow, integrate the committed fix on
`hotfix/2.3.1` into the open `release/2.4.0` branch, then finish that release
when ready. These commands retain the branches and keep both tags local.

```sh
gof finish hotfix 2.3.1 --onto release/2.4.0 --tag 2.3.1 --no-push --no-delete
gof finish release 2.4.0 --tag 2.4.0 --no-push --no-delete
```

When a development branch is configured, the CLI asks whether to fast-forward
`main` to the tag or working branch after merging into the first target. With
pushing enabled, the first push can already send the tag to `origin` before
that prompt. Confirm only when you want to advance production and the selected
commit can fast-forward `main`. If the fast-forward fails, inspect the first
target and remote because earlier steps may already have succeeded.

### Tags

Use `--tag <name>` (or `-t <name>`) to tag the release or hotfix commit.
Tags are annotated with the tag name by default. Use `--message <text>` to
change the annotation, or pass an empty message to create a lightweight tag.
Without `--tag`, the tool asks for a tag name by default. Use `--no-tag`
to skip tagging.

If both `--tag` and `--no-tag` are supplied, the last occurrence wins. The same
ordering applies to positive/negative option pairs such as `--push` and
`--no-push`. Use only the form you intend.

## Configuration

```sh
gof init
```

`init` asks for your configuration and writes it to `.git-oneflowrc`. Configuration
discovery uses [`cosmiconfig`](https://www.npmjs.com/package/cosmiconfig).
If it finds an existing configuration, `init` leaves it in place unless you
supply `--force`. With `--force`, it writes `.git-oneflowrc` in the current
directory and can overwrite that file.

Use `--config <file>` (or `-c <file>`) to select a configuration file.

```sh
gof start feature my-feature -c config/my-gof-config.json
```

An explicit `--config` file replaces the discovered configuration; omitted keys use
the defaults. Command-line options take precedence over the selected file. Boolean
settings must be JSON booleans, and branch prefixes may be empty strings. Invalid
keys, types, strategies, or explicit files cause the command to fail.

Export the configuration as the default export of a `.ts` file. TypeScript
configuration uses Node.js type stripping, which supports syntax such as type
annotations and interfaces. For syntax that needs compilation, such as enums,
use JavaScript or JSON configuration instead.

In YAML configuration, replace `<<` merge keys with the explicit settings they
supplied. The YAML loader treats `<<` as an ordinary key.

### Configuration options

| Option               | Description                                                       | Default   |
| -------------------- | ----------------------------------------------------------------- | --------- |
| `main`               | Existing main (production) branch                                 | `main`    |
| `development`        | Existing development branch; omit for a single-main workflow      | Not set   |
| `features`           | Feature branch prefix                                             | `feature` |
| `releases`           | Release branch prefix                                             | `release` |
| `hotfixes`           | Hotfix branch prefix                                              | `hotfix`  |
| `strategy`           | Feature integration strategy: `rebase`, `rebase-no-ff` or `no-ff` | `rebase`  |
| `interactive`        | Use interactive rebase                                            | `true`    |
| `pushAfterMerge`     | Push to `origin` after finishing                                  | `true`    |
| `deleteAfterMerge`   | Delete the working branch after integration                       | `true`    |
| `tagCommit`          | Ask for a release or hotfix tag when none was supplied            | `true`    |
| `askOnFeatureStart`  | Ask which branch to start a feature from                          | `false`   |
| `askOnFeatureFinish` | Ask which branch to integrate a feature into                      | `false`   |

Branch prefixes must produce valid Git branch names. For example, the default
`features` value produces `feature/my-feature`; an empty prefix produces
`my-feature`. Boolean values must be `true` or `false`, without quotes.

### Generate default file

To create a configuration file with default values:

```sh
gof init -y
```

The generated `.git-oneflowrc` contains these defaults.

```json
{
  "main": "main",
  "features": "feature",
  "releases": "release",
  "hotfixes": "hotfix",
  "strategy": "rebase",
  "interactive": true,
  "deleteAfterMerge": true,
  "pushAfterMerge": true,
  "tagCommit": true,
  "askOnFeatureStart": false,
  "askOnFeatureFinish": false
}
```

## Commands

Use `start` or `finish` with `feature`, `release` or `hotfix`. Each
subcommand accepts options to override its defaults. Run the subcommand
with `--help` to see its options and examples. Terminal colors respect
Node.js’s `NO_COLOR` and `FORCE_COLOR` environment variables.

### Common options to start and finish subcommands

| Option flag           | Description                     |
| --------------------- | ------------------------------- |
| -c, --config \<file\> | configuration file to use       |
| -b, --base \<name\>   | override the branch-name prefix |
| --no-base             | omit the branch-name prefix     |

These options apply to the feature, release and hotfix subcommands of `start`
and `finish`; they do not apply to `init` or the parent commands.

### The `start` command

```sh
gof start <feature|release|hotfix> [options] [name]
```

Commands can be shortened using the initial letter.

```sh
gof s f -h # => gof start feature --help
```

#### `start` options

| Option flag       | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| -r, --ref \<ref\> | new branch will be created from the given branch, commit or tag |
| --no-ref          | create the new branch from the current branch                   |

### The `finish` command

```sh
gof finish <feature|release|hotfix> [options] [name]
```

#### Common `finish` options

| Option flag        | Description                                          |
| ------------------ | ---------------------------------------------------- |
| -o,--onto \<onto\> | branch to merge or rebase onto (required for hotfix) |
| -p,--push          | push to origin after merge                           |
| --no-push          | skip pushing the integration branch and its tags     |
| -d,--delete        | delete branch after merge                            |
| --no-delete        | do not delete branch                                 |

#### `finish feature` options

| Option flag                | Description                 |
| -------------------------- | --------------------------- |
| -i,--interactive           | interactive rebase          |
| --no-interactive           | do not rebase interactively |
| -s,--strategy \<strategy\> | merge strategy              |

#### `finish release` and `finish hotfix` options

| Option flag          | Description                                           |
| -------------------- | ----------------------------------------------------- |
| -t,--tag \<tagName\> | tag the commit with the given tag                     |
| --no-tag             | do not tag the commit                                 |
| -m,--message \<msg\> | annotate tag with a message (default to the tag name) |

## Preview commands

Use `--dry-run` on a start or finish subcommand to show intended Git changes
without making them. Read-only Git queries and prompts still run. `init` writes
a configuration file and has no dry-run option.

You can also enable dry-run mode with the `GOF_DRY_RUN` environment variable.

```sh
GOF_DRY_RUN=1 gof start release 4.0.0
```

In Windows Command Prompt, use the following command.

```sh
set "GOF_DRY_RUN=1" & gof start release 4.0.0
set "GOF_DRY_RUN="
```

## Recover from a failed command

Git failures stop the workflow and return a nonzero exit status. Earlier successful
steps are not rolled back. If a rebase conflicts, resolve the files and run
`git rebase --continue`, or use `git rebase --abort` to return to the state before
that rebase. For a merge conflict, resolve and commit it or use `git merge --abort`
while the merge is in progress. Inspect `git status`, branches, tags and any remote
updates before continuing.
After resolving or aborting the conflict, finish the remaining Git operations
explicitly.
