export type ProofRequestResponse = {
  updateStateDetails: {
    stateRootHash: string
    gistRootDataStruct: {
      root: string | number
      createdAtTimestamp: string | number
    }
    proof: string
  }
  jwz: string
  documentNullifier: string
  statesMerkleData?: {
    issuerId: string
    state: {
      index: string
      hash: string
      createdAtTimestamp: string
      lastUpdateOperationIndex: string
    }
    merkleProof: string[]
  }
}
