import { Token, ZKProof } from '@iden3/js-jwz'
import { Alert, Button, Paper, Stack, StackProps, Typography, useTheme } from '@mui/material'
import { useCallback, useState } from 'react'

import {
  AppVoting,
  ClaimTypes,
  getCommitment,
  ProofRequestResponse,
  SecretPair,
  signUpForVoting,
} from '@/api/modules/verify'
import { BusEvents } from '@/enums'
import { bus, ErrorHandler, sleep } from '@/helpers'
import { useAppRequest, useAppVotingDetails } from '@/pages/Votings/hooks'
import { AppRequestModal } from '@/pages/Votings/pages/VotingsId/components'
import { VotingProcessModal } from '@/pages/Votings/pages/VotingsId/components/VotingAlive/components'
import { VotingRegistration__factory } from '@/types'
import { IBaseVerifier, IRegisterVerifier } from '@/types/contracts/VotingRegistration'
import { UiIcon } from '@/ui'

type Props = StackProps & {
  appVoting: AppVoting
}

export default function VotingRegistration({ appVoting, ...rest }: Props) {
  const { palette, spacing } = useTheme()

  const [isAppRequestModalShown, setIsAppRequestModalShown] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isUserRegistered, setIsUserRegistered] = useState(false)

  const { getIsUserRegistered } = useAppVotingDetails(appVoting)

  const { request, start, cancelSubscription } = useAppRequest({
    claimType: ClaimTypes.AuthClaim,
    reason: '', // FIXME: use real data
    message: '', // FIXME: use real data
    sender: '', // FIXME: use real data
  })

  const buildTxAndSignUpForVoting = useCallback(
    async (proofResponse: ProofRequestResponse, secrets: SecretPair) => {
      setIsPending(true)

      try {
        if (!proofResponse?.jwz) {
          throw new Error('Invalid proof data')
        }

        const jwzToken = await Token.parse(proofResponse?.jwz)

        const zkProofPayload = JSON.parse(jwzToken.getPayload())

        const zkpProof = zkProofPayload.body.scope[0] as ZKProof

        if (!proofResponse?.statesMerkleData || !proofResponse?.updateStateDetails || !zkpProof) {
          throw new Error('Invalid proof data')
        }

        const proveIdentityParams: IBaseVerifier.ProveIdentityParamsStruct = {
          statesMerkleData: {
            issuerId: proofResponse?.statesMerkleData.issuerId,
            issuerState: proofResponse?.statesMerkleData.state.hash,
            createdAtTimestamp: proofResponse?.statesMerkleData.state.createdAtTimestamp,
            merkleProof: proofResponse?.statesMerkleData.merkleProof,
          },
          inputs: zkpProof.pub_signals.map?.(el => BigInt(el)),
          a: [zkpProof?.proof.pi_a[0], zkpProof?.proof.pi_a[1]],
          b: [
            [zkpProof?.proof.pi_b[0][1], zkpProof?.proof.pi_b[0][0]],
            [zkpProof?.proof.pi_b[1][1], zkpProof?.proof.pi_b[1][0]],
          ],
          c: [zkpProof?.proof.pi_c[0], zkpProof?.proof.pi_c[1]],
        }
        const registerProofParams: IRegisterVerifier.RegisterProofParamsStruct = {
          issuingAuthority: '13281866', // FIXME
          documentNullifier: proofResponse?.documentNullifier,
          // TODO: handle 2 cases, when user signed before vote starts, and after
          commitment: getCommitment(secrets),
        }
        const transitStateParams: IBaseVerifier.TransitStateParamsStruct = {
          newIdentitiesStatesRoot: proofResponse?.updateStateDetails.stateRootHash,
          gistData: {
            root: proofResponse?.updateStateDetails.gistRootDataStruct.root,
            createdAtTimestamp:
              proofResponse?.updateStateDetails.gistRootDataStruct.createdAtTimestamp,
          },
          proof: proofResponse?.updateStateDetails.proof,
        }

        const contractInterface = VotingRegistration__factory.createInterface()

        const callData = contractInterface.encodeFunctionData('register', [
          proveIdentityParams,
          registerProofParams,
          transitStateParams,
          true,
        ])

        await signUpForVoting(appVoting.registration.contract_address, callData)

        bus.emit(BusEvents.success, {
          message: 'You have successfully signed up for voting',
        })
      } catch (error) {
        ErrorHandler.process(error)
      }

      await sleep(10_000)

      setIsPending(false)
    },
    [appVoting],
  )

  const signUp = useCallback(async () => {
    await start(async (proofResponse, secrets) => {
      await buildTxAndSignUpForVoting(proofResponse, secrets)

      setIsUserRegistered(await getIsUserRegistered(proofResponse))

      setIsAppRequestModalShown(false)
    })

    setIsAppRequestModalShown(true)
  }, [buildTxAndSignUpForVoting, getIsUserRegistered, start])

  return (
    <Stack {...rest}>
      <Paper>
        <Stack spacing={6}>
          <Stack direction='row' spacing={4}>
            <Typography variant='h6' fontWeight='bold'>
              Your status:
            </Typography>

            <Stack direction='row' alignItems='center' spacing={2} color={palette.success.dark}>
              <UiIcon componentName='checkCircle' size={4} />
              <Typography fontWeight='bold'>You can participate</Typography>
            </Stack>
          </Stack>

          <Stack spacing={2}>
            <Stack direction='row' alignItems='center' spacing={2}>
              <UiIcon
                componentName='checkCircle'
                size={4}
                sx={{
                  color: palette.success.dark,
                }}
              />
              <Typography variant='body2'>Are a X authorised person</Typography>
            </Stack>

            <Stack direction='row' alignItems='center' spacing={2}>
              <UiIcon
                componentName='checkCircle'
                size={4}
                sx={{
                  color: palette.success.dark,
                }}
              />
              <Typography variant='body2'>Are 18 y.o</Typography>
            </Stack>
          </Stack>

          {isUserRegistered ? (
            <Alert severity='success'>You are registered for voting</Alert>
          ) : (
            <Button
              sx={{ minWidth: spacing(80), alignSelf: 'flex-start' }}
              onClick={signUp}
              disabled={isPending}
              startIcon={<UiIcon componentName='personAddAlt1' />}
            >
              SIGN UP
            </Button>
          )}
        </Stack>
      </Paper>

      <AppRequestModal
        isShown={isAppRequestModalShown}
        request={request}
        cancel={cancelSubscription}
      />

      <VotingProcessModal open={isPending} />
    </Stack>
  )
}
