import { fetcher } from '@distributedlab/fetcher'
import { ethers, providers } from 'ethers'
import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react'

import {
  AppVoting,
  ClaimTypes,
  createRequest,
  fallbackRegistrationRemarkDetails,
  fallbackVotingRemarkDetails,
  generateSecrets,
  getCommitment,
  getRequestResponse,
  ProofRequestResponse,
  RegistrationRemarkDetails,
  SecretPair,
  VotingRemarkDetails,
  VotingTypes,
} from '@/api/modules/verify'
import { config } from '@/config'
import { useWeb3Context } from '@/contexts'
import { useLoading } from '@/hooks'
import { Voting__factory, VotingRegistration__factory, VotingRegistry__factory } from '@/types'

type VotingsContextValues = {
  secrets: SecretPair
  proofResponse: ProofRequestResponse
  isAuthorized: boolean

  AppVotings: AppVoting[]
  isVotingsLoading: boolean
  isVotingsLoadingError: boolean

  buildAuthRequest: () => Promise<string>
  cancelSubscription: () => void
}

const VotingsContext = createContext<VotingsContextValues>({
  secrets: {} as SecretPair,
  proofResponse: {} as ProofRequestResponse,
  isAuthorized: false,

  AppVotings: [],
  isVotingsLoading: false,
  isVotingsLoadingError: false,

  buildAuthRequest: async () => '',
  cancelSubscription: () => {},
})

export const VotingsContextProvider = ({ ...rest }: PropsWithChildren) => {
  const [secrets, setSecrets] = useState<SecretPair>({} as SecretPair)
  const [proofResponse, setProofResponse] = useState<ProofRequestResponse>(
    {} as ProofRequestResponse,
  )

  const [cancelSubscription, setCancelSubscription] = useState<() => void>(() => {})

  const { provider } = useWeb3Context()

  const isAuthorized = useMemo(() => Boolean(proofResponse?.jwz), [proofResponse])

  const {
    data: AppVotings,
    isLoading: isVotingsLoading,
    isLoadingError: isVotingsLoadingError,
  } = useLoading<AppVoting[]>(
    [],
    async (): Promise<AppVoting[]> => {
      if (!provider?.rawProvider) throw new TypeError('Provider is not connected')

      const votingRegistryInstance = VotingRegistry__factory.connect(
        config.VOTING_REGISTRY_CONTRACT_ADDRESS,
        provider.rawProvider as unknown as providers.JsonRpcProvider,
      )

      // VotingRegistration contracts addresses
      const registrationContractAddresses = await votingRegistryInstance[
        'listPoolsByProposerAndType'
      ](config.VOTING_DEPLOYER_CONTRACT_ADDRESS, VotingTypes.SimpleRegistration, 0, 1000)

      const votingsContractAddresses = await Promise.all(
        registrationContractAddresses.map(async address => {
          return votingRegistryInstance.getVotingForRegistration(
            config.VOTING_DEPLOYER_CONTRACT_ADDRESS,
            address,
          )
        }),
      )

      return Promise.all(
        votingsContractAddresses.map(async (address, idx) => {
          const registrationInstance = VotingRegistration__factory.connect(
            registrationContractAddresses[idx],
            provider.rawProvider as unknown as providers.JsonRpcProvider,
          )

          const registrationInfo = await registrationInstance.registrationInfo()

          let registrationRemarkDetails: RegistrationRemarkDetails

          try {
            const { data } = await fetcher.get<RegistrationRemarkDetails>(registrationInfo.remark)

            if (!data) throw new Error('Invalid data')

            registrationRemarkDetails = data
          } catch (error) {
            registrationRemarkDetails = fallbackRegistrationRemarkDetails({
              ...registrationInfo,
              contractAddress: registrationContractAddresses[idx],
            })
          }

          const isVotingContractExist = address.toLowerCase() !== ethers.constants.AddressZero

          if (!isVotingContractExist) {
            return {
              registration: {
                ...registrationRemarkDetails,
                ...registrationInfo,
                values: registrationInfo[1],
                // hotfix if ipfs details is invalid
                contract_address: registrationContractAddresses[idx],
              },
            } as AppVoting
          }

          const votingInstance = Voting__factory.connect(
            address,
            provider.rawProvider as unknown as providers.JsonRpcProvider,
          )

          const votingInfo = await votingInstance.votingInfo()

          let votingRemarkDetails: VotingRemarkDetails

          try {
            const { data } = await fetcher.get<VotingRemarkDetails>(votingInfo.remark)

            if (!data) throw new Error('Invalid data')

            votingRemarkDetails = data
          } catch (error) {
            votingRemarkDetails = fallbackVotingRemarkDetails({
              ...votingInfo,
              contractAddress: address,
            })
          }

          return {
            registration: {
              ...registrationRemarkDetails,
              ...registrationInfo,
              values: registrationInfo[1],
              // hotfix if ipfs details is invalid
              contract_address: registrationContractAddresses[idx],
            },
            voting: {
              ...votingRemarkDetails,
              ...votingInfo,
              values: votingInfo[1],
              // hotfix if ipfs details is invalid
              contract_address: address,
            },
          } as AppVoting
        }),
      )
    },
    {
      loadOnMount: true,
    },
  )

  const buildAuthRequest = useCallback(async () => {
    const secrets = generateSecrets()

    const commitment = getCommitment(secrets)

    // TODO: upd params
    const { request, jwtToken } = await createRequest({
      claimType: ClaimTypes.AuthClaim,
      reason: 'auth', // FIXME
      message: commitment, // FIXME
      sender: 'config.REQUEST_BUILD_SENDER', // FIXME
    })

    setSecrets(secrets)

    const cancelSubscription = getRequestResponse(
      request.id,
      jwtToken,
      (res: ProofRequestResponse) => {
        setProofResponse(res)
      },
    )

    setCancelSubscription(cancelSubscription)

    return JSON.stringify(request)
  }, [])

  return (
    <VotingsContext.Provider
      value={{
        secrets,
        proofResponse,
        isAuthorized,

        AppVotings,
        isVotingsLoading,
        isVotingsLoadingError,

        buildAuthRequest,
        cancelSubscription,
      }}
      {...rest}
    />
  )
}

export const useVotingsContext = () => {
  const votingsContext = useContext(VotingsContext)

  return {
    ...votingsContext,
  }
}
