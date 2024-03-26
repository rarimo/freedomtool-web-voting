import { ClaimTypes } from '@/api/modules/verify/enums'

export type ProofRequestResponse = {
  [ClaimTypes.Registration]: {
    type: ClaimTypes.Registration
    data: {
      proveIdentityParams: {
        issuingAuthority: string
        documentNullifier: string
        commitment: string
      }
      registerProofParams: {
        a: string[]
        b: [[string, string], [string, string]]
        c: [string, string]
        inputs: string[]
        statesMerkleData: {
          merkleProof: string[]
          createdAtTimestamp: string
          issuerState: string
          issuerId: string
        }
      }
    }
  }
  [ClaimTypes.Voting]: {
    type: ClaimTypes.Voting
    data: {
      proveIdentityParams: {
        issuingAuthority: string
        documentNullifier: string
        commitment: string
      }
      registerProofParams: {
        a: string[]
        b: [[string, string], [string, string]]
        c: [string, string]
        inputs: string[]
        statesMerkleData: {
          merkleProof: string
          createdAtTimestamp: string
          issuerState: string
          issuerId: string
        }
      }
    }
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
      metadata_url: string
      // callback: string
    }
  }
}
