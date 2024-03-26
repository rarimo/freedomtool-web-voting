import { Stack, StackProps } from '@mui/material'

import { AppVoting } from '@/api/modules/verify'

type Props = StackProps & {
  appVoting: AppVoting
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function VotingEnded({ appVoting, ...rest }: Props) {
  return <Stack {...rest}></Stack>
}
