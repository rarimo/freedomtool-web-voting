import { Alert, Button, Divider, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'
import { NavLink, useParams } from 'react-router-dom'

import { LangSwitcher, NoDataViewer } from '@/common'
import { RoutePaths } from '@/enums'
import { useVotingsContext } from '@/pages/Votings/contexts'
import { useAppVotingDetails } from '@/pages/Votings/hooks'
import { UiIcon, UiMarkdown } from '@/ui'

import {
  VotingAlive,
  VotingBeforeRegistration,
  VotingEnded,
  VotingRegistration,
  VotingRegistrationEnd,
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
    isVotingHasBegun,
    isRegistrationHasEnded,
  } = useAppVotingDetails(id)

  const VotingComponent = useMemo(() => {
    if (isVotingEnded) return VotingEnded

    if (isVotingHasBegun) return VotingAlive

    if (isRegistrationHasEnded) return VotingRegistrationEnd

    if (!isRegistrationHasBegun) return VotingBeforeRegistration

    return VotingRegistration
  }, [isVotingEnded, isVotingHasBegun, isRegistrationHasEnded, isRegistrationHasBegun])

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
      <Stack spacing={6}>
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Button
            component={NavLink}
            to={RoutePaths.VotingsList}
            variant='text'
            startIcon={<UiIcon componentName='chevronLeft' />}
          >
            Back
          </Button>

          <LangSwitcher />
        </Stack>

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
      </Stack>

      {<VotingComponent appVoting={appVoting} />}

      <Paper>
        <UiMarkdown>{appVotingDesc?.description}</UiMarkdown>
      </Paper>
    </Stack>
  )
}
