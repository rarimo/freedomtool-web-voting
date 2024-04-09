import { alpha, Button, Paper, Stack, StackProps, Typography, useTheme } from '@mui/material'
import { useCallback, useState } from 'react'

import { AppVoting, ClaimTypes, ProofRequestResponse, vote } from '@/api/modules/verify'
import { NoDataViewer } from '@/common'
import { useWeb3Context } from '@/contexts'
import { BusEvents } from '@/enums'
import { bus, ErrorHandler, formatDateDMY } from '@/helpers'
import { useAppRequest, useAppVotingDetails } from '@/pages/Votings/hooks'
import { AppRequestModal } from '@/pages/Votings/pages/VotingsId/components'
import { UiTooltip } from '@/ui'

import { VotingProcessModal } from './components'

type Props = StackProps & {
  appVoting: AppVoting
}

export default function VotingAlive({ appVoting, ...rest }: Props) {
  const { palette, spacing } = useTheme()

  const { provider } = useWeb3Context()

  const [isAppRequestModalShown, setIsAppRequestModalShown] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const { getIsUserRegistered } = useAppVotingDetails(appVoting)

  const [selectedCandidateHash, setSelectedCandidateHash] = useState<string>('')

  const { request, start, cancelSubscription } = useAppRequest<ClaimTypes.Voting>({
    type: ClaimTypes.Voting,
    data: {
      registration_address: appVoting.registration.contract_address,
      voting_address: appVoting.voting!.contract_address,
      choice: selectedCandidateHash,
      metadata_url: appVoting.registration.remark,
      // callbackUrl will be auto appended
    },
  })

  const voteForCandidate = useCallback(
    async (proofResponse: ProofRequestResponse[ClaimTypes.Voting]) => {
      setIsPending(true)

      try {
        if (!appVoting.voting?.contract_address)
          throw new TypeError('Voting contract address is not set')

        if (!provider?.rawProvider) throw new TypeError('Provider is not connected')

        if (!(await getIsUserRegistered(proofResponse.document_nullifier))) {
          bus.emit(BusEvents.error, {
            message: 'You are not not registered',
          })
          throw new Error('User is not registered') // TODO: add notification
        }

        await vote(appVoting.registration.contract_address, proofResponse.calldata)
      } catch (error) {
        ErrorHandler.process(error)
      }

      setIsPending(false)
    },
    [
      appVoting.registration?.contract_address,
      appVoting.voting?.contract_address,
      getIsUserRegistered,
      provider?.rawProvider,
    ],
  )

  const handleVote = useCallback(async () => {
    await start(async proofResponse => {
      await voteForCandidate(proofResponse)

      setIsAppRequestModalShown(false)
    })

    setIsAppRequestModalShown(true)
  }, [start, voteForCandidate])

  const isCandidateSelected = useCallback(
    (hash: string) => selectedCandidateHash === hash,
    [selectedCandidateHash],
  )

  return (
    <Stack {...rest}>
      <Paper>
        <Stack spacing={4}>
          <Typography>Select Answer</Typography>
          {appVoting?.voting?.candidates ? (
            Object.entries(appVoting.voting.candidates).map(([hash, details], idx) => (
              <UiTooltip
                key={idx}
                placement='top'
                title={
                  <Stack spacing={2}>
                    <Typography>{details.description}</Typography>
                    <Typography>Birthday: {formatDateDMY(details.birthday_date)}</Typography>
                  </Stack>
                }
              >
                <Stack
                  direction='row'
                  alignItems='center'
                  spacing={4}
                  position='relative'
                  p={4}
                  bgcolor={
                    isCandidateSelected(hash)
                      ? palette.primary.main
                      : alpha(palette.primary.main, 0.05)
                  }
                  borderRadius={spacing(4)}
                >
                  <Stack
                    justifyContent='center'
                    alignItems='center'
                    width={spacing(9)}
                    height={spacing(9)}
                    bgcolor={
                      isCandidateSelected(hash)
                        ? palette.common.white
                        : alpha(palette.primary.main, 0.05)
                    }
                    borderRadius='50%'
                  >
                    <Typography color={palette.text.secondary} fontWeight='bold'>
                      {idx}
                    </Typography>
                  </Stack>
                  <Typography
                    color={
                      isCandidateSelected(hash) ? palette.common.white : palette.text.secondary
                    }
                    fontWeight='bold'
                  >
                    {details.name}
                  </Typography>

                  <Button
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                    }}
                    onClick={() => setSelectedCandidateHash(hash)}
                  />
                </Stack>
              </UiTooltip>
            ))
          ) : (
            <NoDataViewer title='No Candidates' />
          )}

          {appVoting?.voting?.candidates && (
            <Button
              sx={{ minWidth: spacing(40), alignSelf: 'flex-start' }}
              onClick={handleVote}
              disabled={isPending || !selectedCandidateHash}
            >
              CONFIRM
            </Button>
          )}
        </Stack>

        <AppRequestModal
          isShown={isAppRequestModalShown}
          request={request}
          cancel={cancelSubscription}
        />

        <VotingProcessModal open={isPending} />
      </Paper>
    </Stack>
  )
}
