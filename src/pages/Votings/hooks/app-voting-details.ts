import { time } from '@distributedlab/tools'
import { BigNumber } from '@ethersproject/bignumber'
import { arrayify } from '@ethersproject/bytes'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { AppVoting } from '@/api/modules/verify'
import {
  createVotingContract,
  createVotingRegistrationContract,
} from '@/api/modules/verify/helpers/contracts'
import { formatDateDiff } from '@/helpers'
import { useVotingsContext } from '@/pages/Votings/contexts'
import { useWeb3State } from '@/store'

export const useAppVotingDetails = (pairIdOrInstance: string | AppVoting) => {
  const { appVotings } = useVotingsContext()
  const { provider } = useWeb3State()

  const { t } = useTranslation()

  const appVoting = useMemo(() => {
    return typeof pairIdOrInstance === 'string'
      ? appVotings.find(
          voting =>
            btoa(`${voting.registration.contract_address}${voting.voting?.contract_address}`) ===
            pairIdOrInstance,
        )
      : (pairIdOrInstance as AppVoting)
  }, [pairIdOrInstance, appVotings])

  const pairId = useMemo(
    () => btoa(`${appVoting?.registration.contract_address}${appVoting?.voting?.contract_address}`),
    [appVoting],
  )

  const isVotingExist = useMemo(
    () =>
      !!appVoting?.voting?.values?.votingStartTime || !!appVoting?.voting?.values?.votingEndTime,
    [appVoting?.voting?.values?.votingStartTime, appVoting?.voting?.values?.votingEndTime],
  )

  const isRegistrationHasBegun = useMemo(() => {
    return time().isAfter(time(appVoting?.registration?.values.commitmentStartTime.toNumber()))
  }, [appVoting?.registration?.values?.commitmentStartTime])

  const isRegistrationHasEnded = useMemo(() => {
    return time().isAfter(time(appVoting?.registration?.values.commitmentEndTime.toNumber()))
  }, [appVoting?.registration?.values.commitmentEndTime])

  const isVotingHasBegun = useMemo(() => {
    return time().isAfter(time(appVoting?.voting?.values.votingStartTime.toNumber()))
  }, [appVoting])

  const isVotingEnded = useMemo(() => {
    return time().isAfter(time(appVoting?.voting?.values.votingEndTime.toNumber()))
  }, [appVoting?.voting?.values.votingEndTime])

  const appVotingDesc = useMemo(() => {
    if (isVotingHasBegun) return appVoting?.voting

    return appVoting?.registration
  }, [appVoting?.registration, appVoting?.voting, isVotingHasBegun])

  const endTimerMessage = useMemo(() => {
    if (isVotingEnded) return t('voting-details.voting-ended')

    if (isVotingHasBegun)
      return t('voting-details.voting-end-timer', {
        endTime: formatDateDiff(appVoting?.voting?.values.votingEndTime.toNumber() ?? 0),
      })

    if (isRegistrationHasEnded)
      return isVotingExist
        ? t('voting-details.voting-start-timer', {
            startTime: formatDateDiff(appVoting?.voting?.values.votingStartTime.toNumber() ?? 0),
          })
        : t('voting-details.commitment-results-timer', {
            endTime: formatDateDiff(
              appVoting?.registration.values.commitmentEndTime.toNumber() ?? 0,
            ),
          })

    if (isRegistrationHasBegun)
      return t('voting-details.commitment-end-timer', {
        endTime: formatDateDiff(appVoting?.registration.values.commitmentEndTime.toNumber() ?? 0),
      })

    return t('voting-details.commitment-start-timer', {
      startTime: formatDateDiff(appVoting?.registration.values.commitmentStartTime.toNumber() ?? 0),
    })
  }, [
    appVoting?.registration.values.commitmentEndTime,
    appVoting?.registration.values.commitmentStartTime,
    appVoting?.voting?.values.votingEndTime,
    appVoting?.voting?.values.votingStartTime,
    isRegistrationHasBegun,
    isRegistrationHasEnded,
    isVotingEnded,
    isVotingExist,
    isVotingHasBegun,
    t,
  ])

  const getIsUserRegistered = useCallback(
    async (documentNullifier: string) => {
      if (!appVoting) throw new TypeError('Voting is not found')

      const registrationInstance = createVotingRegistrationContract(
        appVoting.registration.contract_address,
        provider?.rawProvider,
      )

      return registrationInstance.contractInstance.isUserRegistered(documentNullifier)
    },
    [appVoting, provider?.rawProvider],
  )

  const getIsUserVoted = useCallback(
    (nullifier: string) => {
      if (!appVoting?.voting?.contract_address) throw new TypeError('Voting contract is not found')

      const registrationInstance = createVotingContract(
        appVoting?.voting?.contract_address,
        provider?.rawProvider,
      )

      return registrationInstance.contractInstance.nullifiers(
        arrayify(BigNumber.from(nullifier).toHexString()),
      )
    },
    [appVoting?.voting?.contract_address, provider?.rawProvider],
  )

  return {
    pairId,

    appVoting,
    isRegistrationHasBegun,
    isVotingHasBegun,
    isVotingEnded,
    isRegistrationHasEnded,

    appVotingDesc,
    endTimerMessage,

    getIsUserRegistered,
    getIsUserVoted,
  }
}
