import { useCallback, useState } from 'react'

import {
  buildAppRequest,
  ClaimTypes,
  ClaimTypesMapOnChain,
  ProofRequestResponse,
  subscribeToAppRequestResponse,
} from '@/api/modules/verify'

export const useAppRequest = <T extends ClaimTypes>(
  reqOpts: ClaimTypesMapOnChain[T],
): {
  request: string
  cancelSubscription: () => void

  start: (
    onSuccess: (response: ProofRequestResponse[T], cancelCb: () => void) => Promise<void>,
  ) => Promise<void>
} => {
  const [request, setRequest] = useState('')
  const [cancelSubscription, setCancelSubscription] = useState<() => void>(() => {})

  const start = useCallback(
    async (
      onSuccess: (response: ProofRequestResponse[T], cancelCb: () => void) => Promise<void>,
    ) => {
      const { request, verificationId, jwtToken } = await buildAppRequest(reqOpts)

      const cancelSubscription = subscribeToAppRequestResponse(
        verificationId,
        jwtToken,
        (response, cancelCb) => {
          onSuccess(response as ProofRequestResponse[T], cancelCb)
        },
      )

      setCancelSubscription(() => {
        return () => {
          cancelSubscription()
        }
      })

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
