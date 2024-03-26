import { PaletteMode } from '@mui/material'

import { createStore } from '@/helpers'
import { type LocaleResources } from '@/locales/resources'

type UiStore = {
  viewportWidth: number
  paletteMode: PaletteMode
  locale: LocaleResources
}

export const [uiStore, useUiState] = createStore(
  'ui',
  {
    viewportWidth: 0,
    paletteMode: 'light',
    locale: 'en',
  } as UiStore,
  state => ({
    setViewportWidth: (width: number) => {
      state.viewportWidth = width
    },
    setPaletteMode: (mode: PaletteMode) => {
      state.paletteMode = mode
    },
    clearUiStorage: () => {
      state.paletteMode = 'light'
      state.viewportWidth = 0
    },
    setLocale: (locale: LocaleResources) => {
      state.locale = locale
    },
  }),
)
