import { Alert, Paper, Stack } from '@mui/material'

import { LangSwitcher, NoDataViewer, PageTitles } from '@/common'
import { useVotingsContext } from '@/pages/Votings/contexts'

import { VotingListCard, VotingListCardSkeleton } from './components'

export default function VotingsList() {
  const { appVotings, isVotingsLoading, isVotingsLoadingError } = useVotingsContext()

  return (
    <Stack p={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <PageTitles title={'Active Polls'} />
        <LangSwitcher />
      </Stack>

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
      ) : appVotings.length ? (
        <Stack mt={6} spacing={6}>
          {appVotings.map((appVoting, idx) => (
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
