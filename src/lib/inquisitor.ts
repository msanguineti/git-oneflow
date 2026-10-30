import inquirer, { type Answers, type DistinctQuestion } from 'inquirer'

export type GofQuestion = DistinctQuestion<Answers>
type InputQuestion = Extract<GofQuestion, { type: 'input' }>
type SelectQuestion = Extract<GofQuestion, { type: 'select' }>
type ConfirmQuestion = Extract<GofQuestion, { type: 'confirm' }>

export const askInput = ({
  message,
  name,
  defaultValue,
  when,
  validate,
}: {
  message: string
  name: string
  defaultValue?: string | boolean
  when?: (answer: Answers) => boolean
  validate?: (input: string) => string | boolean | Promise<string | boolean>
}): InputQuestion => {
  return {
    type: 'input',
    name,
    message,
    default: defaultValue === undefined ? undefined : String(defaultValue),
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
  choices: string[] | ((answer: Answers) => string[])
  when?: (answer: Answers) => boolean
  defaultValue?: string
}): SelectQuestion => {
  return {
    type: 'select',
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
  when?: (answer: Answers) => boolean
}): ConfirmQuestion => {
  return {
    type: 'confirm',
    name,
    message,
    default: defaultValue,
    when,
  }
}

export const promptUser = async (
  questions: GofQuestion[],
): Promise<Answers> => {
  return inquirer.prompt(questions)
}
