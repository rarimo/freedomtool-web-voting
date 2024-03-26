import { config } from '@config'
import { Poseidon } from '@iden3/js-crypto'
import { BytesLike, utils } from 'ethers'
import { groth16 } from 'snarkjs'

import { ClaimTypes, ClaimTypesMapOnChain, ProofRequestResponse } from '@/api/modules/verify'
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

export const buildAppRequest = async <T extends ClaimTypes>(opts: ClaimTypesMapOnChain[T]) => {
  // const { data } = await api.get<{
  //   verification_id: string
  //   jwt: string
  // }>('/integrations/verify-proxy/v1/public/verify/request')

  const data = {
    verification_id: 'qwert-qwert-qwert-qwert',
    jwt: 'qwerty',
  }

  return {
    verificationId: data.verification_id,
    request: {
      ...opts,
      callbackUrl: `${config.API_URL}/integrations/verify-proxy/v1/public/verify/callback/${data.verification_id}`,
    },
    jwtToken: data.jwt,
  }
}

export const subscribeToAppRequestResponse = <T extends ClaimTypes>(
  verificationId: string,
  jwtToken: string,
  callback: (res: ProofRequestResponse[T]) => void,
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

  // TODO: get data from callback url and parse jwz token
  // if (!proofResponse?.jwz) {
  //   throw new Error('Invalid proof data')
  // }
  //
  // const jwzToken = await Token.parse(proofResponse?.jwz)
  //
  // const zkProofPayload = JSON.parse(jwzToken.getPayload())
  //
  // const zkpProof = zkProofPayload.body.scope[0] as ZKProof

  const mockedData: ProofRequestResponse[ClaimTypes.Registration] = {
    type: ClaimTypes.Registration,
    data: {
      proveIdentityParams: {
        issuingAuthority: '123',
        documentNullifier: '123',
        commitment: '0x123',
      },
      registerProofParams: {
        a: ['123', '123'],
        b: [
          ['123', '123'],
          ['123', '123'],
        ],
        c: ['123', '123'],
        inputs: ['123', '123', '123'],
        statesMerkleData: {
          merkleProof: ['0x123'],
          createdAtTimestamp: '123',
          issuerState: '123',
          issuerId: '123',
        },
      },
    },
  }

  // TODO: remove mocked data
  setTimeout(() => {
    callback(mockedData as ProofRequestResponse[T])
  }, 5_000)

  return () => {}
}
