import { time } from '@distributedlab/tools'
import { providers } from 'ethers'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { AppVoting, ProofRequestResponse } from '@/api/modules/verify'
import { useWeb3Context } from '@/contexts'
import { formatDateDiff } from '@/helpers'
import { useVotingsContext } from '@/pages/Votings/contexts'
import { RegisterVerifier__factory, VotingRegistration__factory } from '@/types'

export const useAppVotingDetails = (pairIdOrInstance: string | AppVoting) => {
  const { appVotings } = useVotingsContext()
  const { provider } = useWeb3Context()

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

  const isRegistrationHasBegun = useMemo(() => {
    return time().isAfter(time(appVoting?.registration?.values.commitmentStartTime.toNumber()))
  }, [appVoting?.registration?.values?.commitmentStartTime])

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

    if (isRegistrationHasBegun && !isVotingHasBegun)
      return t('voting-details.commitment-results-timer', {
        endTime: formatDateDiff(appVoting?.registration.values.commitmentEndTime.toNumber() ?? 0),
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
    isRegistrationHasBegun,
    isVotingEnded,
    isVotingHasBegun,
    t,
  ])

  const getIsUserRegistered = useCallback(
    async (proofResponse: ProofRequestResponse) => {
      if (!provider?.rawProvider) throw new TypeError('Provider is not connected')

      if (!appVoting) throw new TypeError('Voting is not found')

      if (!proofResponse?.documentNullifier) return false

      const registrationInstance = VotingRegistration__factory.connect(
        appVoting.registration.contract_address,
        provider.rawProvider as unknown as providers.JsonRpcProvider,
      )

      const registerVerifierContractAddress = await registrationInstance.registerVerifier()

      const registerVerifierInstance = RegisterVerifier__factory.connect(
        registerVerifierContractAddress,
        provider.rawProvider as unknown as providers.JsonRpcProvider,
      )

      return registerVerifierInstance.isIdentityRegistered(proofResponse.documentNullifier)
    },
    [appVoting, provider?.rawProvider],
  )

  return {
    pairId,

    appVoting,
    isRegistrationHasBegun,
    isVotingHasBegun,
    isVotingEnded,
    appVotingDesc,
    endTimerMessage,
    getIsUserRegistered,
  }
}
