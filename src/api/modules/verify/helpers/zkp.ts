import { Poseidon } from '@iden3/js-crypto'
import { BytesLike, utils } from 'ethers'
import { groth16 } from 'snarkjs'
import { v4 as uuidv4 } from 'uuid'

import {
  AppRequestOpts,
  CLAIM_TYPES_MAP_ON_CHAIN,
  ProofRequestResponse,
} from '@/api/modules/verify'
import { config } from '@/config'
import { VerifierHelper } from '@/types/contracts/Voting'

export type SecretPair = {
  secret: string
  nullifier: string
}

function splitHexIntoChunks(hexString: string, chunkSize = 64) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g')
  const chunks = hexString.match(regex)

  if (!chunks) {
    throw new Error('Invalid hex string')
  }

  return chunks.map(chunk => '0x' + chunk)
}

export function poseidonHash(data: string): string {
  data = utils.hexlify(data)
  const chunks = splitHexIntoChunks(data.replace('0x', ''), 64)
  const inputs = chunks.map(v => BigInt(v))

  // FIXME
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return utils.hexZeroPad(Poseidon.hash(inputs), 32)
}

export function generateSecrets(): SecretPair {
  const secret = utils.randomBytes(31)
  const nullifier = utils.randomBytes(31)

  return {
    secret: padElement(utils.hexlify(secret)),
    nullifier: padElement(utils.hexlify(nullifier)),
  }
}

export function getCommitment(pair: SecretPair): string {
  return poseidonHash(pair.secret + pair.nullifier.replace('0x', ''))
}

function padElement(element: BytesLike) {
  return utils.hexZeroPad(element, 32)
}

export function getNullifierHash(pair: SecretPair): string {
  return poseidonHash(pair.nullifier)
}

export async function getVoteZKP(
  pair: SecretPair,
  root: string,
  candidateHash: string,
  votingAddress: string,
  siblings: string[],
) {
  const nullifierHash = getNullifierHash(pair)

  const { proof, publicSignals } = await groth16.fullProve(
    {
      root: BigInt(root),
      vote: candidateHash,
      votingAddress,
      secret: pair.secret,
      nullifier: pair.nullifier,
      siblings,
    },
    `./test/circuits/voting.wasm`,
    `./test/circuits/voting.zkey`,
  )

  swap(proof.pi_b[0], 0, 1)
  swap(proof.pi_b[1], 0, 1)

  const a = proof.pi_a.slice(0, 2).map(x => padElement(x)) as [string, string]
  const b = proof.pi_b.slice(0, 2).map(x => x.map(y => padElement(y))) as [
    [string, string],
    [string, string],
  ]
  const c = proof.pi_c.slice(0, 2).map(x => padElement(x)) as [string, string]

  const formattedProof: VerifierHelper.ProofPointsStruct = {
    a,
    b,
    c,
  }

  return {
    publicSignals,
    formattedProof,
    nullifierHash,
  }
}

// Function to swap two elements in an array
function swap(arr: unknown[], i: number, j: number) {
  const temp = arr[i]
  arr[i] = arr[j]
  arr[j] = temp
}

export const createRequestOnChain = (
  reason: string,
  message: string,
  sender: string,
  callbackUrl: string,
) => {
  const uuid = uuidv4()

  return {
    id: uuid,
    thid: uuid,
    from: sender,
    typ: 'application/iden3comm-plain-json',
    type: 'https://iden3-communication.io/authorization/1.0/request',
    body: {
      reason: reason,
      message: message,
      callbackUrl: callbackUrl,
      scope: [],
    },
  }
}

export const createRequest = async (opts: AppRequestOpts) => {
  // const { data } = await api.get<{
  //   verification_id: string
  //   jwt: string
  // }>('/integrations/verify-proxy/v1/public/verify/request')

  const data = {
    verification_id: 'qwert-qwert-qwert-qwert',
    jwt: 'qwerty',
  }

  const request = createRequestOnChain(
    opts.reason,
    opts.message,
    opts.sender,
    `${config.API_URL}/integrations/verify-proxy/v1/public/verify/callback/${data.verification_id}`,
  )

  return {
    request: {
      ...request,
      id: data.verification_id,
      thid: data.verification_id,
      body: {
        ...request.body,
        scope: [CLAIM_TYPES_MAP_ON_CHAIN[opts.claimType]],
      },
    },
    jwtToken: data.jwt,
  }
}

