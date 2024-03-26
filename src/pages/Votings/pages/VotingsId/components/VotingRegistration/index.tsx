import { Alert, Button, Paper, Stack, StackProps, Typography, useTheme } from '@mui/material'
import { useCallback, useState } from 'react'

import { AppVoting, ClaimTypes, ProofRequestResponse, signUpForVoting } from '@/api/modules/verify'
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

  const { request, start, cancelSubscription } = useAppRequest<ClaimTypes.Registration>({
    type: ClaimTypes.Registration,
    data: {
      metadata_url: appVoting.registration.remark,
      // callbackUrl will be auto appended
    },
  })

  const buildTxAndSignUpForVoting = useCallback(
    async (proofResponse: ProofRequestResponse[ClaimTypes.Registration]) => {
      setIsPending(true)

      try {
        const proveIdentityParams: IBaseVerifier.ProveIdentityParamsStruct = {
          statesMerkleData: {
            issuerId: proofResponse.data.registerProofParams.statesMerkleData.issuerId,
            issuerState: proofResponse.data.registerProofParams.statesMerkleData.issuerState,
            createdAtTimestamp:
              proofResponse.data.registerProofParams.statesMerkleData.createdAtTimestamp,
            merkleProof: proofResponse.data.registerProofParams.statesMerkleData.merkleProof,
          },
          inputs: proofResponse.data.registerProofParams.inputs.map?.(el => BigInt(el)),
          a: [
            proofResponse.data.registerProofParams?.a[0],
            proofResponse.data.registerProofParams.a[1],
          ],
          b: [
            [
              proofResponse.data.registerProofParams.b[0][1],
              proofResponse.data.registerProofParams.b[0][0],
            ],
            [
              proofResponse.data.registerProofParams.b[1][1],
              proofResponse.data.registerProofParams.b[1][0],
            ],
          ],
          c: [
            proofResponse.data.registerProofParams.c[0],
            proofResponse.data.registerProofParams.c[1],
          ],
        }
        const registerProofParams: IRegisterVerifier.RegisterProofParamsStruct = {
          issuingAuthority: proofResponse.data.proveIdentityParams.issuingAuthority,
          documentNullifier: proofResponse.data.proveIdentityParams.documentNullifier,
          // TODO: handle 2 cases, when user signed before vote starts, and after
          commitment: proofResponse.data.proveIdentityParams.commitment,
        }
        const transitStateParams: IBaseVerifier.TransitStateParamsStruct = {
          // newIdentitiesStatesRoot: proofResponse?.updateStateDetails.stateRootHash,
          // gistData: {
          //   root: proofResponse?.updateStateDetails.gistRootDataStruct.root,
          //   createdAtTimestamp:
          //     proofResponse?.updateStateDetails.gistRootDataStruct.createdAtTimestamp,
          // },
          // proof: proofResponse?.updateStateDetails.proof,
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
    await start(async proofResponse => {
      await buildTxAndSignUpForVoting(proofResponse)

      setIsUserRegistered(
        await getIsUserRegistered(proofResponse.data.proveIdentityParams.documentNullifier),
      )

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
