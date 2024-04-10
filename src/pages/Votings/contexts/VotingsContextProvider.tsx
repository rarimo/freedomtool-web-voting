import { fetcher } from '@distributedlab/fetcher'
import { AddressZero } from '@ethersproject/constants'
import { createContext, PropsWithChildren, useContext } from 'react'

import {
  AppVoting,
  fallbackRegistrationRemarkDetails,
  fallbackVotingRemarkDetails,
  RegistrationRemarkDetails,
  VotingRemarkDetails,
  VotingTypes,
} from '@/api/modules/verify'
import {
  createVotingContract,
  createVotingRegistrationContract,
  createVotingRegistryContract,
} from '@/api/modules/verify/helpers/contracts'
import { config } from '@/config'
import { useLoading } from '@/hooks'
import { useWeb3State } from '@/store'

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
  const { provider } = useWeb3State()

  const {
    data: appVotings,
    isLoading: isVotingsLoading,
    isLoadingError: isVotingsLoadingError,
  } = useLoading<AppVoting[]>(
    [],
    async (): Promise<AppVoting[]> => {
      const votingRegistryInstance = createVotingRegistryContract(
        config.VOTING_REGISTRY_CONTRACT_ADDRESS,
        provider?.rawProvider,
      )

      // VotingRegistration contracts addresses
      const registrationContractAddresses = await votingRegistryInstance.contractInstance[
        'listPoolsByProposerAndType'
      ](config.VOTING_DEPLOYER_CONTRACT_ADDRESS, VotingTypes.SimpleRegistration, 0, 1000)

      const votingsContractAddresses = await Promise.all(
        registrationContractAddresses.map(async address => {
          return votingRegistryInstance.contractInstance.getVotingForRegistration(
            config.VOTING_DEPLOYER_CONTRACT_ADDRESS,
            address,
          )
        }),
      )

      return Promise.all(
        votingsContractAddresses.map(async (address, idx) => {
          const registrationInstance = createVotingRegistrationContract(
            registrationContractAddresses[idx],
            provider?.rawProvider,
          )

          const registrationInfo = await registrationInstance.contractInstance.registrationInfo()

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

          const isVotingContractExist = address.toLowerCase() !== AddressZero

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

          const votingInstance = createVotingContract(address, provider?.rawProvider)

          const votingInfo = await votingInstance.contractInstance.votingInfo()

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
