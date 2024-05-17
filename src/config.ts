import packageJson from '../package.json'

export type Config = {
  APP_NAME: string
  API_URL: string
  BUILD_VERSION: string

  RPC_URL: string
  VOTING_REGISTRY_CONTRACT_ADDRESS: string
  VOTING_DEPLOYER_CONTRACT_ADDRESS: string

  APP_STORE_LINK: string
}

export const config: Config = {
  APP_NAME: import.meta.env.VITE_APP_NAME,
  API_URL: import.meta.env.VITE_API_URL,
  BUILD_VERSION: packageJson.version || import.meta.env.VITE_APP_BUILD_VERSION,

  RPC_URL: import.meta.env.VITE_RPC_URL,
  VOTING_REGISTRY_CONTRACT_ADDRESS: import.meta.env.VITE_VOTING_REGISTRY_CONTRACT_ADDRESS,
  VOTING_DEPLOYER_CONTRACT_ADDRESS: import.meta.env.VITE_VOTING_DEPLOYER_CONTRACT_ADDRESS,

  APP_STORE_LINK: import.meta.env.VITE_APP_STORE_LINK,
}
