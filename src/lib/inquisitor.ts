import inquirer from 'inquirer'

export type GofQuestion = inquirer.Question

export const askInput = ({
  message,
  name,
  defaultValue,
  when,
  validate,
}: {
  message: string
  name: string
  defaultValue?: string | boolean | undefined
  when?: (answer: inquirer.Answers) => boolean
  validate?: (
    input: string,
    answer: inquirer.Answers
  ) => string | boolean | Promise<string | boolean>
}): inquirer.InputQuestion => {
  return {
    type: 'input',
    name,
    message,
    default: defaultValue,
    when,
    validate,
  }
}

export const presentChoices = ({
  message,
  name,
  choices,
  when,
  defaultValue,
}: {
  message: string
  name: string
  choices: string[] | ((answer: inquirer.Answers) => string[])
  when?: (answer: inquirer.Answers) => boolean
  defaultValue?: string
}): inquirer.ListQuestion => {
  return {
    type: 'list',
    name,
    message,
    choices,
    when,
    default: defaultValue,
  }
}

export const askConfirmation = ({
  message,
  name,
  defaultValue = true,
  when,
}: {
  message: string
  name: string
  defaultValue?: boolean
  when?: (answer: inquirer.Answers) => boolean
}): inquirer.ConfirmQuestion => {
  return {
    type: 'confirm',
    name,
    message,
    default: defaultValue,
    when,
  }
}

export const promptUser = async (
  questions: GofQuestion[]
): Promise<inquirer.Answers> => {
  return inquirer.prompt(questions)
}
