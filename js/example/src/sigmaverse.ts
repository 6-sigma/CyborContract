import { ActorId, TransactionBuilder, getServiceNamePrefix, getFnNamePrefix, ZERO_ADDRESS, MessageId } from 'sails-js';
import { GearApi, decodeAddress } from '@gear-js/api';
import { TypeRegistry } from '@polkadot/types';

export type CyborRace = "rodriguez" | "nguyen";

export interface CyborTemplate {
  race_name: string;
  price: number | string | bigint;
  basic_damage: number;
  basic_hp: number;
  basic_move_speed: number;
  basic_knockdown_hit: number;
  score_per_block: number | string | bigint;
}

export interface CyborMetadata {
  race: CyborRace;
  cybor_template: CyborTemplate;
  is_have_finishing_skill: boolean;
  mint_at: number;
  image: string;
}

export interface CyborStream {
  race_name: string;
  basic_damage: number;
  basic_hp: number;
  basic_move_speed: number;
  basic_knockdown_hit: number;
  score_per_block: number | string | bigint;
  is_have_finishing_skill: boolean;
  mint_at: number;
  image: string;
  level: number;
  grade: number;
  lucky: number;
  exp: number | string | bigint;
  is_freeze: boolean;
}

export interface CyborNftDebugInfo {
  source: ActorId;
  value: number | string | bigint;
  temp: CyborTemplate;
  minted_count: number | string | bigint;
  owner_by_id: Array<[number | string | bigint, ActorId]>;
  token_group_by_owner_len: number | string | bigint;
  my_tokens1: Array<number | string | bigint>;
  my_tokens2: Array<number | string | bigint>;
  next_token_id: number | string | bigint;
}

export interface ImprintTemplate {
  race_name: string;
  max_lumimemories: number | string | bigint;
  story: string;
  lumimemories_per_block: number | string | bigint;
  price: number | string | bigint;
}

export interface ImprintMetadata {
  race: CyborRace;
  imprint_template: ImprintTemplate;
  mint_at: number;
  image: string;
}

export interface ImprintStream {
  race_name: string;
  max_lumimemories: number | string | bigint;
  mint_at: number;
  story: string;
  lumimemories: number | string | bigint;
  open_story: Array<number>;
  start_at: number;
}

export interface ImprintNftDebugInfo {
  source: ActorId;
  value: number | string | bigint;
  temp: ImprintTemplate;
  minted_count: number | string | bigint;
  owner_by_id: Array<[number | string | bigint, ActorId]>;
  token_group_by_owner_len: number | string | bigint;
  my_tokens1: Array<number | string | bigint>;
  my_tokens2: Array<number | string | bigint>;
  next_token_id: number | string | bigint;
}

export class Sigmaverse {
  public readonly registry: TypeRegistry;
  public readonly cyborNft: CyborNft;
  public readonly imprintNft: ImprintNft;

  constructor(public api: GearApi, public programId?: `0x${string}`) {
    const types: Record<string, any> = {
      CyborRace: {"_enum":["Rodriguez","Nguyen"]},
      CyborTemplate: {"race_name":"String","price":"u128","basic_damage":"u32","basic_hp":"u32","basic_move_speed":"u8","basic_knockdown_hit":"u8","score_per_block":"u64"},
      CyborMetadata: {"race":"CyborRace","cybor_template":"CyborTemplate","is_have_finishing_skill":"bool","mint_at":"u32","image":"String"},
      CyborStream: {"race_name":"String","basic_damage":"u32","basic_hp":"u32","basic_move_speed":"u8","basic_knockdown_hit":"u8","score_per_block":"u64","is_have_finishing_skill":"bool","mint_at":"u32","image":"String","level":"u16","grade":"u16","lucky":"u32","exp":"u128","is_freeze":"bool"},
      CyborNftDebugInfo: {"source":"[u8;32]","value":"u128","temp":"CyborTemplate","minted_count":"u128","owner_by_id":"Vec<(U256, [u8;32])>","token_group_by_owner_len":"u128","my_tokens1":"Vec<U256>","my_tokens2":"Vec<U256>","next_token_id":"U256"},
      ImprintTemplate: {"race_name":"String","max_lumimemories":"u128","story":"String","lumimemories_per_block":"u64","price":"u128"},
      ImprintMetadata: {"race":"CyborRace","imprint_template":"ImprintTemplate","mint_at":"u32","image":"String"},
      ImprintStream: {"race_name":"String","max_lumimemories":"u128","mint_at":"u32","story":"String","lumimemories":"u64","open_story":"Vec<u32>","start_at":"u32"},
      ImprintNftDebugInfo: {"source":"[u8;32]","value":"u128","temp":"ImprintTemplate","minted_count":"u128","owner_by_id":"Vec<(U256, [u8;32])>","token_group_by_owner_len":"u128","my_tokens1":"Vec<U256>","my_tokens2":"Vec<U256>","next_token_id":"U256"},
    }

    this.registry = new TypeRegistry();
    this.registry.setKnownTypes({ types });
    this.registry.register(types);

    this.cyborNft = new CyborNft(this);
    this.imprintNft = new ImprintNft(this);
  }

