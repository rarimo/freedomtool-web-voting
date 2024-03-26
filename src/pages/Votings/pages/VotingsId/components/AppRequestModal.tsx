import { Box, Button, Divider, Paper, Stack, Typography, useTheme } from '@mui/material'
import QRCode from 'react-qr-code'

import { Icons } from '@/enums'
import { UiIcon, UiIconButton, UiModal } from '@/ui'

type Props = {
  isShown: boolean
  request: string
  cancel: () => void
}

export default function AppRequestModal({ isShown, request, cancel }: Props) {
  const { palette, spacing } = useTheme()

  return (
    <UiModal open={!!(request && isShown)}>
      <Stack justifyContent='center' alignItems='center' width='100%' height='100%'>
        <Paper
          sx={{
            p: 0,
            bgcolor: palette.background.paper,
            maxWidth: spacing(120),
            width: '100%',
          }}
        >
          <Stack direction='row' justifyContent='space-between' p={5}>
            <Typography variant='h6'>Authorize with Freedomtool App</Typography>

            <UiIconButton onClick={cancel}>
              <UiIcon componentName='close' />
            </UiIconButton>
          </Stack>

          <Divider />

          <Stack p={10} spacing={8}>
            <Stack spacing={4} alignItems='center' textAlign='center'>
              <Box component={QRCode} value={request} />
              <Typography
                variant='body3'
                sx={{
                  maxWidth: spacing(60),
                }}
              >
                Scan this code with the Doc Scan mobile app to verify eligibility
              </Typography>
            </Stack>

            <Divider />

            <Stack direction='row' spacing={6}>
              <Button
                color='secondary'
                sx={{ flex: 0.5, borderRadius: spacing(2), py: spacing(1), px: spacing(6) }}
              >
                <Stack justifyContent='center' alignItems='center' spacing={1}>
                  <UiIcon name={Icons.appStore} size={30} />
                </Stack>
              </Button>
              <Button
                color='secondary'
                sx={{ flex: 0.5, borderRadius: spacing(2), py: spacing(1), px: spacing(6) }}
              >
                <Stack justifyContent='center' alignItems='center' spacing={1}>
                  <UiIcon name={Icons.playStore} size={30} />
                </Stack>
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </UiModal>
  )
}
