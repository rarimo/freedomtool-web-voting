import { Box, Button, Divider, Paper, Stack, StackProps, Typography, useTheme } from '@mui/material'
import { useCallback, useState } from 'react'
import QRCode from 'react-qr-code'

import { AppVoting } from '@/api/modules/verify'
import { Icons } from '@/enums'
import { ErrorHandler } from '@/helpers'
import { useVotingsContext } from '@/pages/Votings/contexts'
import { UiIcon, UiIconButton, UiModal } from '@/ui'

type Props = StackProps & {
  appVoting?: AppVoting
}

export default function SignIn({ ...rest }: Props) {
  const { palette, spacing } = useTheme()

  const [isPending, setIsPending] = useState(false)

  const [authRequest, setAuthRequest] = useState('')

  const { buildAuthRequest, cancelSubscription } = useVotingsContext()

  const signIn = useCallback(async () => {
    setIsPending(true)

    try {
      const request = await buildAuthRequest()

      setAuthRequest(JSON.stringify(request))
    } catch (error) {
      ErrorHandler.process(error)
    }

    setIsPending(false)
  }, [buildAuthRequest])

  const cancel = useCallback(() => {
    cancelSubscription()
    setAuthRequest('')
  }, [cancelSubscription])

  return (
    <Stack {...rest} spacing={4}>
      <Paper>
        <Stack spacing={6}>
          <Stack direction='row' spacing={4}>
            <Typography variant='h6' fontWeight='bold'>
              Your status:
            </Typography>

            <Stack direction='row' alignItems='center' spacing={2} color={palette.warning.main}>
              <UiIcon name={Icons.DecorQuestion} size={4} />
              <Typography fontWeight='bold'>Verification needed</Typography>
            </Stack>
          </Stack>

          <Stack spacing={2}>
            <Stack direction='row' alignItems='center' spacing={2}>
              <UiIcon name={Icons.DecorQuestion} size={4} color={palette.warning.main} />
              <Typography variant='body2'>Are a X authorised person</Typography>
            </Stack>

            <Stack direction='row' alignItems='center' spacing={2}>
              <UiIcon name={Icons.DecorQuestion} size={4} color={palette.warning.main} />
              <Typography variant='body2'>Are 18 y.o</Typography>
            </Stack>
          </Stack>

          <Button
            sx={{ minWidth: spacing(80), alignSelf: 'flex-start' }}
            onClick={signIn}
            disabled={isPending}
          >
            VERIFY
          </Button>
        </Stack>
      </Paper>

      <UiModal open={!!authRequest}>
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
              <Typography variant='h6'>Download APP</Typography>

              <UiIconButton onClick={cancel}>
                <UiIcon componentName='close' />
              </UiIconButton>
            </Stack>

            <Divider />

            <Stack p={10} spacing={8}>
              <Stack spacing={4} alignItems='center' textAlign='center'>
                <Box component={QRCode} value={authRequest} />
                <Typography variant='body2'>
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
    </Stack>
  )
}
