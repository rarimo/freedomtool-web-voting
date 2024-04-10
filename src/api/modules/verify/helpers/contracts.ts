import { config } from '@config'
import type { RawProvider } from '@distributedlab/w3p'
import type { Provider } from '@ethersproject/abstract-provider'
import type { Signer } from '@ethersproject/abstract-signer'
import { type ExternalProvider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers'

import {
  RegisterVerifier__factory,
  Voting__factory,
  VotingRegistration__factory,
  VotingRegistry__factory,
} from '@/types'

type AbstractFactoryClass = {
  connect: (address: string, signerOrProvider: Signer | Provider) => unknown
  createInterface: () => unknown
}

type AbstractFactoryClassReturnType<F extends AbstractFactoryClass> = {
  contractInstance: ReturnType<F['connect']>
  contractInterface: ReturnType<F['createInterface']>
}

const createContract = <F extends AbstractFactoryClass>(
  address: string,
  provider: RawProvider | undefined,
  factoryClass: F,
): AbstractFactoryClassReturnType<F> => {
  const fallbackProvider = new JsonRpcProvider(config.RPC_URL)

  const targetProvider = provider
    ? new Web3Provider(provider as ExternalProvider, 'any')
    : fallbackProvider

  const contractInstance = factoryClass.connect(address, targetProvider) as ReturnType<F['connect']>

  const contractInterface = factoryClass.createInterface() as ReturnType<F['createInterface']>

  return {
    contractInstance,
    contractInterface,
  }
}

export const createRegisterVerifierContract = (address: string, provider?: RawProvider) => {
  return createContract(address, provider, RegisterVerifier__factory)
}

export const createVotingContract = (address: string, provider?: RawProvider) => {
  return createContract(address, provider, Voting__factory)
}

export const createVotingRegistrationContract = (address: string, provider?: RawProvider) => {
  return createContract(address, provider, VotingRegistration__factory)
}

export const createVotingRegistryContract = (address: string, provider?: RawProvider) => {
  return createContract(address, provider, VotingRegistry__factory)
}
