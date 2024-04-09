import { config } from '@config'
import { Poseidon } from '@iden3/js-crypto'
import { Token } from '@iden3/js-jwz'
import { BytesLike, utils } from 'ethers'
import get from 'lodash/get'
import { groth16 } from 'snarkjs'

import { api } from '@/api/clients'
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
  const { data } = await api.get<{
    verification_id: string
    jwt: string
  }>('/integrations/verify-proxy/v1/public/verify/request')

  return {
    verificationId: data.verification_id,
    jwtToken: data.jwt,
    request: {
      ...opts,
      data: {
        ...opts.data,
        callback: `${config.API_URL}/integrations/verify-proxy/v1/public/verify/callback/${data.verification_id}`,
      },
    },
  }
}

export const subscribeToAppRequestResponse = <T extends ClaimTypes>(
  verificationId: string,
  jwtToken: string,
  callback: (res: ProofRequestResponse[T], cancelCb: () => void) => void,
): (() => void) => {
  // let tries = 0

  const intervalId = setInterval(async () => {
    try {
      const response = await api.get<{
        jwz: string
      }>(`/integrations/verify-proxy/v1/public/verify/response/${verificationId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })

      if (!response.data.jwz) {
        throw new TypeError('Invalid response')
      }

      const jwzToken = await Token.parse(response.data.jwz)

      const payload = JSON.parse(jwzToken.getPayload())

      callback(payload, () => clearInterval(intervalId))
    } catch (error) {
      if (get(error, 'code') === 429) {
        clearInterval(intervalId)
        throw new Error('Too many requests')
      }
    }
  }, 3_000)

  return () => {
    clearInterval(intervalId)
  }
}
