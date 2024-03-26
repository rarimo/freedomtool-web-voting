import { Divider, IconButton, Stack, StackProps, Typography, useTheme } from '@mui/material'
import { generatePath, NavLink } from 'react-router-dom'

import { AppVoting } from '@/api/modules/verify'
import { RoutePaths } from '@/enums'
import { useAppVotingDetails } from '@/pages/Votings/hooks'
import { UiIcon } from '@/ui'

type Props = {
  appVoting: AppVoting
} & StackProps

export default function VotingListCard({ appVoting, ...rest }: Props) {
  const { palette, spacing } = useTheme()

  const { pairId, appVotingDesc, endTimerMessage } = useAppVotingDetails(appVoting)

  return (
    <Stack {...rest} spacing={6}>
      <Stack spacing={2}>
        <Typography variant='body1'>{appVotingDesc?.name}</Typography>
        <Typography variant='body2'>{appVotingDesc?.description}</Typography>
      </Stack>

      <Divider />

      <Stack
        width='100%'
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        spacing={2}
      >
        <Stack direction='row' spacing={2} alignItems='center'>
          <UiIcon componentName='calendarMonth' size={4} />
          <Typography>{endTimerMessage}</Typography>
        </Stack>
        <IconButton
          component={NavLink}
          to={generatePath(RoutePaths.VotingsId, {
            id: pairId,
          })}
        >
          <Stack
            justifyContent='center'
            alignItems='center'
            p={4}
            borderRadius={'50%'}
            bgcolor={palette.background.default}
            width={spacing(9.5)}
            height={spacing(9.5)}
          >
            <UiIcon componentName='arrowForward' size={5} />
          </Stack>
        </IconButton>
      </Stack>
    </Stack>
  )
}
