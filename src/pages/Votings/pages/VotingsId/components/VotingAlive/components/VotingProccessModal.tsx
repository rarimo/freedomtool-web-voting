import { Box, Chip, Divider, Paper, Stack, Typography, useTheme } from '@mui/material'
import { ComponentProps, useState } from 'react'
import { useEffectOnce } from 'react-use'

import { sleep } from '@/helpers'
import { useTranslate } from '@/hooks/translate'
import { UiIcon, UiModal } from '@/ui'

type Props = Omit<ComponentProps<typeof UiModal>, 'children'>

enum ProcessingStatuses {
  Loading = 'loading',
  Done = 'done',
}

export default function VotingProcessModal({ ...rest }: Props) {
  const { t } = useTranslate()
  const { palette, spacing } = useTheme()

  const [steps, setSteps] = useState([
    {
      title: t('voting-process-modal.step-1-title'),
      status: ProcessingStatuses.Loading,
    },
    {
      title: t('voting-process-modal.step-2-title'),
      status: ProcessingStatuses.Loading,
    },
    {
      title: t('voting-process-modal.step-3-title'),
      status: ProcessingStatuses.Loading,
    },
    {
      title: t('voting-process-modal.step-4-title'),
      status: ProcessingStatuses.Loading,
    },
  ])

  useEffectOnce(() => {
    ;(async () => {
      for (const step of steps) {
        await sleep(3_000)
        setSteps(prev => {
          const newSteps = [...prev]

          newSteps[prev.indexOf(step)].status = ProcessingStatuses.Done

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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '50%',
                width: spacing(28),
                height: spacing(28),
                background: palette.success.main,
              }}
            >
              <UiIcon componentName='check' size={10} sx={{ color: palette.common.white }} />
            </Box>
            <Stack spacing={3} alignItems='center' textAlign='center'>
              <Typography variant='h5'>{t('voting-process-modal.wait-msg')}</Typography>
              <Typography variant='body3'>{t('voting-process-modal.sec-msg')}</Typography>
            </Stack>

            <Divider sx={{ alignSelf: 'stretch' }} />

            <Stack spacing={4} alignSelf='stretch'>
              {steps.map((el, idx) => (
                <Stack key={idx} direction='row' justifyContent='space-between' spacing={1}>
                  <Typography color={palette.text.secondary} fontWeight='bold'>
                    {el.title}
                  </Typography>
                  {el.status === ProcessingStatuses.Loading ? (
                    <Typography>{t('voting-process-modal.loading-status')}</Typography>
                  ) : (
                    <Chip
                      color='success'
                      icon={
                        <UiIcon
                          componentName='check'
                          sx={{
                            color: palette.success.main,
                          }}
                        />
                      }
                      sx={{
                        color: palette.success.darker,
                      }}
                      label={t('voting-process-modal.done-status')}
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
