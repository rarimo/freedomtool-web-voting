import { ClaimTypes } from '@/api/modules/verify/enums'

export type ProofRequestResponse = {
  [ClaimTypes.Registration]: {
    calldata: string
    document_nullifier: string
  }
  [ClaimTypes.Voting]: {
    calldata: string
    document_nullifier: string
    nullifier: string
  }
}

export type ClaimTypesMapOnChain = {
  [ClaimTypes.Registration]: {
    type: ClaimTypes.Registration
    data: {
      metadata_url: string
      // callback: string
    }
  }
  [ClaimTypes.Voting]: {
    type: ClaimTypes.Voting
    data: {
      registration_address: string
      voting_address: string
      choice: string
      metadata_url: string
      // callback: string
    }
  }
}
