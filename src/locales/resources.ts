import en from './resources/en.json'

const resources = {
  en: {
    translation: {
      ...en,
    },
  },
}

export default resources

export type LocaleResources = keyof typeof resources
