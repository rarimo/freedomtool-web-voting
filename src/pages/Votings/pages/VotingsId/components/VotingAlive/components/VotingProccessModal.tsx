import { Chip, Divider, Paper, Stack, Typography, useTheme } from '@mui/material'
import { ComponentProps, useState } from 'react'
import { useEffectOnce } from 'react-use'

import { sleep } from '@/helpers'
import { UiIcon, UiModal } from '@/ui'

type Props = Omit<ComponentProps<typeof UiModal>, 'children'>

export default function VotingProcessModal({ ...rest }: Props) {
  const { palette, spacing } = useTheme()

  const [steps, setSteps] = useState([
    {
      title: 'Formation of the Survey',
      status: 'loading',
    },
    {
      title: 'Anonymization',
      status: 'loading',
    },
    {
      title: 'Sending your choice',
      status: 'loading',
    },
    {
      title: 'Finalizing',
      status: 'loading',
    },
  ])

  useEffectOnce(() => {
    ;(async () => {
      for (const step of steps) {
        await sleep(3_000)
        setSteps(prev => {
          const newSteps = [...prev]

          newSteps[prev.indexOf(step)].status = 'done'

          return newSteps
        })
      }
    })()
  })

  return (
    <UiModal {...rest}>
      <Stack justifyContent='center' alignItems='center' width='100%' height='100%'>
        <Paper
          sx={{
            p: 0,
            bgcolor: palette.background.paper,
            maxWidth: spacing(120),
            width: '100%',
          }}
        >
          <Stack spacing={8} p={10} alignItems='center'>
            <UiIcon componentName='checkCircle' size={28} sx={{ color: palette.success.main }} />
            <Stack spacing={3} alignItems='center' textAlign='center'>
              <Typography variant='h5'>Please wait</Typography>
              <Typography variant='body3'>Your choice is non tracable</Typography>
            </Stack>

            <Divider sx={{ alignSelf: 'stretch' }} />

            <Stack spacing={4} alignSelf='stretch'>
              {steps.map((el, idx) => (
                <Stack key={idx} direction='row' justifyContent='space-between' spacing={1}>
                  <Typography color={palette.text.secondary} fontWeight='bold'>
                    {el.title}
                  </Typography>
                  {el.status === 'loading' ? (
                    <Typography>Loading...</Typography>
                  ) : (
                    <Chip
                      color='success'
                      icon={
                        <UiIcon
                          componentName='check'
                          sx={{
                            color: palette.success.dark,
                          }}
                        />
                      }
                      label='Done'
                    />
                  )}
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </UiModal>
  )
}
