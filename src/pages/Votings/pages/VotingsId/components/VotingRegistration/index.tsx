import { Token, ZKProof } from '@iden3/js-jwz'
import { Alert, Button, Link, Paper, Stack, StackProps, Typography, useTheme } from '@mui/material'
import { useCallback, useState } from 'react'

import { AppVoting, getCommitment, signUpForVoting } from '@/api/modules/verify'
import { BusEvents } from '@/enums'
import { bus, ErrorHandler } from '@/helpers'
import { useLoading } from '@/hooks'
import { useVotingsContext } from '@/pages/Votings/contexts'
import { useAppVotingDetails } from '@/pages/Votings/hooks'
import { VotingRegistration__factory } from '@/types'
import { IBaseVerifier, IRegisterVerifier } from '@/types/contracts/VotingRegistration'
import { UiBasicModal, UiIcon } from '@/ui'

type Props = StackProps & {
  appVoting: AppVoting
}

// TODO: 3 Этап - Регистрация на голосование через Web Voting
//  Web Voting получает пруф2 от бекенда по вебсокету и sessionID
//  Web Voting собирает транзакцию и отправляет на бекенд. Кол дата:
//   - пруф2
//   - document Nullifier - salted hash фотографии
//  Пользователь получает уведомление, что он зарегистрирован и ссылку на blockchain explorer
//  Пользователь скачивает (автоматически) ключи для голосования
export default function VotingAwait({ appVoting, ...rest }: Props) {
  const { palette, spacing } = useTheme()

  const [isPending, setIsPending] = useState(false)
  const [isSuccessModalShown, setIsSuccessModalShown] = useState(false)
  const [secretsDownloadUrl, setSecretsDownloadUrl] = useState('')

  const { proofResponse, secrets } = useVotingsContext()
  const { getIsUserRegistered } = useAppVotingDetails(appVoting)

  const { data: isUserRegistered, reload } = useLoading(false, getIsUserRegistered, {
    loadOnMount: true,
  })

  const signUp = useCallback(async () => {
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

      const file = new Blob([JSON.stringify(secrets)], { type: 'text/plain' })

      setSecretsDownloadUrl(URL.createObjectURL(file))
    } catch (error) {
      ErrorHandler.process(error)
    }

    setIsPending(false)
  }, [
    proofResponse?.documentNullifier,
    proofResponse?.jwz,
    proofResponse?.statesMerkleData,
    proofResponse?.updateStateDetails,
    secrets,
    appVoting,
  ])

  return (
    <Stack {...rest}>
      <Paper>
        <Stack spacing={6}>
          <Stack direction='row' spacing={4}>
            <Typography variant='h6' fontWeight='bold'>
              Your status:
            </Typography>

            <Stack direction='row' alignItems='center' spacing={2} color={palette.success.main}>
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
                  color: palette.success.main,
                }}
              />
              <Typography variant='body2'>Are a X authorised person</Typography>
            </Stack>

            <Stack direction='row' alignItems='center' spacing={2}>
              <UiIcon
                componentName='checkCircle'
                size={4}
                sx={{
                  color: palette.success.main,
                }}
              />
              <Typography variant='body2'>Are 18 y.o</Typography>
            </Stack>
          </Stack>

          {isUserRegistered ? (
            <Alert severity='success'>You are registered for voting</Alert>
          ) : secretsDownloadUrl ? (
            <Button
              component={Link}
              href={secretsDownloadUrl}
              download={'keys.txt'}
              target='_blank'
              sx={{ minWidth: spacing(80), alignSelf: 'flex-start' }}
              onClick={() => {
                setIsSuccessModalShown(true)

                reload()
              }}
              disabled={isPending}
              startIcon={<UiIcon componentName='download' />}
            >
              DOWNLOAD KEYS
            </Button>
          ) : (
            <Button
              sx={{ minWidth: spacing(80), alignSelf: 'flex-start' }}
              onClick={signUp}
              disabled={isPending}
              startIcon={<UiIcon componentName='personAddAlt1' />}
            >
              PARTICIPATE
            </Button>
          )}
        </Stack>
      </Paper>

      <UiBasicModal open={isSuccessModalShown} onClose={() => setIsSuccessModalShown(false)}>
        <Stack alignItems='center' textAlign='center' spacing={4} p={8}>
          <UiIcon componentName='checkCircle' size={40} color='success' />

          <Typography variant='h5' fontWeight='bold'>
            You have successfully signed up for voting
          </Typography>

          <Typography variant='body2'>
            Once the voting starts, you will be able to participate
          </Typography>
        </Stack>
      </UiBasicModal>
    </Stack>
  )
}
