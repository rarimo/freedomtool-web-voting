import { Alert, Paper, Stack } from '@mui/material'

import { NoDataViewer, PageTitles } from '@/common'
import { useVotingsContext } from '@/pages/Votings/contexts'

import { VotingListCard, VotingListCardSkeleton } from './components'

export default function VotingsList() {
  const { AppVotings, isVotingsLoading, isVotingsLoadingError } = useVotingsContext()

  return (
    <Stack>
      <PageTitles title={'Active Polls'} />

      {isVotingsLoading ? (
        <Stack mt={6} spacing={6}>
          <Paper>
            <VotingListCardSkeleton />
          </Paper>
          <Paper>
            <VotingListCardSkeleton />
          </Paper>
        </Stack>
      ) : isVotingsLoadingError ? (
        <Alert severity='error'>{`There's an error occurred, please, reload page`}</Alert>
      ) : AppVotings.length ? (
        <Stack mt={6} spacing={6}>
          {AppVotings.map((appVoting, idx) => (
            <Paper key={idx}>
              <VotingListCard appVoting={appVoting} />
            </Paper>
          ))}
        </Stack>
      ) : (
        <NoDataViewer />
      )}
    </Stack>
  )
}
