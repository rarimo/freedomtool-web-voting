/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export declare namespace IVoting {
  export type VotingParamsStruct = {
    registration: string;
    remark: string;
    votingStart: BigNumberish;
    votingPeriod: BigNumberish;
    candidates: BytesLike[];
  };

  export type VotingParamsStructOutput = [
    string,
    string,
    BigNumber,
    BigNumber,
    string[]
  ] & {
    registration: string;
    remark: string;
    votingStart: BigNumber;
    votingPeriod: BigNumber;
    candidates: string[];
  };

  export type VotingValuesStruct = {
    votingStartTime: BigNumberish;
    votingEndTime: BigNumberish;
    candidates: BytesLike[];
  };

  export type VotingValuesStructOutput = [BigNumber, BigNumber, string[]] & {
    votingStartTime: BigNumber;
    votingEndTime: BigNumber;
    candidates: string[];
  };

  export type VotingCountersStruct = { votesCount: BigNumberish };

  export type VotingCountersStructOutput = [BigNumber] & {
    votesCount: BigNumber;
  };
}

export declare namespace VerifierHelper {
  export type ProofPointsStruct = {
    a: [BigNumberish, BigNumberish];
    b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
    c: [BigNumberish, BigNumberish];
  };

  export type ProofPointsStructOutput = [
    [BigNumber, BigNumber],
    [[BigNumber, BigNumber], [BigNumber, BigNumber]],
    [BigNumber, BigNumber]
  ] & {
    a: [BigNumber, BigNumber];
    b: [[BigNumber, BigNumber], [BigNumber, BigNumber]];
    c: [BigNumber, BigNumber];
  };
}

