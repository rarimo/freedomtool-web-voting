import { Alert, Box, Grid, Paper, Skeleton, Stack } from '@mui/material'

import { NoDataViewer, PageTitles } from '@/common'
import { useVotingsContext } from '@/pages/Votings/contexts'

import { VotingListCard } from './components'

export default function VotingsList() {
  const { AppVotings, isVotingsLoading, isVotingsLoadingError } = useVotingsContext()

  return (
    <Stack>
      <PageTitles title={'Active Polls'} />

      {isVotingsLoading ? (
        <Grid container spacing={4}>
          <Box component={Grid} item xs={6}>
            <Skeleton height={360} />
          </Box>
          <Box component={Grid} item xs={6}>
            <Skeleton height={360} />
          </Box>
        </Grid>
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
