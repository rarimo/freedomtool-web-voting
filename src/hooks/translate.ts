import { useTranslation } from 'react-i18next'

import { useUiState } from '@/store'

export const useTranslate = () => {
  const { locale } = useUiState()

  const { t, ...rest } = useTranslation(locale)

  return {
    t,
    ...rest,
  }
}