  defaultCtorFromCode(code: Uint8Array | Buffer): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'upload_program',
      'Default',
      'String',
      'String',
      code,
    );

    this.programId = builder.programId;
    return builder;
  }

  defaultCtorFromCodeId(codeId: `0x${string}`) {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'create_program',
      'Default',
      'String',
      'String',
      codeId,
    );

    this.programId = builder.programId;
    return builder;
  }
}

export class CyborNft {
  constructor(private _program: Sigmaverse) {}

  public burn(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Burn', token_id],
      '(String, String, U256)',
      'Null',
      this._program.programId
    );
  }

  public freeze(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Freeze', token_id],
      '(String, String, U256)',
      'Null',
      this._program.programId
    );
  }

  public getTemplate(race: CyborRace): TransactionBuilder<CyborTemplate> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<CyborTemplate>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'GetTemplate', race],
      '(String, String, CyborRace)',
      'CyborTemplate',
      this._program.programId
    );
  }

  public mint(race: CyborRace): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Mint', race],
      '(String, String, CyborRace)',
      'Null',
      this._program.programId
    );
  }

  public unfreeze(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Unfreeze', token_id],
      '(String, String, U256)',
      'Null',
      this._program.programId
    );
  }

  public upLevel(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'UpLevel', token_id],
      '(String, String, U256)',
      'Null',
      this._program.programId
    );
  }

  public approve(approved: ActorId, token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Approve', approved, token_id],
      '(String, String, [u8;32], U256)',
      'Null',
      this._program.programId
    );
  }

  public transfer(to: ActorId, token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'Transfer', to, token_id],
      '(String, String, [u8;32], U256)',
      'Null',
      this._program.programId
    );
  }

  public transferFrom(from: ActorId, to: ActorId, token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['CyborNft', 'TransferFrom', from, to, token_id],
      '(String, String, [u8;32], [u8;32], U256)',
      'Null',
      this._program.programId
    );
  }

  public async allCybors(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<[number | string | bigint, CyborMetadata]>> {
    const payload = this._program.registry.createType('(String, String)', ['CyborNft', 'AllCybors']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Vec<(U256, CyborMetadata)>)', reply.payload);
    return result[2].toJSON() as unknown as Array<[number | string | bigint, CyborMetadata]>;
  }

  public async allMyCybors(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<[number | string | bigint, CyborStream]>> {
    const payload = this._program.registry.createType('(String, String)', ['CyborNft', 'AllMyCybors']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Vec<(U256, CyborStream)>)', reply.payload);
    return result[2].toJSON() as unknown as Array<[number | string | bigint, CyborStream]>;
  }

  public async cyborInfo(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<CyborStream> {
    const payload = this._program.registry.createType('(String, String, U256)', ['CyborNft', 'CyborInfo', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, CyborStream)', reply.payload);
    return result[2].toJSON() as unknown as CyborStream;
  }

  public async cyborMetadata(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<CyborMetadata> {
    const payload = this._program.registry.createType('(String, String, U256)', ['CyborNft', 'CyborMetadata', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, CyborMetadata)', reply.payload);
    return result[2].toJSON() as unknown as CyborMetadata;
  }

  public async debugInfo(race: CyborRace, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<CyborNftDebugInfo> {
    const payload = this._program.registry.createType('(String, String, CyborRace)', ['CyborNft', 'DebugInfo', race]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, CyborNftDebugInfo)', reply.payload);
    return result[2].toJSON() as unknown as CyborNftDebugInfo;
  }

  public async maxSupply(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<number> {
    const payload = this._program.registry.createType('(String, String)', ['CyborNft', 'MaxSupply']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, u32)', reply.payload);
    return result[2].toNumber() as unknown as number;
  }

  public async balanceOf(owner: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['CyborNft', 'BalanceOf', owner]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, U256)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getApproved(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<ActorId> {
    const payload = this._program.registry.createType('(String, String, U256)', ['CyborNft', 'GetApproved', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, [u8;32])', reply.payload);
    return result[2].toJSON() as unknown as ActorId;
  }

  public async name(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['CyborNft', 'Name']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString() as unknown as string;
  }

  public async ownerOf(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<ActorId> {
    const payload = this._program.registry.createType('(String, String, U256)', ['CyborNft', 'OwnerOf', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, [u8;32])', reply.payload);
    return result[2].toJSON() as unknown as ActorId;
  }

  public async symbol(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['CyborNft', 'Symbol']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString() as unknown as string;
  }

  public subscribeToMintedEvent(callback: (data: { to: ActorId; value: number | string | bigint; next_id: number | string | bigint; len_by_minted: number; len_by_group_user: number }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Minted') {
        callback(this._program.registry.createType('(String, String, {"to":"[u8;32]","value":"U256","next_id":"U256","len_by_minted":"u32","len_by_group_user":"u32"})', message.payload)[2].toJSON() as unknown as { to: ActorId; value: number | string | bigint; next_id: number | string | bigint; len_by_minted: number; len_by_group_user: number });
      }
    });
  }

  public subscribeToBurnedEvent(callback: (data: { from: ActorId; value: number | string | bigint; msg_id: MessageId }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Burned') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256","msg_id":"[u8;32]"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint; msg_id: MessageId });
      }
    });
  }

  public subscribeToFreezeEvent(callback: (data: { from: ActorId; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Freeze') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint });
      }
    });
  }

  public subscribeToUnFreezeEvent(callback: (data: { from: ActorId; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'UnFreeze') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint });
      }
    });
  }

  public subscribeToUplevelEvent(callback: (data: { from: ActorId; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Uplevel') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint });
      }
    });
  }

  public subscribeToDEBUGEvent(callback: (data: { value: CyborNftDebugInfo }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'DEBUG') {
        callback(this._program.registry.createType('(String, String, {"value":"CyborNftDebugInfo"})', message.payload)[2].toJSON() as unknown as { value: CyborNftDebugInfo });
      }
    });
  }

  public subscribeToTransferEvent(callback: (data: { from: ActorId; to: ActorId; token_id: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Transfer') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","to":"[u8;32]","token_id":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; to: ActorId; token_id: number | string | bigint });
      }
    });
  }

  public subscribeToApprovalEvent(callback: (data: { owner: ActorId; approved: ActorId; token_id: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'CyborNft' && getFnNamePrefix(payload) === 'Approval') {
        callback(this._program.registry.createType('(String, String, {"owner":"[u8;32]","approved":"[u8;32]","token_id":"U256"})', message.payload)[2].toJSON() as unknown as { owner: ActorId; approved: ActorId; token_id: number | string | bigint });
      }
    });
  }
}

