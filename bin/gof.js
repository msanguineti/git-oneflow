#!/usr/bin/env node

/**
 * Copyright (c) 2019 Mirco Sanguineti
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

"use strict";

function _interopDefault(e) {
    return e && "object" == typeof e && "default" in e ? e.default : e;
}

var yargs = _interopDefault(require("yargs")), sh = _interopDefault(require("shelljs")), inquirer = _interopDefault(require("inquirer")), findUp = _interopDefault(require("find-up")), chalk = _interopDefault(require("chalk")), path = require("path");

const success = e => chalk.black.bgGreen(e), error = e => chalk.black.bgRed(e), info = e => chalk.black.bgCyan(e);

function getDefaultConfigValues() {
    return {
        ...defaultConfigValues,
        ...loadConfigValues()
    };
}

function loadConfigFile(e) {
    if (!e || !sh.test("-f", e)) return defaultConfigValues;
    const a = ".js" === getFileExt(e) ? require(e) : JSON.parse(sh.sed(/(\/\*[\w\W]+\*\/|(\/\/.*))/g, "", e));
    return {
        ...defaultConfigValues,
        ...a
    };
}

function loadConfigValues() {
    return loadConfigFile(findUp.sync(defaultConfigFileNames) || void 0);
}

function writeConfigFile({file: e = defaultConfigFileName, data: a = defaultConfigValues}) {
    let n;
    switch (getFileExt(e)) {
      case ".js":
        n = [ "module.exports = {", ...generateCommentedValues(a), "}" ].join("\n");
        break;

      case ".json":
        n = JSON.stringify(a, null, 2);
        break;

      default:
        return console.error(error(`Cannot write to ${e}. Supported extensions: ${supportedExtensions}`)), 
        !1;
    }
    return sh.ShellString(n).to(e), console.log(`Values written to: ${info(e)}`), !0;
}

function isValidBranchName(e) {
    return checkGitRefFormat(`refs/heads/${e}`);
}

function checkGitRefFormat(e) {
    return 0 === sh.exec(`git check-ref-format "${e}"`, {
        silent: !0
    }).code;
}

const defaultConfigValues = {
    main: "master",
    usedev: !1,
    feature: "feature",
    release: "release",
    hotfix: "hotfix",
    integration: 1,
    interactive: "always",
    push: "always"
}, defaultConfigFileName = "gof.config.js", defaultConfigFileNames = [ defaultConfigFileName, ".gofrc.js", ".gofrc.json" ], supportedExtensions = [ ".js", ".json" ];

function getCommentFor(e) {
    switch (e) {
      case "main":
        return "Main (production) branch name. Default `master`";

      case "usedev":
        return "Use development branch? Default `false`";

      case "development":
        return "Development branch name. Default `develop`";

      case "release":
        return "Release branch name. Default: `release`";

      case "hotfix":
        return "Hotfix branch name. Default: `hotfix`";

      case "feature":
        return "Feature branch name. Default: `feature`";

      case "integration":
        return "Integration method to use (see https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow#feature-branches). Options: [`1`, `2`, `3`]. Default: `1`.";

      case "interactive":
        return "Use interactve rebase (`git rebase -i` only valid for integration === 1 || 3)? Options: [`always`, `never`, `ask`]. Default: `always`.";

      case "push":
        return "Push to origin after finishing feature/hotfix/release? Options: [`always`, `never`, `ask`]. Default: `always`.";

      default:
        return "";
    }
}

function getFileExt(e) {
    return path.extname(e);
}

function generateCommentedValues(e) {
    const a = [];
    for (const n in e) if (e.hasOwnProperty(n)) {
        const t = "string" == typeof e[n] ? `"${e[n]}"` : e[n];
        a.push(`\t/** ${getCommentFor(n)} */\n\t${n}: ${t},`);
    }
    return a;
}

var init = {
    command: "init [options]",
    desc: "Generate a config file",
    builder: e => e.option("y", {
        alias: "default-values",
        describe: "Auto-generate config file using default values. These values WILL NOT overwrite existing values!"
    }),
    handler: async function(e) {
        try {
            const a = e.defaultValues ? getDefaultConfigValues() : await inquirer.prompt(generateQuestions(e));
            console.log(JSON.stringify(a, null, 2)), e.dryRun || (e.defaultValues || await askConfirmationBeforeWrite()) && writeConfigFile({
                data: a
            }) && console.log(success("Initialisation done!"));
        } catch (e) {
            console.error(error(e));
        }
    }
};

function generateQuestions(e) {
    return [ {
        name: "main",
        type: "input",
        message: "Main (production) branch:",
        default: e.main || "master",
        validate: e => isValidBranchName(e) || "Please, choose a valid name for the branch"
    }, {
        name: "usedev",
        type: "confirm",
        default: e.usedev || !1,
        message: "Do you use a development branch?"
    }, {
        name: "development",
        type: "input",
        message: "Development branch:",
        default: e.development || "develop",
        when: function(e) {
            return e.usedev;
        },
        validate: e => isValidBranchName(e) || "Please, choose a valid name for the branch"
    }, {
        name: "feature",
        type: "input",
        message: "Feature branch:",
        default: e.feature || "feature",
        validate: e => isValidBranchName(e) || "Please, choose a valid name for the branch"
    }, {
        name: "release",
        type: "input",
        message: "Release branch:",
        default: e.release || "release",
        validate: e => isValidBranchName(e) || "Please, choose a valid name for the branch"
    }, {
        name: "hotfix",
        type: "input",
        message: "Hotfix branch:",
        default: e.hotfix || "hotfix",
        validate: e => isValidBranchName(e) || "Please, choose a valid name for the branch"
    }, {
        type: "list",
        name: "integration",
        message: "Which feature branch integration method do you want to use?",
        default: e.integration - 1 || 1,
        choices: [ {
            name: "Integrate feature branch with main/development using rebase (rebase -> merge --ff-only).",
            value: 1,
            short: "rebase"
        }, {
            name: "Feature is merged in main/development à la GitFlow (merge --no-ff).",
            value: 2,
            short: "merge --no-ff"
        }, {
            name: "Mix the previous two: rebase and merge (rebase -> merge --no-ff).",
            value: 3,
            short: "rebase + merge --no-ff"
        } ]
    }, {
        name: "interactive",
        type: "expand",
        message: "Do you want to use rebase interactively (rebase -i)?",
        default: e.interactive || "always",
        choices: [ {
            key: "y",
            name: "Always",
            value: "always"
        }, {
            key: "n",
            name: "Never",
            value: "never"
        }, {
            key: "a",
            name: "Ask me every time",
            value: "ask"
        } ],
        when: function(e) {
            return 2 !== e.integration;
        }
    }, {
        name: "push",
        type: "expand",
        message: "Do you want to push to origin after merging?",
        default: e.push || "always",
        choices: [ {
            key: "y",
            name: "Always",
            value: "always"
        }, {
            key: "n",
            name: "Never",
            value: "never"
        }, {
            key: "a",
            name: "Ask me every time",
            value: "ask"
        } ]
    } ];
}

async function askConfirmationBeforeWrite() {
    return (await inquirer.prompt([ {
        type: "confirm",
        name: "write",
        message: "Write to config file?"
    } ])).write;
}

var start = {
    command: "start <featureBranch> [options]",
    desc: "Start a new feature",
    builder: e => e.option("i", {
        alias: "interactive",
        describe: "Rebase using `rebase -i`. It applies only if `integration` option is set to 1 or 3"
    }),
    handler: e => {}
}, finish = {
    command: "finish <featureBranch> [options]",
    desc: "Finish a feature",
    builder: e => {},
    handler: e => {}
}, feature = {
    command: "feature <command>",
    desc: "Manage starting and finishing features",
    builder: function(e) {
        return e.command(start).command(finish);
    },
    handler: function(e) {}
};

sh.which("git") || (console.error("Sorry, git-OneFlow requires git... it's in the name"), 
process.exit(1));

var argv = yargs.version().alias("v", "version").config(loadConfigValues()).pkgConf("git-oneflow").command(init).command(feature).option("x", {
    alias: "dry-run",
    description: "Show what the command would do"
}).help().alias("h", "help").argv;

argv._.length <= 0 && console.log(`Try ${path.basename(process.argv[1])} --help`);
