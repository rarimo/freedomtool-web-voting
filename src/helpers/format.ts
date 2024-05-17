import { Time, time, type TimeDate } from '@distributedlab/tools'
import enDayjsLocal from 'dayjs/locale/en'
import ruDayjsLocal from 'dayjs/locale/ru'

const FORMATTED_DID_MAX_LENGTH = 12

export const setDayjsLocal = (locale: string) => {
  const nextLocale = {
    ru: ruDayjsLocal,
    en: enDayjsLocal,
  }[locale]

  Time.locale(nextLocale)
}

export function formatDid(did: string) {
  return did.length > FORMATTED_DID_MAX_LENGTH ? did.slice(0, 8) + '...' + did.slice(-4) : did
}

export function formatDateDMY(date: TimeDate) {
  return new Time(date).format('DD MMM YYYY')
}

export function formatDateDMYT(date: TimeDate) {
  return new Time(date).format('DD MMM YYYY HH:mm')
}

export function formatDateDiff(dateEnd: TimeDate) {
  return time(dateEnd).fromNow
}
