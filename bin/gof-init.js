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

var program = _interopDefault(require("commander")), shell = _interopDefault(require("shelljs")), inquirer = _interopDefault(require("inquirer")), chalk = _interopDefault(require("chalk"));

const defaultValues = {
    main: "master",
    usedev: !1,
    feature: "feature",
    release: "release",
    hotfix: "hotfix",
    integration: 1,
    interactive: "always"
}, questions = [ {
    name: "main",
    type: "input",
    message: "Main (production) branch:",
    default: "master",
    validate: e => checkBranchName(e)
}, {
    name: "usedev",
    type: "confirm",
    default: !1,
    message: "Do you use a development branch?"
}, {
    name: "development",
    type: "input",
    message: "Development branch:",
    default: "develop",
    when: function(e) {
        return e.usedev;
    },
    validate: e => checkBranchName(e)
}, {
    name: "feature",
    type: "input",
    message: "Feature branch:",
    default: "feature",
    validate: e => checkBranchName(e)
}, {
    name: "release",
    type: "input",
    message: "Release branch:",
    default: "release",
    validate: e => checkBranchName(e)
}, {
    name: "hotfix",
    type: "input",
    message: "Hotfix branch:",
    default: "hotfix",
    validate: e => checkBranchName(e)
}, {
    type: "list",
    name: "integration",
    message: "Which feature branch integration method do you want to use?",
    default: 3,
    choices: [ {
        name: "Integrate feature branch with main/development using rebase (rebase -> merge --ff-only).",
        value: 1,
        short: "rebase"
    }, {
        name: "Feature is merged in main/development à la GitFlow (merge --no-ff).",
        value: 2,
        short: "merge --no-ff"
    }, {
        name: "Mix the previous: rebase and merge (rebase -> merge --no-ff).",
        value: 3,
        short: "rebase + merge --no-ff"
    } ]
}, {
    name: "interactive",
    type: "expand",
    message: "Do you want to use rebase interactively (rebase -i)?",
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
} ];

async function runProgram() {
    if (program.defaultValues) generateConfigFile(defaultValues); else try {
        const e = await inquirer.prompt(questions);
        await askConfirmationBeforeWrite() && generateConfigFile(e);
    } catch (e) {
        console.error(e);
    }
}

async function askConfirmationBeforeWrite() {
    return await inquirer.prompt([ {
        type: "confirm",
        name: "write",
        message: "Write config file?"
    } ]);
}

function generateConfigFile(e) {
    const a = [];
    a.push("module.exports = {");
    for (const n in e) if (e.hasOwnProperty(n)) {
        const t = "string" == typeof e[n] ? `'${e[n]}'` : e[n];
        a.push(`\t// ${getCommentFor(n)}\n\t${n}: ${t},`);
    }
    a.push("}\n"), shell.ShellString(a).to("gof.config.js"), shell.echo(chalk.black.bgGreen.bold(`Done! File created at ${process.cwd()}/gof.config.js`));
}

function checkBranchName(e) {
    return 0 === shell.exec(`git check-ref-format "refs/heads/${e}"`, {
        silent: !0
    }).code || "Please, choose a valid name for the branch";
}

function getCommentFor(e) {
    switch (e) {
      case "main":
        return "Main (production) branch name";

      case "usedev":
        return "Use development branch?";

      case "develop":
        return "Development branch name";

      case "release":
        return "Release branch name";

      case "hotfix":
        return "Hotfix branch name";

      case "feature":
        return "Feature branch name";

      case "integration":
        return "Integration method to use (see https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow#feature-branches)";

      case "interactive":
        return "Use interactve rebase (git rebase -i)?";
    }
}

program.option("-y, --default-values", "Generate a default config file").action(() => runProgram()).parse(process.argv);
