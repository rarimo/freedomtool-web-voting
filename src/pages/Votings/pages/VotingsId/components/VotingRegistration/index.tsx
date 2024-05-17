import { Alert, Button, Paper, Stack, StackProps, Typography, useTheme } from '@mui/material'
import { useCallback, useState } from 'react'

import { AppVoting, ClaimTypes, ProofRequestResponse, signUpForVoting } from '@/api/modules/verify'
import { BusEvents } from '@/enums'
import { bus, ErrorHandler, sleep } from '@/helpers'
import { useTranslate } from '@/hooks/translate'
import { useAppRequest, useAppVotingDetails } from '@/pages/Votings/hooks'
import { AppRequestModal } from '@/pages/Votings/pages/VotingsId/components'
import { VotingProcessModal } from '@/pages/Votings/pages/VotingsId/components/VotingAlive/components'
import { UiIcon } from '@/ui'

type Props = StackProps & {
  appVoting: AppVoting
}

export default function VotingRegistration({ appVoting, ...rest }: Props) {
  const { t } = useTranslate()
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
          message: t('voting-registration.success-msg'),
        })
      } catch (error) {
        ErrorHandler.process(error)
      }

      await sleep(10_000)
    },
    [getIsUserRegistered, t],
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
              {t('voting-registration.status-prefix')}
            </Typography>

            <Stack direction='row' alignItems='center' spacing={2} color={palette.success.dark}>
              <UiIcon componentName='checkCircle' size={4} />
              <Typography fontWeight='bold'>{t('voting-registration.status-allowed')}</Typography>
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
              <Typography variant='body2'>{t('voting-registration.condition-1')}</Typography>
            </Stack>

            <Stack direction='row' alignItems='center' spacing={2}>
              <UiIcon
                componentName='checkCircle'
                size={4}
                sx={{
                  color: palette.success.dark,
                }}
              />
              <Typography variant='body2'>{t('voting-registration.condition-2')}</Typography>
            </Stack>
          </Stack>

          {isUserRegistered ? (
            <Alert severity='success'>{t('voting-registration.registered-alert')}</Alert>
          ) : (
            <Button
              sx={{ minWidth: spacing(80), alignSelf: 'flex-start' }}
              onClick={signUp}
              disabled={isPending}
              startIcon={<UiIcon componentName='personAddAlt1' />}
            >
              {t('voting-registration.register-btn')}
            </Button>
          )}
        </Stack>
      </Paper>

      <AppRequestModal
        isShown={isAppRequestModalShown}
        title={t('voting-registration.request-modal-title')}
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