export class ImprintNft {
  constructor(private _program: Sigmaverse) {}

  public burn(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['ImprintNft', 'Burn', token_id],
      '(String, String, U256)',
      'Null',
      this._program.programId
    );
  }

  public combine(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['ImprintNft', 'Combine', token_id],
      '(String, String, U256)',
      'Null',
      this._program.programId
    );
  }

  public deposit(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['ImprintNft', 'Deposit', token_id],
      '(String, String, U256)',
      'Null',
      this._program.programId
    );
  }

  public getTemplate(race: CyborRace): TransactionBuilder<ImprintTemplate> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<ImprintTemplate>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['ImprintNft', 'GetTemplate', race],
      '(String, String, CyborRace)',
      'ImprintTemplate',
      this._program.programId
    );
  }

  public mint(race: CyborRace): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['ImprintNft', 'Mint', race],
      '(String, String, CyborRace)',
      'Null',
      this._program.programId
    );
  }

  public withdraw(token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['ImprintNft', 'Withdraw', token_id],
      '(String, String, U256)',
      'Null',
      this._program.programId
    );
  }

  public approve(approved: ActorId, token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['ImprintNft', 'Approve', approved, token_id],
      '(String, String, [u8;32], U256)',
      'Null',
      this._program.programId
    );
  }

  public transfer(to: ActorId, token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['ImprintNft', 'Transfer', to, token_id],
      '(String, String, [u8;32], U256)',
      'Null',
      this._program.programId
    );
  }

  public transferFrom(from: ActorId, to: ActorId, token_id: number | string | bigint): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['ImprintNft', 'TransferFrom', from, to, token_id],
      '(String, String, [u8;32], [u8;32], U256)',
      'Null',
      this._program.programId
    );
  }

  public async allImprints(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<[number | string | bigint, ImprintMetadata]>> {
    const payload = this._program.registry.createType('(String, String)', ['ImprintNft', 'AllImprints']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Vec<(U256, ImprintMetadata)>)', reply.payload);
    return result[2].toJSON() as unknown as Array<[number | string | bigint, ImprintMetadata]>;
  }

  public async allMyImprints(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<Array<[number | string | bigint, ImprintStream]>> {
    const payload = this._program.registry.createType('(String, String)', ['ImprintNft', 'AllMyImprints']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Vec<(U256, ImprintStream)>)', reply.payload);
    return result[2].toJSON() as unknown as Array<[number | string | bigint, ImprintStream]>;
  }

  public async debugInfo(race: CyborRace, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<ImprintNftDebugInfo> {
    const payload = this._program.registry.createType('(String, String, CyborRace)', ['ImprintNft', 'DebugInfo', race]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, ImprintNftDebugInfo)', reply.payload);
    return result[2].toJSON() as unknown as ImprintNftDebugInfo;
  }

  public async imprintInfo(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<ImprintStream> {
    const payload = this._program.registry.createType('(String, String, U256)', ['ImprintNft', 'ImprintInfo', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, ImprintStream)', reply.payload);
    return result[2].toJSON() as unknown as ImprintStream;
  }

  public async imprintMetadata(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<ImprintMetadata> {
    const payload = this._program.registry.createType('(String, String, U256)', ['ImprintNft', 'ImprintMetadata', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, ImprintMetadata)', reply.payload);
    return result[2].toJSON() as unknown as ImprintMetadata;
  }

  public async maxSupply(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<number> {
    const payload = this._program.registry.createType('(String, String)', ['ImprintNft', 'MaxSupply']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, u32)', reply.payload);
    return result[2].toNumber() as unknown as number;
  }

  public async balanceOf(owner: ActorId, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<bigint> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['ImprintNft', 'BalanceOf', owner]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, U256)', reply.payload);
    return result[2].toBigInt() as unknown as bigint;
  }

  public async getApproved(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<ActorId> {
    const payload = this._program.registry.createType('(String, String, U256)', ['ImprintNft', 'GetApproved', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, [u8;32])', reply.payload);
    return result[2].toJSON() as unknown as ActorId;
  }

  public async name(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['ImprintNft', 'Name']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString() as unknown as string;
  }

  public async ownerOf(token_id: number | string | bigint, originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<ActorId> {
    const payload = this._program.registry.createType('(String, String, U256)', ['ImprintNft', 'OwnerOf', token_id]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, [u8;32])', reply.payload);
    return result[2].toJSON() as unknown as ActorId;
  }

  public async symbol(originAddress?: string, value?: number | string | bigint, atBlock?: `0x${string}`): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['ImprintNft', 'Symbol']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString() as unknown as string;
  }

  public subscribeToMintedEvent(callback: (data: { to: ActorId; value: number | string | bigint; next_id: number | string | bigint; len_by_minted: number }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'ImprintNft' && getFnNamePrefix(payload) === 'Minted') {
        callback(this._program.registry.createType('(String, String, {"to":"[u8;32]","value":"U256","next_id":"U256","len_by_minted":"u32"})', message.payload)[2].toJSON() as unknown as { to: ActorId; value: number | string | bigint; next_id: number | string | bigint; len_by_minted: number });
      }
    });
  }

  public subscribeToBurnedEvent(callback: (data: { from: ActorId; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'ImprintNft' && getFnNamePrefix(payload) === 'Burned') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint });
      }
    });
  }

  public subscribeToDepositEvent(callback: (data: { from: ActorId; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'ImprintNft' && getFnNamePrefix(payload) === 'Deposit') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint });
      }
    });
  }

  public subscribeToWithdrawEvent(callback: (data: { from: ActorId; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'ImprintNft' && getFnNamePrefix(payload) === 'Withdraw') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint });
      }
    });
  }

  public subscribeToCombineEvent(callback: (data: { from: ActorId; value: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'ImprintNft' && getFnNamePrefix(payload) === 'Combine') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","value":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; value: number | string | bigint });
      }
    });
  }

  public subscribeToDEBUGEvent(callback: (data: { value: ImprintNftDebugInfo }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'ImprintNft' && getFnNamePrefix(payload) === 'DEBUG') {
        callback(this._program.registry.createType('(String, String, {"value":"ImprintNftDebugInfo"})', message.payload)[2].toJSON() as unknown as { value: ImprintNftDebugInfo });
      }
    });
  }

  public subscribeToTransferEvent(callback: (data: { from: ActorId; to: ActorId; token_id: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'ImprintNft' && getFnNamePrefix(payload) === 'Transfer') {
        callback(this._program.registry.createType('(String, String, {"from":"[u8;32]","to":"[u8;32]","token_id":"U256"})', message.payload)[2].toJSON() as unknown as { from: ActorId; to: ActorId; token_id: number | string | bigint });
      }
    });
  }

  public subscribeToApprovalEvent(callback: (data: { owner: ActorId; approved: ActorId; token_id: number | string | bigint }) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {;
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) {
        return;
      }

      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'ImprintNft' && getFnNamePrefix(payload) === 'Approval') {
        callback(this._program.registry.createType('(String, String, {"owner":"[u8;32]","approved":"[u8;32]","token_id":"U256"})', message.payload)[2].toJSON() as unknown as { owner: ActorId; approved: ActorId; token_id: number | string | bigint });
      }
    });
  }
}