import { Alert, Stack, StackProps } from '@mui/material'

import { AppVoting } from '@/api/modules/verify'
import { useTranslate } from '@/hooks/translate'

type Props = StackProps & {
  appVoting: AppVoting
}

export default function VotingBeforeRegistration({ appVoting, ...rest }: Props) {
  const { t } = useTranslate()

  return (
    <Stack {...rest}>
      <Alert severity='info'>
        {`"${appVoting?.registration?.name}"`} {t('voting-before-registration.soon-msg')}
      </Alert>
    </Stack>
  )
}
