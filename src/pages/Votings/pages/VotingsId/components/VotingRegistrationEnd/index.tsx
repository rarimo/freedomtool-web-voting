import { Chip, Paper, Stack, StackProps, Typography, useTheme } from '@mui/material'
import { useMemo } from 'react'

import { AppVoting } from '@/api/modules/verify'
import { Illustrations } from '@/enums'
import { UiIcon, UiIllustration } from '@/ui'

type Props = StackProps & {
  appVoting: AppVoting
}

export default function VotingRegistrationEnd({ appVoting, ...rest }: Props) {
  const { palette, spacing } = useTheme()

  const registeredAmountMsg = useMemo(() => {
    return (
      <Typography>
        <Typography fontWeight='bold'>
          {appVoting.registration.counters.totalRegistrations.toNumber()}
        </Typography>{' '}
        people already signed
      </Typography>
    )
  }, [appVoting.registration.counters.totalRegistrations])

  return (
    <Stack {...rest}>
      <Paper
        sx={{
          p: spacing(6),
        }}
      >
        <Paper
          sx={{
            background: palette.success.lighter,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Stack direction='row' justifyContent='space-between'>
            <Stack spacing={4}>
              <Chip
                color='success'
                label='Signed'
                icon={<UiIcon componentName='check' size={6} />}
                sx={{
                  background: palette.success.dark,
                  color: palette.success.contrastText,
                  fontWeight: 'bold',
                  alignSelf: 'flex-start',
                }}
              />

              <Typography variant='body2' fontWeight='bold'>
                {registeredAmountMsg}
              </Typography>
            </Stack>
            <UiIllustration
              name={Illustrations.UsersGroupCenterIcon}
              size={44}
              sx={{
                position: 'absolute',
                top: '50%',
                right: '-5%',
                transform: 'translateY(-50%)',
              }}
            />
          </Stack>
        </Paper>
      </Paper>
    </Stack>
  )
}
