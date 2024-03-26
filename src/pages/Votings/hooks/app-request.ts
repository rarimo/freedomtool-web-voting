import { useCallback, useState } from 'react'

import {
  AppRequestOpts,
  createRequest,
  generateSecrets,
  getCommitment,
  getRequestResponse,
  ProofRequestResponse,
  SecretPair,
} from '@/api/modules/verify'

export const useAppRequest = (
  reqOpts: AppRequestOpts,
): {
  request: string
  cancelSubscription: () => void

  start: (
    onSuccess: (proofResponse: ProofRequestResponse, secrets: SecretPair) => Promise<void>,
  ) => Promise<void>
} => {
  const [request, setRequest] = useState('')
  const [cancelSubscription, setCancelSubscription] = useState<() => void>(() => {})

  const start = useCallback(
    async (
      onSuccess: (proofResponse: ProofRequestResponse, secrets: SecretPair) => Promise<void>,
    ) => {
      // TODO: get secrets from app?
      const secrets = generateSecrets()

      // TODO: ?
      const commitment = getCommitment(secrets)

      // TODO: upd params
      const { request, jwtToken } = await createRequest(reqOpts)

      const cancelSubscription = getRequestResponse(
        request.id,
        jwtToken,
        (res: ProofRequestResponse) => {
          onSuccess(res, secrets)
        },
      )

      setCancelSubscription(cancelSubscription)

      const requestString = JSON.stringify(request)

      setRequest(requestString)
    },
    [reqOpts],
  )

  return {
    request,

    start,
    cancelSubscription,
  }
}
