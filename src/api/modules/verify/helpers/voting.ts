import { api } from '@/api/clients'
import { RegistrationRemarkDetails, VotingRemarkDetails } from '@/api/modules/verify'
import { IVoting } from '@/types/contracts/Voting'
import { IRegistration } from '@/types/contracts/VotingRegistration'

export const signUpForVoting = async (txData: string) => {
  return api.post('/integrations/proof-verification-relayer/v1/register', {
    body: {
      data: {
        tx_data: txData,
      },
    },
  })
}

export const vote = async (registrationAddress: string, votingAddress: string, txData: string) => {
  return api.post('/integrations/proof-verification-relayer/v1/vote', {
    body: {
      data: {
        registration: registrationAddress,
        voting: votingAddress,
        tx_data: txData,
      },
    },
  })
}

export const fallbackRegistrationRemarkDetails = (params: {
  remark: string
  values: IRegistration.RegistrationValuesStructOutput
  counters: IRegistration.RegistrationCountersStructOutput
  contractAddress: string
}): RegistrationRemarkDetails => {
  return {
    chain_id: '',
    contract_address: params.contractAddress,
    name: params.contractAddress,
    excerpt: 'Lorem ipsum dolor sit amet concestetur!',
    description: params.contractAddress,
    external_url: '',
  }
}

export const fallbackVotingRemarkDetails = (params: {
  remark: string
  values: IVoting.VotingValuesStructOutput
  counters: IVoting.VotingCountersStructOutput
  contractAddress: string
}): VotingRemarkDetails => {
  return {
    chain_id: '',
    contract_address: params.contractAddress,
    name: params.contractAddress,
    excerpt: 'Lorem ipsum dolor sit amet concestetur!',
    description: params.contractAddress,
    external_url: '',

    candidates: {},
  }
}
