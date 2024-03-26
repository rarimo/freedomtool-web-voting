import { Button, ButtonProps } from '@mui/material'
import upperCase from 'lodash/upperCase'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { uiStore } from '@/store'
import { UiIcon } from '@/ui'

type Props = ButtonProps

export default function LangSwitcher({ ...rest }: Props) {
  const { i18n } = useTranslation()

  const switchLocale = useCallback(async () => {
    const nextLang = i18n.language === 'en' ? 'ru' : 'en'
    await i18n.changeLanguage(nextLang)
    uiStore.setLocale(nextLang)
  }, [i18n])

  return (
    <Button
      {...rest}
      variant='text'
      startIcon={<UiIcon componentName='language' />}
      onClick={switchLocale}
    >
      {upperCase(i18n.language)}
    </Button>
  )
}
