import { Typography, useTheme } from '@mui/material'
import { getOverrides, MuiMarkdown } from 'mui-markdown'

import { typography } from '@/theme/typography'

type Props = {
  children?: string
}

export default function UiMarkdown({ children }: Props) {
  const { spacing } = useTheme()

  return (
    <MuiMarkdown
      overrides={{
        ...getOverrides(),
        h1: {
          component: Typography,
          props: {
            variant: 'h1',
            component: 'h1',
            sx: {
              mt: spacing(4),
            },
          },
        },
        h2: {
          component: Typography,
          props: {
            variant: 'h2',
            component: 'h2',
            sx: {
              mt: spacing(4),
            },
          },
        },
        h3: {
          component: Typography,
          props: {
            variant: 'h3',
            component: 'h3',
            sx: {
              mt: spacing(4),
            },
          },
        },
        h4: {
          component: Typography,
          props: {
            variant: 'h4',
            component: 'h4',
            sx: {
              mt: spacing(4),
            },
          },
        },
        h5: {
          component: Typography,
          props: {
            variant: 'h5',
            component: 'h5',
            sx: {
              mt: spacing(4),
            },
          },
        },
        h6: {
          component: Typography,
          props: {
            variant: 'h6',
            component: 'h6',
            sx: {
              mt: spacing(4),
            },
          },
        },
        p: {
          component: Typography,
          props: {
            variant: 'body3',
            component: 'p',
            sx: {
              mt: spacing(6),
            },
          },
        },
        ul: {
          component: 'ul',
          props: {
            style: {
              fontSize: typography.body3.fontSize,
              lineHeight: typography.body3.lineHeight,
            },
          },
        },
        ol: {
          component: 'ul',
          props: {
            style: {
              fontSize: typography.body3.fontSize,
              lineHeight: typography.body3.lineHeight,
            },
          },
        },
      }}
    >
      {children}
    </MuiMarkdown>
  )
}
