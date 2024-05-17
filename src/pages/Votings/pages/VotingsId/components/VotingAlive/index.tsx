import { Alert, alpha, Button, Paper, Stack, StackProps, Typography, useTheme } from '@mui/material'
import { useCallback, useState } from 'react'

import { AppVoting, ClaimTypes, ProofRequestResponse, vote } from '@/api/modules/verify'
import { NoDataViewer } from '@/common'
import { BusEvents } from '@/enums'
import { bus, ErrorHandler, formatDateDMY } from '@/helpers'
import { useTranslate } from '@/hooks/translate'
import { useAppRequest, useAppVotingDetails } from '@/pages/Votings/hooks'
import { AppRequestModal } from '@/pages/Votings/pages/VotingsId/components'
import { UiTooltip } from '@/ui'

import { VotingProcessModal } from './components'

type Props = StackProps & {
  appVoting: AppVoting
}

export default function VotingAlive({ appVoting, ...rest }: Props) {
  const { t } = useTranslate()
  const { palette, spacing } = useTheme()

  const [isAppRequestModalShown, setIsAppRequestModalShown] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isUserVoted, setIsUserVoted] = useState(false)

  const { getIsUserRegistered, getIsUserVoted } = useAppVotingDetails(appVoting)

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
      try {
        if (!appVoting.voting?.contract_address)
          throw new TypeError('Voting contract address is not set')

        const isUserRegistered = await getIsUserRegistered(proofResponse.document_nullifier)
        const isUserVoted = await getIsUserVoted(proofResponse.nullifier)

        if (!isUserRegistered) {
          bus.emit(BusEvents.error, {
            message: t('voting-alive.not-registered-error-msg'),
          })
          return
        }

        if (isUserVoted) {
          setIsUserVoted(true)
          return
        }

        await vote(
          appVoting.registration.contract_address,
          appVoting.voting?.contract_address,
          proofResponse.calldata,
        )

        bus.emit(BusEvents.success, {
          message: t('voting-alive.success-msg'),
        })
      } catch (error) {
        ErrorHandler.process(error)
      }
    },
    [
      appVoting.registration.contract_address,
      appVoting.voting?.contract_address,
      getIsUserRegistered,
      getIsUserVoted,
      t,
    ],
  )

  const successHandler = useCallback(
    async (proofResponse: ProofRequestResponse[ClaimTypes.Voting], cancelCb: () => void) => {
      setIsPending(true)

      setIsAppRequestModalShown(false)

      cancelCb?.()

      await voteForCandidate(proofResponse)

      setIsUserVoted(await getIsUserVoted(proofResponse.nullifier))

      setIsPending(false)
    },
    [getIsUserVoted, voteForCandidate],
  )

  const handleVote = useCallback(async () => {
    await start(successHandler)

    setIsAppRequestModalShown(true)
  }, [start, successHandler])

  const isCandidateSelected = useCallback(
    (hash: string) => selectedCandidateHash === hash,
    [selectedCandidateHash],
  )

  return (
    <Stack {...rest}>
      <Paper>
        <Stack spacing={4}>
          <Typography>{t('voting-alive.select-section-lbl')}</Typography>
          {appVoting?.voting?.candidates ? (
            Object.entries(appVoting.voting.candidates).map(([hash, details], idx) => (
              <UiTooltip
                key={idx}
                placement='top'
                title={
                  <Stack spacing={2}>
                    <Typography>{details.description}</Typography>
                    <Typography>{formatDateDMY(details.birthday_date)}</Typography>
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
            <NoDataViewer title={t('voting-alive.no-options-msg')} />
          )}

          {isUserVoted ? (
            <Alert severity='success'>You already voted</Alert>
          ) : (
            <>
              {appVoting?.voting?.candidates && (
                <Button
                  sx={{ minWidth: spacing(40), alignSelf: 'flex-start' }}
                  onClick={handleVote}
                  disabled={isPending || !selectedCandidateHash}
                >
                  {t('voting-alive.confirm-btn')}
                </Button>
              )}
            </>
          )}
        </Stack>

        <AppRequestModal
          isShown={isAppRequestModalShown}
          title={t('voting-alive.request-modal-title')}
          request={request}
          cancel={() => {
            setIsAppRequestModalShown(false)
            cancelSubscription()
          }}
        />

        <VotingProcessModal open={isPending} />
      </Paper>
    </Stack>
  )
}
