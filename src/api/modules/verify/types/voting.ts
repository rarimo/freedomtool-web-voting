import { IVoting } from '@/types/contracts/Voting'
import { IRegistration } from '@/types/contracts/VotingRegistration'

export type RegistrationRemarkDetails = {
  chain_id: string
  contract_address: string
  name: string
  description: string
  external_url: string
}

export type RegistrationDetails = {
  remark: string
  values: IRegistration.RegistrationValuesStructOutput
  counters: IRegistration.RegistrationCountersStructOutput
} & RegistrationRemarkDetails

export type VotingRemarkDetails = {
  chain_id: string
  contract_address: string
  name: string
  description: string
  external_url: string

  candidates: Record<
    string,
    {
      name: string
      birthday_date: string
      description: string
    }
  >
}

export type VotingDetails = {
  remark: string
  values: IVoting.VotingValuesStructOutput
  counters: IVoting.VotingCountersStructOutput
} & VotingRemarkDetails

export type AppVoting = {
  registration: RegistrationDetails
  voting?: VotingDetails
}