export interface VotingInterface extends utils.Interface {
  functions: {
    "MAX_CANDIDATES()": FunctionFragment;
    "__Voting_init((address,string,uint256,uint256,bytes32[]))": FunctionFragment;
    "candidates(bytes32)": FunctionFragment;
    "getProposalStatus()": FunctionFragment;
    "getRegistrationAddresses()": FunctionFragment;
    "nullifiers(bytes32)": FunctionFragment;
    "registration()": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "vote(bytes32,bytes32,bytes32,(uint256[2],uint256[2][2],uint256[2]))": FunctionFragment;
    "voteVerifier()": FunctionFragment;
    "votesPerCandidate(bytes32)": FunctionFragment;
    "votingInfo()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "MAX_CANDIDATES"
      | "__Voting_init"
      | "candidates"
      | "getProposalStatus"
      | "getRegistrationAddresses"
      | "nullifiers"
      | "registration"
      | "supportsInterface"
      | "vote"
      | "voteVerifier"
      | "votesPerCandidate"
      | "votingInfo"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "MAX_CANDIDATES",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "__Voting_init",
    values: [IVoting.VotingParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "candidates",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getProposalStatus",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRegistrationAddresses",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "nullifiers",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "registration",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "vote",
    values: [BytesLike, BytesLike, BytesLike, VerifierHelper.ProofPointsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "voteVerifier",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "votesPerCandidate",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "votingInfo",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "MAX_CANDIDATES",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "__Voting_init",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "candidates", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getProposalStatus",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRegistrationAddresses",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "nullifiers", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "registration",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "vote", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "voteVerifier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "votesPerCandidate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "votingInfo", data: BytesLike): Result;

  events: {
    "Initialized(uint8)": EventFragment;
    "UserVoted(address,bytes32,bytes32,bytes32)": EventFragment;
    "VotingInitialized(address,(address,string,uint256,uint256,bytes32[]))": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UserVoted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VotingInitialized"): EventFragment;
}

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface UserVotedEventObject {
  user: string;
  root: string;
  nullifierHash: string;
  candidate: string;
}
export type UserVotedEvent = TypedEvent<
  [string, string, string, string],
  UserVotedEventObject
>;

export type UserVotedEventFilter = TypedEventFilter<UserVotedEvent>;

export interface VotingInitializedEventObject {
  proposer: string;
  votingParams: IVoting.VotingParamsStructOutput;
}
export type VotingInitializedEvent = TypedEvent<
  [string, IVoting.VotingParamsStructOutput],
  VotingInitializedEventObject
>;

export type VotingInitializedEventFilter =
  TypedEventFilter<VotingInitializedEvent>;

export interface Voting extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: VotingInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    MAX_CANDIDATES(overrides?: CallOverrides): Promise<[BigNumber]>;

    __Voting_init(
      votingParams_: IVoting.VotingParamsStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    candidates(arg0: BytesLike, overrides?: CallOverrides): Promise<[boolean]>;

    getProposalStatus(overrides?: CallOverrides): Promise<[number]>;

    getRegistrationAddresses(overrides?: CallOverrides): Promise<[string[]]>;

    nullifiers(arg0: BytesLike, overrides?: CallOverrides): Promise<[boolean]>;

    registration(overrides?: CallOverrides): Promise<[string]>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    vote(
      root_: BytesLike,
      nullifierHash_: BytesLike,
      candidate_: BytesLike,
      proof_: VerifierHelper.ProofPointsStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    voteVerifier(overrides?: CallOverrides): Promise<[string]>;

    votesPerCandidate(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    votingInfo(
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        IVoting.VotingValuesStructOutput,
        IVoting.VotingCountersStructOutput
      ] & {
        remark: string;
        values: IVoting.VotingValuesStructOutput;
        counters: IVoting.VotingCountersStructOutput;
      }
    >;
  };

  MAX_CANDIDATES(overrides?: CallOverrides): Promise<BigNumber>;

  __Voting_init(
    votingParams_: IVoting.VotingParamsStruct,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  candidates(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;

  getProposalStatus(overrides?: CallOverrides): Promise<number>;

  getRegistrationAddresses(overrides?: CallOverrides): Promise<string[]>;

  nullifiers(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;

  registration(overrides?: CallOverrides): Promise<string>;

  supportsInterface(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  vote(
    root_: BytesLike,
    nullifierHash_: BytesLike,
    candidate_: BytesLike,
    proof_: VerifierHelper.ProofPointsStruct,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  voteVerifier(overrides?: CallOverrides): Promise<string>;

  votesPerCandidate(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  votingInfo(
    overrides?: CallOverrides
  ): Promise<
    [
      string,
      IVoting.VotingValuesStructOutput,
      IVoting.VotingCountersStructOutput
    ] & {
      remark: string;
      values: IVoting.VotingValuesStructOutput;
      counters: IVoting.VotingCountersStructOutput;
    }
  >;

  callStatic: {
    MAX_CANDIDATES(overrides?: CallOverrides): Promise<BigNumber>;

    __Voting_init(
      votingParams_: IVoting.VotingParamsStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    candidates(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;

    getProposalStatus(overrides?: CallOverrides): Promise<number>;

    getRegistrationAddresses(overrides?: CallOverrides): Promise<string[]>;

    nullifiers(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;

    registration(overrides?: CallOverrides): Promise<string>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    vote(
      root_: BytesLike,
      nullifierHash_: BytesLike,
      candidate_: BytesLike,
      proof_: VerifierHelper.ProofPointsStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    voteVerifier(overrides?: CallOverrides): Promise<string>;

    votesPerCandidate(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    votingInfo(
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        IVoting.VotingValuesStructOutput,
        IVoting.VotingCountersStructOutput
      ] & {
        remark: string;
        values: IVoting.VotingValuesStructOutput;
        counters: IVoting.VotingCountersStructOutput;
      }
    >;
  };

  filters: {
    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "UserVoted(address,bytes32,bytes32,bytes32)"(
      user?: string | null,
      root?: null,
      nullifierHash?: null,
      candidate?: null
    ): UserVotedEventFilter;
    UserVoted(
      user?: string | null,
      root?: null,
      nullifierHash?: null,
      candidate?: null
    ): UserVotedEventFilter;

    "VotingInitialized(address,(address,string,uint256,uint256,bytes32[]))"(
      proposer?: string | null,
      votingParams?: null
    ): VotingInitializedEventFilter;
    VotingInitialized(
      proposer?: string | null,
      votingParams?: null
    ): VotingInitializedEventFilter;
  };

  estimateGas: {
    MAX_CANDIDATES(overrides?: CallOverrides): Promise<BigNumber>;

    __Voting_init(
      votingParams_: IVoting.VotingParamsStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    candidates(arg0: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;

    getProposalStatus(overrides?: CallOverrides): Promise<BigNumber>;

    getRegistrationAddresses(overrides?: CallOverrides): Promise<BigNumber>;

    nullifiers(arg0: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;

    registration(overrides?: CallOverrides): Promise<BigNumber>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    vote(
      root_: BytesLike,
      nullifierHash_: BytesLike,
      candidate_: BytesLike,
      proof_: VerifierHelper.ProofPointsStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    voteVerifier(overrides?: CallOverrides): Promise<BigNumber>;

    votesPerCandidate(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    votingInfo(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    MAX_CANDIDATES(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    __Voting_init(
      votingParams_: IVoting.VotingParamsStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    candidates(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getProposalStatus(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getRegistrationAddresses(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    nullifiers(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    registration(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    vote(
      root_: BytesLike,
      nullifierHash_: BytesLike,
      candidate_: BytesLike,
      proof_: VerifierHelper.ProofPointsStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    voteVerifier(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    votesPerCandidate(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    votingInfo(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
