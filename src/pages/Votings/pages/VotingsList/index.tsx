import { Alert, Paper, Stack } from '@mui/material'
import { useMemo } from 'react'

import { LangSwitcher, NoDataViewer, PageTitles } from '@/common'
import { useTranslate } from '@/hooks/translate'
import { useVotingsContext } from '@/pages/Votings/contexts'

import { VotingListCard, VotingListCardSkeleton } from './components'

export default function VotingsList() {
  const { t } = useTranslate()
  const { appVotings, isVotingsLoading, isVotingsLoadingError } = useVotingsContext()

  const sortedAppVotings = useMemo(() => {
    return appVotings
  }, [appVotings])

  return (
    <Stack p={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <PageTitles title={t('votings-list.title')} />
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
        <Alert severity='error'>{t('votings-list.error-msg')}</Alert>
      ) : sortedAppVotings.length ? (
        <Stack mt={6} spacing={6}>
          {sortedAppVotings.map((appVoting, idx) => (
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
