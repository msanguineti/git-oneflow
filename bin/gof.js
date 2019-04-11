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

var program = _interopDefault(require("commander")), shell = _interopDefault(require("shelljs")), version = "0.1.0";

shell.which("git") || (shell.echo("Sorry, git-OneFlow requires git... it's in the name"), 
shell.exit(1)), program.version(version, "-v, --version").description("CLI tools for git-OneFlow").command("init", "Create a config file").parse(process.argv);
