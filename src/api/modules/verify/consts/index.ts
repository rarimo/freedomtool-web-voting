import { ClaimTypes } from '@/api/modules/verify/enums'

export const CLAIM_TYPES_CHECKS_VALUES_MAP: Record<ClaimTypes, unknown> = {
  [ClaimTypes.AuthClaim]: 'hash',
}

export const CLAIM_TYPES_MAP_ON_CHAIN: Record<ClaimTypes, unknown> = {
  [ClaimTypes.AuthClaim]: {
    id: 1,
    circuitId: 'credentialAtomicQueryMTPV2OnChain',
    query: {
      allowedIssuers: ['*'],
      context:
        'https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld',
      credentialSubject: {
        birthday: {
          $eq: CLAIM_TYPES_CHECKS_VALUES_MAP[ClaimTypes.AuthClaim],
        },
      },
      type: ClaimTypes.AuthClaim,
    },
  },
}
