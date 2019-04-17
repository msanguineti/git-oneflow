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

var program = _interopDefault(require("yargs")), sh = _interopDefault(require("shelljs")), chalk = _interopDefault(require("chalk")), inquirer = _interopDefault(require("inquirer")), findUp = _interopDefault(require("find-up")), path = require("path");

const success = e => chalk.black.bgGreen(e), error = e => chalk.black.bgRed(e);

function getDefaultConfigValues() {
    return {
        ...defaultConfigValues
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
    let t;
    switch (getFileExt(e)) {
      case ".js":
        t = [ "module.exports = {", ...generateCommentedValues(a), "}" ];
        break;

      case ".json":
        t = JSON.stringify(a, null, 2);
        break;

      default:
        return sh.echo(error(`Cannot write to ${e}. Supported extensions: ${supportedExtensions}`)), 
        !1;
    }
    return sh.ShellString(t).to(e), sh.echo(`Values written to: ${e}`), !0;
}

function checkBranchName(e) {
    return 0 === sh.exec(`git check-ref-format "refs/heads/${e}"`, {
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

      case "develop":
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
    for (const t in e) if (e.hasOwnProperty(t)) {
        const n = "string" == typeof e[t] ? `"${e[t]}"` : e[t];
        a.push(`\t/** ${getCommentFor(t)} */\n\t${t}: ${n},`);
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
            sh.echo(JSON.stringify(a, null, 2)), e.dryRun || (e.defaultValues || await askConfirmationBeforeWrite()) && writeConfigFile({
                data: a
            }) && sh.echo(success("Initialisation done!"));
        } catch (e) {
            sh.echo(error(e));
        }
    }
};

function generateQuestions(e) {
    return [ {
        name: "main",
        type: "input",
        message: "Main (production) branch:",
        default: e.main || "master",
        validate: e => checkBranchName(e) || "Please, choose a valid name for the branch"
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
        validate: e => checkBranchName(e) || "Please, choose a valid name for the branch"
    }, {
        name: "feature",
        type: "input",
        message: "Feature branch:",
        default: e.feature || "feature",
        validate: e => checkBranchName(e) || "Please, choose a valid name for the branch"
    }, {
        name: "release",
        type: "input",
        message: "Release branch:",
        default: e.release || "release",
        validate: e => checkBranchName(e) || "Please, choose a valid name for the branch"
    }, {
        name: "hotfix",
        type: "input",
        message: "Hotfix branch:",
        default: e.hotfix || "hotfix",
        validate: e => checkBranchName(e) || "Please, choose a valid name for the branch"
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

sh.which("git") || (sh.echo("Sorry, git-OneFlow requires git... it's in the name"), 
sh.exit(1)), program.version().alias("v", "version").config(loadConfigValues()).pkgConf("git-oneflow").command(init).option("x", {
    alias: "dry-run",
    description: "Show what the command would do"
}).demandCommand(1, chalk.red.bold("Please, choose a command")).help().alias("h", "help").argv;
