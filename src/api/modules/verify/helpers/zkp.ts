import { config } from '@config'
import { Token } from '@iden3/js-jwz'
import get from 'lodash/get'

import { api } from '@/api/clients'
import { ClaimTypes, ClaimTypesMapOnChain, ProofRequestResponse } from '@/api/modules/verify'

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