export const getRequestResponse = (
  verificationId: string,
  jwtToken: string,
  callback: (res: ProofRequestResponse) => void,
): (() => void) => {
  // Create WebSocket connection.
  // const socket = new WebSocket(
  //   `ws://${config.API_URL}/integrations/verify-proxy/v1/public/verify/response/${verificationId}`,
  // )
  //
  // // Connection opened
  // socket.addEventListener('open', event => {
  //   console.log('WebSocket connection opened', event)
  //
  //   socket.send(
  //     JSON.stringify({
  //       Authorization: `Bearer ${jwtToken}`,
  //     }),
  //   )
  // })
  //
  // // Listen for messages
  // socket.addEventListener('message', event => {
  //   console.log('Message from server ', event)
  //
  //   if (!event.data) return
  //
  //   callback(event.data)
  // })
  //
  // return socket.close

  // TODO: remove mocked data
  setTimeout(() => {
    callback({
      // eslint-disable-next-line max-len
      jwz: `eyJhbGciOiJncm90aDE2IiwiY2lyY3VpdElkIjoiYXV0aFYyIiwiY3JpdCI6WyJjaXJjdWl0SWQiXSwidHlwIjoiSldaIn0.bXltZXNzYWdl.eyJwcm9vZiI6eyJwaV9hIjpbIjU4OTA4MTc2NDc0NDY4MzQ2MDU3NjU3NzA0NTExMDIyMDg4NjMyMDkxNDgwMTE5NDgzNjA0MDQ3NDU0ODA2NzE1NDM2MjU5MTkwNDIiLCI2OTY1MzI0OTI3MDYzMDQxOTU2NTIwODg5ODU1MDcxNjU1OTg5Mzg4NzQyODM1ODgzOTI1NjU4MDI1NDE0MjM4OTQ2OTkxNjE1ODMwIiwiMSJdLCJwaV9iIjpbWyIxNjgwMjkyNTc5OTM3NjI4MDExOTc1MTk2MTk1MDEzNjQ5NjkyMjMyOTU1NDI5Mjc0Nzc5OTE1NDI2MDQwMzMwNTM0Njc1NDU1Mzk5NCIsIjIwNzkzNDcyNDAwMzczNDkzMjIyNzAyNDY4NDcxMjQzNzcwMzk3NzY1MzY0OTc3NDA0NDQwNTQ2Mzc0MTkxNjU2OTM0NDE3Mjg1MDQxIl0sWyI2MTI1MjcxNjYyOTI4NDUzMjQ5NDgyMjc5MjQ2ODA2NTIxNTE2MzU5NDQwMTcxMDM1MzgxMzU4OTI3MjI4Njc2NTQxNTc0NTg5MDkxIiwiNTY4MDc3OTcxNTc0MjMyMjI0ODQyOTM0NDc1ODA5NDk0MzMyMzE1OTIzOTQzNjkyNzI3MjM3NDEwOTkxMzYzOTAyMjM2NDMyMjYwNiJdLFsiMSIsIjAiXV0sInBpX2MiOlsiOTQ4MTkzNTE5MTMwNTA0OTM5MTA3MjkxMDkxNzE2ODQzNzA0OTI4MjQyMzc3NDQ5MDM4NzMwNDU3NzM3MTI4Mjc0Mjc1NTc3ODYwOCIsIjEyMDMxNDE1NjE1ODExNTEzNzc2OTcwMDYwOTgzMDk2NTMxNzcwMTcwNDAxMjkzODEwMTQwMDY2ODM1NzkyMjk4NTcwNDQxMzcyMTg3IiwiMSJdLCJwcm90b2NvbCI6Imdyb3RoMTYiLCJjdXJ2ZSI6ImJuMTI4In0sInB1Yl9zaWduYWxzIjpbIjIzMTQ4OTM2NDY2MzM0MzUwNzQ0NTQ4NzkwMDEyMjk0NDg5MzY1MjA3NDQwNzU0NTA5OTg4OTg2Njg0Nzk3NzA4MzcwMDUxMDczIiwiNjExMDUxNzc2ODI0OTU1OTIzODE5MzQ3NzQzNTQ1NDc5MjAyNDczMjE3Mzg2NTQ4ODkwMDI3MDg0OTYyNDMyODY1MDc2NTY5MTQ5NCIsIjEyNDM5MDQ3MTE0Mjk5NjE4NTg3NzQyMjA2NDc2MTA3MjQyNzM3OTg5MTg0NTc5OTE0ODYwMzE1NjcyNDQxMDA3NjcyNTkyMzk3NDciXX0`,
      statesMerkleData: {
        issuerId: 'mockedIssuerId',
        state: {
          hash: '',
          createdAtTimestamp: '1234123',
          index: '',
          lastUpdateOperationIndex: '',
        },
        merkleProof: [],
      },
      updateStateDetails: {
        stateRootHash: '',
        gistRootDataStruct: {
          root: '',
          createdAtTimestamp: '',
        },
        proof: '',
      },
      documentNullifier: '',
    })
  }, 5_000)

  return () => {}
}
