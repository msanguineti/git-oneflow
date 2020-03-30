import inquirer from 'inquirer'

export const askInput = ({
  message,
  name,
  defaultValues,
  when,
  validate,
}: {
  message: string
  name: string
  defaultValues?: string | boolean | undefined
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
    default: defaultValues ?? undefined,
    when,
    validate,
  }
}

export const presentChoices = ({
  message,
  name,
  choices,
}: {
  message: string
  name: string
  choices: string[]
}): inquirer.ListQuestion => {
  return {
    type: 'list',
    name,
    message,
    choices,
  }
}

export const askConfirmation = ({
  message,
  name,
  defaultValue = true,
}: {
  message: string
  name: string
  defaultValue?: boolean
}): inquirer.ConfirmQuestion => {
  return {
    type: 'confirm',
    name,
    message,
    default: defaultValue,
  }
}

export const promptUser = async (
  questions: inquirer.Question[]
): Promise<inquirer.Answers> => {
  return inquirer.prompt(questions)
}
