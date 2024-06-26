/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { Voting, VotingInterface } from "../Voting";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "voteVerifier_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "nullifierHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "candidate",
        type: "bytes32",
      },
    ],
    name: "UserVoted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "proposer",
        type: "address",
      },
      {
        components: [
          {
            internalType: "contract IRegistration",
            name: "registration",
            type: "address",
          },
          {
            internalType: "string",
            name: "remark",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "votingStart",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "votingPeriod",
            type: "uint256",
          },
          {
            internalType: "bytes32[]",
            name: "candidates",
            type: "bytes32[]",
          },
        ],
        indexed: false,
        internalType: "struct IVoting.VotingParams",
        name: "votingParams",
        type: "tuple",
      },
    ],
    name: "VotingInitialized",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_CANDIDATES",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IRegistration",
            name: "registration",
            type: "address",
          },
          {
            internalType: "string",
            name: "remark",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "votingStart",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "votingPeriod",
            type: "uint256",
          },
          {
            internalType: "bytes32[]",
            name: "candidates",
            type: "bytes32[]",
          },
        ],
        internalType: "struct IVoting.VotingParams",
        name: "votingParams_",
        type: "tuple",
      },
    ],
    name: "__Voting_init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "candidates",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProposalStatus",
    outputs: [
      {
        internalType: "enum IVoting.VotingStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRegistrationAddresses",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "nullifiers",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "registration",
    outputs: [
      {
        internalType: "contract IRegistration",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "root_",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "nullifierHash_",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "candidate_",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "uint256[2]",
            name: "a",
            type: "uint256[2]",
          },
          {
            internalType: "uint256[2][2]",
            name: "b",
            type: "uint256[2][2]",
          },
          {
            internalType: "uint256[2]",
            name: "c",
            type: "uint256[2]",
          },
        ],
        internalType: "struct VerifierHelper.ProofPoints",
        name: "proof_",
        type: "tuple",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "voteVerifier",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "votesPerCandidate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "votingInfo",
    outputs: [
      {
        internalType: "string",
        name: "remark",
        type: "string",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "votingStartTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "votingEndTime",
            type: "uint256",
          },
          {
            internalType: "bytes32[]",
            name: "candidates",
            type: "bytes32[]",
          },
        ],
        internalType: "struct IVoting.VotingValues",
        name: "values",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "votesCount",
            type: "uint256",
          },
        ],
        internalType: "struct IVoting.VotingCounters",
        name: "counters",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class Voting__factory {
  static readonly abi = _abi;
  static createInterface(): VotingInterface {
    return new utils.Interface(_abi) as VotingInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Voting {
    return new Contract(address, _abi, signerOrProvider) as Voting;
  }
}
