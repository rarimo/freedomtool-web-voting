import {
  alpha,
  Button,
  Paper,
  Stack,
  StackProps,
  styled,
  Typography,
  useTheme,
} from '@mui/material'
import { providers } from 'ethers'
import { ChangeEvent, useCallback, useState } from 'react'

import {
  AppVoting,
  getCommitment,
  getVoteZKP,
  poseidonHash,
  SecretPair,
  vote,
} from '@/api/modules/verify'
import { useWeb3Context } from '@/contexts'
import { Icons } from '@/enums'
import { ErrorHandler, formatDateDMY } from '@/helpers'
import { VotingProcessModal } from '@/pages/Votings/pages/VotingsId/components/VotingAlive/components'
import { VotingRegistration__factory } from '@/types'
import { UiIcon, UiTooltip } from '@/ui'

type Props = StackProps & {
  appVoting: AppVoting
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

// TODO: 4 Этап - Голосование через Web Voting
//  Пользователь загружает свои ключи для голосования в веб приложение
//  Пользователь видит список голосований
//    - Список можно взять на контракте регистри фильтруя по адресу создателя
//    - В нашем случае будет только одно голосование
//  Пользователь выбирает кандидата
//    - Список айдишников (hash данных) кандидатов будет в контракте
//    - По каждому хешу будет инфа в IPFS
//    - ссылка на IPFS в метадате контракта
//  Web Voting генерирует пруф3 (из ключей, айди кандидата и айди голосования)
//  Web Voting собирает и отправляет на бекенд транзакцию, в кол дате только пруф3
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function VotingAlive({ appVoting, ...rest }: Props) {
  const { palette, spacing } = useTheme()

  const { provider } = useWeb3Context()

  const [isPending, setIsPending] = useState(false)

  const [votingSecret, setVotingSecret] = useState<SecretPair>()

  const [selectedCandidateHash, setSelectedCandidateHash] = useState<string>('')

  const handleUploadFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.currentTarget?.files?.[0]) return

    const [file] = e.currentTarget.files

    const reader = new FileReader() // File reader to read the file

    reader.readAsText(file)

    reader.onload = async () => {
      const secret = reader.result as string

      setVotingSecret(JSON.parse(secret))
    }
  }, [])

  const voteForCandidate = useCallback(
    async (candidateHash: string) => {
      setIsPending(true)

      try {
        if (!appVoting.voting?.contract_address)
          throw new TypeError('Voting contract address is not set')

        if (!votingSecret) throw new TypeError('Voting secret is not set')

        if (!provider?.rawProvider) throw new TypeError('Provider is not connected')

        const registrationInstance = VotingRegistration__factory.connect(
          appVoting.registration?.contract_address,
          provider.rawProvider as unknown as providers.JsonRpcProvider,
        )

        const commitment = getCommitment(votingSecret)

        const commitmentIndex = poseidonHash(commitment)

        const root = await registrationInstance.getRoot()

        const onchainProof = await registrationInstance.getProof(commitmentIndex)

        const zkpProof = await getVoteZKP(
          votingSecret,
          root,
          candidateHash,
          appVoting.voting.contract_address,
          onchainProof.siblings,
        )

        await vote(zkpProof.formattedProof, zkpProof.publicSignals, candidateHash)
      } catch (error) {
        ErrorHandler.process(error)
      }

      setIsPending(false)
    },
    [
      appVoting.registration?.contract_address,
      appVoting.voting?.contract_address,
      provider?.rawProvider,
      votingSecret,
    ],
  )

  const isCandidateSelected = useCallback(
    (hash: string) => selectedCandidateHash === hash,
    [selectedCandidateHash],
  )

  if (!votingSecret) {
    return (
      <Stack {...rest}>
        <Paper>
          <Stack spacing={6}>
            <Stack direction='row' spacing={4}>
              <Typography variant='h6' fontWeight='bold'>
                Your status:
              </Typography>

              <Stack direction='row' alignItems='center' spacing={2} color={palette.warning.main}>
                <UiIcon name={Icons.DecorQuestion} size={4} />
                <Typography fontWeight='bold'>Verification needed</Typography>
              </Stack>
            </Stack>

            <Stack spacing={2}>
              <Stack direction='row' alignItems='center' spacing={2}>
                <UiIcon name={Icons.DecorQuestion} size={4} color={palette.warning.main} />
                <Typography variant='body2'>Are a X authorised person</Typography>
              </Stack>

              <Stack direction='row' alignItems='center' spacing={2}>
                <UiIcon name={Icons.DecorQuestion} size={4} color={palette.warning.main} />
                <Typography variant='body2'>Are 18 y.o</Typography>
              </Stack>
            </Stack>

            <Button
              component='label'
              role={undefined}
              tabIndex={-1}
              startIcon={<UiIcon componentName='upload' />}
              sx={{ minWidth: spacing(80), alignSelf: 'flex-start' }}
            >
              UPLOAD KEYS
              <VisuallyHiddenInput
                type='file'
                accept={'.txt'}
                multiple={false}
                onChange={e => {
                  handleUploadFile(e)
                }}
              />
            </Button>
          </Stack>
        </Paper>
      </Stack>
    )
  }

  return (
    <Stack {...rest}>
      <Paper>
        <Stack spacing={4}>
          <Typography>Select Answer</Typography>
          {Object.entries(appVoting!.voting!.candidates).map(([hash, details], idx) => (
            <UiTooltip
              key={idx}
              placement='top'
              title={
                <Stack spacing={2}>
                  <Typography>{details.description}</Typography>
                  <Typography>Birthday: {formatDateDMY(details.birthday_date)}</Typography>
                </Stack>
              }
            >
              <Stack
                direction='row'
                alignItems='center'
                spacing={4}
                position='relative'
                p={4}
                bgcolor={
                  isCandidateSelected(hash)
                    ? palette.primary.main
                    : alpha(palette.primary.main, 0.05)
                }
                borderRadius={spacing(4)}
              >
                <Stack
                  justifyContent='center'
                  alignItems='center'
                  width={spacing(9)}
                  height={spacing(9)}
                  bgcolor={
                    isCandidateSelected(hash)
                      ? palette.common.white
                      : alpha(palette.primary.main, 0.05)
                  }
                  borderRadius='50%'
                >
                  <Typography color={palette.text.secondary} fontWeight='bold'>
                    {idx}
                  </Typography>
                </Stack>
                <Typography
                  color={isCandidateSelected(hash) ? palette.common.white : palette.text.secondary}
                  fontWeight='bold'
                >
                  {details.name}
                </Typography>

                <Button
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                  }}
                  onClick={() => setSelectedCandidateHash(hash)}
                />
              </Stack>
            </UiTooltip>
          ))}

          <Button
            sx={{ minWidth: spacing(40), alignSelf: 'flex-start' }}
            onClick={() => voteForCandidate(selectedCandidateHash)}
            disabled={isPending || !selectedCandidateHash}
          >
            CONFIRM
          </Button>
        </Stack>

        <VotingProcessModal open={isPending} />
      </Paper>
    </Stack>
  )
}
