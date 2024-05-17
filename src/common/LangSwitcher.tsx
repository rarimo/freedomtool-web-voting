import { Button, ButtonProps } from '@mui/material'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { setDayjsLocal } from '@/helpers'
import { uiStore } from '@/store'
import { UiIcon } from '@/ui'

type Props = ButtonProps

export default function LangSwitcher({ ...rest }: Props) {
  const { t, i18n } = useTranslation()

  const switchLocale = useCallback(async () => {
    // TODO: change after adding new language
    const nextLang = i18n.language === 'en' ? 'en' : 'en'
    await i18n.changeLanguage(nextLang)
    uiStore.setLocale(nextLang)

    setDayjsLocal(i18n.language)
  }, [i18n])

  return (
    <Button
      {...rest}
      variant='text'
      startIcon={<UiIcon componentName='language' />}
      onClick={switchLocale}
    >
      {
        {
          ru: t('lang-switcher.ru'),
          en: t('lang-switcher.en'),
        }[i18n.language]
      }
    </Button>
  )
}
