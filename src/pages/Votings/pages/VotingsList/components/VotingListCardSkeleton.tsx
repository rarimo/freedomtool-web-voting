import { Divider, Skeleton, Stack, StackProps } from '@mui/material'

import { UiIcon } from '@/ui'

type Props = StackProps

export default function VotingListCard({ ...rest }: Props) {
  return (
    <Stack {...rest} spacing={6}>
      <Stack spacing={2}>
        <Skeleton width={48} />
        <Skeleton />
        <Skeleton />
      </Stack>

      <Divider />

      <Stack
        width='100%'
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        spacing={2}
      >
        <Stack direction='row' spacing={2} alignItems='center'>
          <UiIcon componentName='calendarMonth' size={4} />
          <Skeleton width={24} />
        </Stack>
      </Stack>
    </Stack>
  )
}
