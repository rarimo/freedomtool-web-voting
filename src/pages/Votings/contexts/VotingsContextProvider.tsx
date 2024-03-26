import { fetcher } from '@distributedlab/fetcher'
import { constants, providers } from 'ethers'
import { createContext, PropsWithChildren, useContext } from 'react'

import {
  AppVoting,
  fallbackRegistrationRemarkDetails,
  fallbackVotingRemarkDetails,
  RegistrationRemarkDetails,
  VotingRemarkDetails,
  VotingTypes,
} from '@/api/modules/verify'
import { config } from '@/config'
import { useWeb3Context } from '@/contexts'
import { useLoading } from '@/hooks'
import { Voting__factory, VotingRegistration__factory, VotingRegistry__factory } from '@/types'

type VotingsContextValues = {
  appVotings: AppVoting[]
  isVotingsLoading: boolean
  isVotingsLoadingError: boolean
}

const VotingsContext = createContext<VotingsContextValues>({
  appVotings: [],
  isVotingsLoading: false,
  isVotingsLoadingError: false,
})

export const VotingsContextProvider = ({ ...rest }: PropsWithChildren) => {
  const { provider } = useWeb3Context()

  const {
    data: appVotings,
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

          const isVotingContractExist = address.toLowerCase() !== constants.AddressZero

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

  return (
    <VotingsContext.Provider
      value={{
        appVotings,
        isVotingsLoading,
        isVotingsLoadingError,
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
