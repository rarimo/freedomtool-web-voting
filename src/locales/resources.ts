import en from './resources/en.json'
import ru from './resources/ru.json'

const resources = {
  en: {
    translation: {
      ...en,
    },
  },
  ru: {
    translation: {
      ...ru,
    },
  },
}

export default resources

export type LocaleResources = keyof typeof resources
