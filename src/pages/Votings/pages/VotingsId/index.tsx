import { Alert, Button, Divider, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { NavLink, useParams } from 'react-router-dom'

import { NoDataViewer } from '@/common'
import { RoutePaths } from '@/enums'
import { useVotingsContext } from '@/pages/Votings/contexts'
import { useAppVotingDetails } from '@/pages/Votings/hooks'
import { UiIcon } from '@/ui'

import {
  VotingAlive,
  VotingBeforeRegistration,
  VotingEnded,
  VotingRegistration,
  VotingRegistrationEnd,
  VotingSignIn,
} from './components'

export default function VotingsId() {
  const { id = '' } = useParams<{ id: string }>()

  const { isVotingsLoading, isVotingsLoadingError } = useVotingsContext()

  const {
    appVoting,
    appVotingDesc,
    endTimerMessage,
    isVotingEnded,
    isRegistrationHasBegun,
    isAuthorized,
    isVotingHasBegun,
  } = useAppVotingDetails(id)

  const VotingComponent = useMemo(() => {
    // Check availability first

    if (isVotingEnded) return VotingEnded

    if (isRegistrationHasBegun && !isVotingHasBegun) return VotingRegistrationEnd

    if (!isRegistrationHasBegun) return VotingBeforeRegistration

    // For the next steps authorization is required

    if (!isAuthorized) return VotingSignIn

    if (isVotingHasBegun) return VotingAlive

    return VotingRegistration
  }, [isAuthorized, isVotingHasBegun, isVotingEnded, isRegistrationHasBegun])

  if (isVotingsLoading)
    return (
      <Stack>
        <Typography variant='h5'>
          <Skeleton width={'25%'} />
        </Typography>

        <Typography variant='body3'>
          <Skeleton width={'50%'} />
        </Typography>

        <Paper sx={{ mt: 6 }}>
          <Skeleton height={360} />
        </Paper>
      </Stack>
    )

  if (isVotingsLoadingError)
    return <Alert severity='error'>{`There's an error occurred, please, reload page`}</Alert>

  if (!appVoting)
    return (
      <NoDataViewer
        action={
          <Button component={NavLink} to={RoutePaths.VotingsList}>
            See all votings
          </Button>
        }
      />
    )

  return (
    <Stack spacing={4}>
      <Paper>
        <Stack spacing={6}>
          <Typography variant='h5'>{appVotingDesc?.name}</Typography>

          <Divider />

          <Stack direction='row' spacing={2} alignItems='center'>
            <UiIcon componentName='calendarMonth' size={4} />
            <Typography>{endTimerMessage}</Typography>
          </Stack>
        </Stack>
      </Paper>

      {<VotingComponent appVoting={appVoting} />}

      <Paper>
        <Typography variant='body3'>{appVotingDesc?.description}</Typography>
      </Paper>
    </Stack>
  )
}
