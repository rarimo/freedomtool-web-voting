import { alpha, Button, Paper, Stack, StackProps, Typography, useTheme } from '@mui/material'
import { providers } from 'ethers'
import { useCallback, useState } from 'react'

import {
  AppVoting,
  ClaimTypes,
  getVoteZKP,
  poseidonHash,
  ProofRequestResponse,
  vote,
} from '@/api/modules/verify'
import { NoDataViewer } from '@/common'
import { useWeb3Context } from '@/contexts'
import { ErrorHandler, formatDateDMY } from '@/helpers'
import { useAppRequest, useAppVotingDetails } from '@/pages/Votings/hooks'
import { AppRequestModal } from '@/pages/Votings/pages/VotingsId/components'
import { VotingProcessModal } from '@/pages/Votings/pages/VotingsId/components/VotingAlive/components'
import { VotingRegistration__factory } from '@/types'
import { UiTooltip } from '@/ui'

type Props = StackProps & {
  appVoting: AppVoting
}

export default function VotingAlive({ appVoting, ...rest }: Props) {
  const { palette, spacing } = useTheme()

  const { provider } = useWeb3Context()

  const [isAppRequestModalShown, setIsAppRequestModalShown] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const { getIsUserRegistered } = useAppVotingDetails(appVoting)

  const { request, start, cancelSubscription } = useAppRequest<ClaimTypes.Voting>({
    type: ClaimTypes.Voting,
    data: {
      metadata_url: appVoting.registration.remark,
      // callbackUrl will be auto appended
    },
  })

  const [selectedCandidateHash, setSelectedCandidateHash] = useState<string>('')

  const voteForCandidate = useCallback(
    async (proofResponse: ProofRequestResponse[ClaimTypes.Voting], candidateHash: string) => {
      setIsPending(true)

      try {
        if (!appVoting.voting?.contract_address)
          throw new TypeError('Voting contract address is not set')

        if (!provider?.rawProvider) throw new TypeError('Provider is not connected')

        if (
          !(await getIsUserRegistered(proofResponse.data.proveIdentityParams.documentNullifier))
        ) {
          throw new Error('User is not registered') // TODO: add notification
        }

        const registrationInstance = VotingRegistration__factory.connect(
          appVoting.registration?.contract_address,
          provider.rawProvider as unknown as providers.JsonRpcProvider,
        )

        const commitmentIndex = poseidonHash(proofResponse.data.proveIdentityParams.commitment)

        const root = await registrationInstance.getRoot()

        const onchainProof = await registrationInstance.getProof(commitmentIndex)

        const zkpProof = await getVoteZKP(
          secrets,
          root,
          candidateHash,
          appVoting.voting.contract_address,
          onchainProof.siblings,
        )

        await vote(zkpProof.formattedProof, zkpProof.publicSignals, candidateHash)
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

  const handleVote = useCallback(
    async (candidateHash: string) => {
      await start(async proofResponse => {
        await voteForCandidate(proofResponse, candidateHash)

        setIsAppRequestModalShown(false)
      })

      setIsAppRequestModalShown(true)
    },
    [start, voteForCandidate],
  )

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
              onClick={() => handleVote(selectedCandidateHash)}
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
