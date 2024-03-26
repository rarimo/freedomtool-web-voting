import type { PublicSignals } from 'snarkjs'

import { api } from '@/api/clients'
import { RegistrationRemarkDetails, VotingRemarkDetails } from '@/api/modules/verify'
import { IVoting, VerifierHelper } from '@/types/contracts/Voting'
import { IRegistration } from '@/types/contracts/VotingRegistration'

export const signUpForVoting = async (votingAddress: string, callData: string) => {
  return api.post('/verify-proof', {
    body: {
      data: {
        votingAddress,
        callData,
      },
    },
  })
}

export const vote = async (
  proof: VerifierHelper.ProofPointsStruct,
  publicSignals: PublicSignals,
  nullifierHash: string,
) => {
  return api.post('/vote', {
    body: {
      data: {
        ...proof,
        publicSignals,
        nullifierHash,
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
    description: params.contractAddress,
    external_url: '',

    candidates: {},
  }
}
