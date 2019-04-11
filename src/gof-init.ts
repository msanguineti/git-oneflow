import program from 'commander'
import sh from 'shelljs'
import inquirer from 'inquirer'
import chalk from 'chalk'

const defaultValues = {
  main: 'master',
  usedev: false,
  feature: 'feature',
  release: 'release',
  hotfix: 'hotfix',
  integration: 1,
  interactive: 'always'
}

const questions = [
  {
    name: 'main',
    type: 'input',
    message: 'Main (production) branch:',
    default: 'master',
    validate: (value: string) => {
      return checkBranchName(value)
    }
  },
  {
    name: 'usedev',
    type: 'confirm',
    default: false,
    message: 'Do you use a development branch?'
  },
  {
    name: 'development',
    type: 'input',
    message: 'Development branch:',
    default: 'develop',
    when: function (answers: { [key: string]: any }) {
      return answers.usedev
    },
    validate: (value: string) => {
      return checkBranchName(value)
    }
  },
  {
    name: 'feature',
    type: 'input',
    message: 'Feature branch:',
    default: 'feature',
    validate: (value: string) => {
      return checkBranchName(value)
    }
  },
  {
    name: 'release',
    type: 'input',
    message: 'Release branch:',
    default: 'release',
    validate: (value: string) => {
      return checkBranchName(value)
    }
  },
  {
    name: 'hotfix',
    type: 'input',
    message: 'Hotfix branch:',
    default: 'hotfix',
    validate: (value: string) => {
      return checkBranchName(value)
    }
  },
  {
    type: 'list',
    name: 'integration',
    message: 'Which feature branch integration method do you want to use?',
    default: 3,
    choices: [
      {
        name:
          'Integrate feature branch with main/development using rebase (rebase -> merge --ff-only).',
        value: 1,
        short: 'rebase'
      },
      {
        name:
          'Feature is merged in main/development à la GitFlow (merge --no-ff).',
        value: 2,
        short: 'merge --no-ff'
      },
      {
        name: 'Mix the previous: rebase and merge (rebase -> merge --no-ff).',
        value: 3,
        short: 'rebase + merge --no-ff'
      }
    ]
  },
  {
    name: 'interactive',
    type: 'expand',
    message: 'Do you want to use rebase interactively (rebase -i)?',
    choices: [
      {
        key: 'y',
        name: 'Always',
        value: 'always'
      },
      {
        key: 'n',
        name: 'Never',
        value: 'never'
      },
      {
        key: 'a',
        name: 'Ask me every time',
        value: 'ask'
      }
    ],
    when: function (answers: { [key: string]: any }) {
      return answers.integration !== 2
    }
  }
]

program
  .option('-y, --default-values', 'Generate a default config file')
  .action(() => runProgram())
  .parse(process.argv)

async function runProgram() {
  if (program.defaultValues) {
    generateConfigFile(defaultValues)
  } else {
    try {
      const customValues = await inquirer.prompt(questions)
      const write = await askConfirmationBeforeWrite()

      if (write) {
        generateConfigFile(customValues)
      }
    } catch (err) {
      console.error(err)
    }
  }
}

async function askConfirmationBeforeWrite() {
  const write = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'write',
      message: 'Write config file?'
    }
  ])
  return write
}

function generateConfigFile(configValues: { [key: string]: any }) {
  const output: string[] = []

  output.push('module.exports = {')

  for (const key in configValues) {
    if (configValues.hasOwnProperty(key)) {
      const element =
        typeof configValues[key] === 'string'
          ? `'${configValues[key]}'`
          : configValues[key]

      output.push(`\t// ${getCommentFor(key)}\n\t${key}: ${element},`)
    }
  }
  output.push('}\n')

  // @ts-ignore
  sh.ShellString(output).to('gof.config.js')

  sh.echo(
    chalk.black.bgGreen.bold(
      `Done! File created at ${process.cwd()}/gof.config.js`
    )
  )
}

function checkBranchName(value: string) {
  const retCode = sh.exec(`git check-ref-format "refs/heads/${value}"`, {
    silent: true
  }).code
  return retCode === 0 || `Please, choose a valid name for the branch`
}

function getCommentFor(key: string) {
  switch (key) {
    case 'main':
      return 'Main (production) branch name'
    case 'usedev':
      return 'Use development branch?'
    case 'develop':
      return 'Development branch name'
    case 'release':
      return 'Release branch name'
    case 'hotfix':
      return 'Hotfix branch name'
    case 'feature':
      return 'Feature branch name'
    case 'integration':
      return 'Integration method to use (see https://www.endoflineblog.com/oneflow-a-git-branching-model-and-workflow#feature-branches)'
    case 'interactive':
      return 'Use interactve rebase (git rebase -i)?'
  }
}
