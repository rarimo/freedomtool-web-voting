import { Alert, Stack, StackProps } from '@mui/material'

import { AppVoting } from '@/api/modules/verify'

type Props = StackProps & {
  appVoting: AppVoting
}

export default function VotingBeforeRegistration({ appVoting, ...rest }: Props) {
  return (
    <Stack {...rest}>
      <Alert severity='info'>{`"${appVoting?.registration?.name}"`} will start soon</Alert>
    </Stack>
  )
}
