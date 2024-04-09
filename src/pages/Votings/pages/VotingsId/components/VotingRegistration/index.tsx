import { Alert, Button, Paper, Stack, StackProps, Typography, useTheme } from '@mui/material'
import { useCallback, useState } from 'react'

import { AppVoting, ClaimTypes, ProofRequestResponse, signUpForVoting } from '@/api/modules/verify'
import { BusEvents } from '@/enums'
import { bus, ErrorHandler, sleep } from '@/helpers'
import { useAppRequest, useAppVotingDetails } from '@/pages/Votings/hooks'
import { AppRequestModal } from '@/pages/Votings/pages/VotingsId/components'
import { VotingProcessModal } from '@/pages/Votings/pages/VotingsId/components/VotingAlive/components'
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
      try {
        const isUserReg = await getIsUserRegistered(proofResponse.document_nullifier)

        if (isUserReg) {
          setIsUserRegistered(true)

          return
        }

        await signUpForVoting(proofResponse.calldata)

        bus.emit(BusEvents.success, {
          message: 'You have successfully signed up for voting',
        })
      } catch (error) {
        ErrorHandler.process(error)
      }

      await sleep(10_000)
    },
    [getIsUserRegistered],
  )

  const successHandler = useCallback(
    async (proofResponse: ProofRequestResponse[ClaimTypes.Registration], cancelCb: () => void) => {
      setIsPending(true)

      setIsAppRequestModalShown(false)

      cancelCb?.()

      await buildTxAndSignUpForVoting(proofResponse)

      setIsUserRegistered(await getIsUserRegistered(proofResponse.document_nullifier))

      setIsPending(false)
    },
    [buildTxAndSignUpForVoting, getIsUserRegistered],
  )

  const signUp = useCallback(async () => {
    await start(successHandler)

    setIsAppRequestModalShown(true)
  }, [start, successHandler])

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
        cancel={() => {
          setIsAppRequestModalShown(false)
          cancelSubscription?.()
        }}
      />

      <VotingProcessModal open={isPending} />
    </Stack>
  )
}
