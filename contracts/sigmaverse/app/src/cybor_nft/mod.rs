use cybor_template::CyborTemplate;

use gstd::{
    collections::{HashMap, HashSet},
    exec, msg,
};
use sails_rs::{cell::RefCell, prelude::*};
use stream::CyborStream;
// use sigmaverse_gamestate::SigmaverseGameData;
use vnft_service::{
    utils::{panic, TokenId},
    Service as BaseVnftService, Storage,
};


mod cybor_template;
mod stream;

const ZERO_ID: ActorId = ActorId::zero();

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
#[derive(Clone, Default)]
pub enum CyborRace {
    #[default]
    Rodriguez,
    Nguyen,
}

#[derive(Encode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
#[derive(Default, Clone)]
pub struct CyborMetadata {
    pub race: CyborRace,
    pub cybor_template: CyborTemplate,
    pub is_have_finishing_skill: bool,
    pub mint_at: u32,
    pub image: String,
}

#[derive(Default)]
struct CyborDynamic {
    level: u16,
    grade: u16,
    lucky: u32,
    exp: u128,
    start_at: u32,
}

#[derive(Default)]
pub struct CyborState {
    metadata_by_id: HashMap<TokenId, CyborMetadata>,
    dynamic_by_id: HashMap<TokenId, CyborDynamic>,
    freeze_by_id: HashMap<TokenId, bool>,
    current_cybor_id: TokenId,
}

impl CyborState {
    pub fn new() -> Self {
        Self {
            current_cybor_id: TokenId::from(100),
            ..Default::default()
        }
    }
}

#[derive(Encode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub enum CyborEvents {
    Minted {
        to: ActorId,
        value: TokenId,
        next_id: TokenId,
        len_by_minted: u32,
        len_by_group_user: u32,
    },
    Burned {
        from: ActorId,
        value: TokenId,
        msg_id: MessageId,
    },
    Freeze {
        from: ActorId,
        value: TokenId,
    },
    UnFreeze {
        from: ActorId,
        value: TokenId,
    },
    Uplevel {
        from: ActorId,
        value: TokenId,
    },
    DEBUG {
        value: DebugInfo,
    },
}

pub struct CyborNFTService {
    vnft: BaseVnftService,
    state: &'static RefCell<CyborState>,
}

#[derive(Encode, TypeInfo, Default, Clone)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub struct DebugInfo {
    pub source: ActorId,
    pub value: u128,
    pub temp: CyborTemplate,
    pub minted_count: u128,
    pub owner_by_id: Vec<(TokenId, ActorId)>,
    pub token_group_by_owner_len: u128,
    pub my_tokens1: Vec<TokenId>,
    pub my_tokens2: Vec<TokenId>,
    pub next_token_id: TokenId,
}

#[service(extends = BaseVnftService, events = CyborEvents)]
impl CyborNFTService {
    pub fn init(state: &'static RefCell<CyborState>) -> Self {
        Self {
            vnft: <BaseVnftService>::init(),
            state: state,
        }
    }

    pub fn max_supply(&self) -> u32 {
        100000
    }

    pub fn debug_info(&self, race: CyborRace) -> DebugInfo {
        // let mut v_owner_by_id:Vec<(TokenId, ActorId)> = Vec::new();

        let owner_by_id = Storage::owner_by_id();
        let v_owner_by_id: Vec<(TokenId, ActorId)> = owner_by_id
            .iter()
            .map(|(hash, actor_id)| (*hash, *actor_id))
            .collect();
        // for (tid, u) in owner_by_id.iter() {
        //     v_owner_by_id.insert(0, (tid.clone(), u.clone()));
        // }

        let mut d = DebugInfo {
            source: msg::source(),
            value: msg::value(),
            owner_by_id: v_owner_by_id,
            minted_count: owner_by_id.len() as u128,
            ..Default::default()
        };

        let cybor_temp: Option<&CyborTemplate> = match race {
            CyborRace::Rodriguez => Some(&cybor_template::RODRIGUEZ),
            CyborRace::Nguyen => Some(&cybor_template::NGUYEN),
        };

        if let Some(template) = cybor_temp {
            d.temp = template.clone();
        } else {
            d.temp = CyborTemplate {
                race_name: "NotFound",
                ..Default::default()
            }
        }

        let mut tokens1: Vec<TokenId> = Vec::new();
        let tokens_for_owner = Storage::tokens_for_owner();
        d.token_group_by_owner_len = tokens_for_owner.len() as u128;

        if let Some(ref tokens) = tokens_for_owner.get(&d.source) {
            for token_id in tokens.iter() {
                tokens1.insert(0, token_id.clone())
            }
        }
        d.my_tokens1 = tokens1;

        let mut tokens2: Vec<TokenId> = Vec::new();
        if let Some(tokens) = tokens_for_owner.get(&d.source) {
            for token_id in tokens.iter() {
                tokens2.insert(0, token_id.clone())
            }
        }
        d.my_tokens2 = tokens2;

        let cybor_state = self.state.borrow();
        d.next_token_id = cybor_state.current_cybor_id;

        // let _ = self.notify_on(CyborEvents::DEBUG { value: d.clone() });

        d
    }

    pub fn get_template(&self, race: CyborRace) -> CyborTemplate {
        let cybor_temp: Option<&CyborTemplate> = match race {
            CyborRace::Rodriguez => Some(&cybor_template::RODRIGUEZ),
            CyborRace::Nguyen => Some(&cybor_template::NGUYEN),
        };

        if let Some(template) = cybor_temp {
            template.clone()
        } else {
            CyborTemplate {
                race_name: "NotFound",
                ..Default::default()
            }
        }
    }

    pub fn mint(&mut self, race: CyborRace) {
        let to = msg::source();
        if to == ZERO_ID {
            panic("CyborNFT: zero address");
        }

        let mut cybor_state = self.state.borrow_mut();
        if self.max_supply() <= cybor_state.metadata_by_id.len() as u32 {
            panic("CyborNFT: all the Cybor have been released to the market");
        }

        let cybor_temp: Option<&CyborTemplate> = match race {
            CyborRace::Rodriguez => Some(&cybor_template::RODRIGUEZ),
            CyborRace::Nguyen => Some(&cybor_template::NGUYEN),
        };

        if let Some(template) = cybor_temp {
            let v = msg::value();

            if v < template.price {
                panic(
                    format!(
                        "CyborNFT: incorrect value, input price{:?}, temp price:{:?}",
                        v, template.price
                    )
                    .as_str(),
                );
            }

            let tid = cybor_state.current_cybor_id.clone();

            // metadata_by_id
            let block_num = exec::block_height();
            cybor_state.metadata_by_id.insert(
                tid,
                CyborMetadata {
                    race: race,
                    cybor_template: template.clone(),
                    is_have_finishing_skill: block_num % 100 == 0, // lucky minter per 100 block
                    mint_at: block_num,
                    image: String::new(),
                },
            );

            // dynamic_by_id
            cybor_state.dynamic_by_id.insert(
                tid,
                CyborDynamic {
                    level: 1,
                    grade: 1,
                    lucky: 1,
                    exp: 0,
                    start_at: block_num,
                },
            );

            // freeze_by_id
            cybor_state.freeze_by_id.insert(tid, true);

            let tokens_for_owner = Storage::tokens_for_owner();
            tokens_for_owner
                .entry(to)
                .and_modify(|tokens| {
                    tokens.insert(tid);
                })
                .or_insert_with(|| HashSet::from([tid]));

            let owner_by_id = Storage::owner_by_id();
            owner_by_id.insert(tid, to);

            cybor_state.current_cybor_id += U256::from(1);
            let evt = CyborEvents::Minted {
                to: to,
                value: tid,
                next_id: cybor_state.current_cybor_id,
                len_by_minted: owner_by_id.len() as u32,
                len_by_group_user: tokens_for_owner.len() as u32,
            };

            let _ = self.notify_on(evt);
        } else {
            panic("CyborNFT: unknown cybor race or no template available");
        }
    }

    pub fn burn(&mut self, token_id: TokenId) {
        let from = msg::source();
        let owner_by_id = Storage::owner_by_id();
        let owner = if let Some(&token_owner) = owner_by_id.get(&token_id) {
            if token_owner != from {
                panic("CyborNFT: token not owned by sender");
            }
            token_owner
        } else {
            panic("CyborNFT: token has not been minted");
        };

        let cybor_state = self.state.borrow();
        let metadata = cybor_state.metadata_by_id.get(&token_id).unwrap();
        let template = &metadata.cybor_template;

        let dynamic = cybor_state.dynamic_by_id.get(&token_id).unwrap();
        let mut refund_msg_id: MessageId = MessageId::default();
        if dynamic.grade > 2 {
            let balance = exec::value_available();
            if template.price > balance {
                panic("CyborNFT: burn failed due to not enough value for callback");
            }

            // 60 * 60 * 24 / 3 sec per block * 100 gas per block = 2_880_000;
            let gas_limit: u128 = 60 * 60 * 24 / 3 * 100;
            let msg_id: Result<MessageId, gstd::errors::CoreError> = msg::send_bytes_with_gas(
                owner,
                b"CONGRATS! Please claim the refund in 24 hours!",
                gas_limit.try_into().unwrap(), // 将 gas_limit 转换为 u64
                template.price - gas_limit,
            );

            if msg_id.is_err() {
                panic("CyborNFT: msg send failed");
            }

            refund_msg_id = msg_id.unwrap();
        }

        let mut cybor_state = self.state.borrow_mut();

        cybor_state.metadata_by_id.remove(&token_id);
        cybor_state.dynamic_by_id.remove(&token_id);
        cybor_state.freeze_by_id.remove(&token_id);

        let tokens_for_owner = Storage::tokens_for_owner();
        if let Some(tokens) = tokens_for_owner.get_mut(&from) {
            tokens.remove(&token_id);
        }
        let owner_by_id = Storage::owner_by_id();
        owner_by_id.remove(&token_id);

        let token_approvals = Storage::token_approvals();
        token_approvals.remove(&token_id);

        let _ = self.notify_on(CyborEvents::Burned {
            from,
            value: token_id,
            msg_id: refund_msg_id,
        });
    }

    pub fn freeze(&mut self, token_id: TokenId) {
        let owner_by_id = Storage::owner_by_id();
        if let Some(&owner) = owner_by_id.get(&token_id) {
            if msg::source() == owner {
                let mut cybor_state = self.state.borrow_mut();
                let dynamic = cybor_state.dynamic_by_id.get_mut(&token_id).unwrap();
                if dynamic.start_at == 0 {
                    dynamic.start_at = exec::block_height();

                    let mut cybor_state = self.state.borrow_mut();
                    cybor_state.freeze_by_id.insert(token_id, true);

                    let _ = self.notify_on(CyborEvents::Freeze {
                        from: msg::source(),
                        value: token_id,
                    });
                }
            }
        }
    }

    pub fn unfreeze(&mut self, token_id: TokenId) {
        let owner_by_id = Storage::owner_by_id();
        if let Some(&owner) = owner_by_id.get(&token_id) {
            if msg::source() == owner {
                let mut cybor_state = self.state.borrow_mut();
                cybor_state.freeze_by_id.remove(&token_id);

                let dynamic = cybor_state.dynamic_by_id.get_mut(&token_id).unwrap();
                dynamic.start_at = 0;
                dynamic.exp += (exec::block_height() - dynamic.start_at) as u128;

                let _ = self.notify_on(CyborEvents::UnFreeze {
                    from: msg::source(),
                    value: token_id,
                });
            }
        }
    }

    pub fn cybor_metadata(&self, token_id: TokenId) -> CyborMetadata {
        let state = self.state.borrow();
        state
            .metadata_by_id
            .get(&token_id)
            .cloned()
            .unwrap_or_default()
    }

    pub fn all_cybors(&self) -> Vec<(TokenId, CyborMetadata)> {
        let mut new_map: Vec<(TokenId, CyborMetadata)> = Vec::new();

        let state = self.state.borrow();
        for (token_id, metadata) in state.metadata_by_id.iter() {
            new_map.insert(0, (token_id.clone(), metadata.clone()));
        }
        new_map
    }

    pub fn all_my_cybors(&self) -> Vec<(TokenId, CyborStream)> {
        let source = msg::source();
        let mut new_map: Vec<(TokenId, CyborStream)> = Vec::new();

        let sys_cybor = CyborStream {
            race_name: "rodriguez",
            basic_damage: 6,
            basic_hp: 600,
            basic_move_speed: 5,
            basic_knockdown_hit: 1,
            score_per_block: 0,
            is_have_finishing_skill: false,
            mint_at: 0,
            image: "".to_string(),
            level: 1,
            grade: 1,
            lucky: 0,
            exp: 0,
            is_freeze: true,
        };
        new_map.insert(0, (TokenId::from(1), sys_cybor));

        let state = self.state.borrow();
        let tokens_for_owner = Storage::tokens_for_owner();

        if let Some(ref tokens) = tokens_for_owner.get(&source) {
            for token_id in tokens.iter() {
                let mut resp = CyborStream::default();

                if let Some(cybor_metainfo) = state.metadata_by_id.get(token_id) {
                    resp.race_name = cybor_metainfo.cybor_template.race_name;
                    resp.basic_damage = cybor_metainfo.cybor_template.basic_damage;
                    resp.basic_hp = cybor_metainfo.cybor_template.basic_hp;
                    resp.basic_move_speed = cybor_metainfo.cybor_template.basic_move_speed;
                    resp.basic_knockdown_hit = cybor_metainfo.cybor_template.basic_knockdown_hit;
                    resp.score_per_block = cybor_metainfo.cybor_template.score_per_block;

                    resp.is_have_finishing_skill = cybor_metainfo.is_have_finishing_skill;
                    resp.mint_at = cybor_metainfo.mint_at;
                    resp.image = cybor_metainfo.image.clone();
                } else {
                }

                if let Some(cybor_dynamic) = state.dynamic_by_id.get(token_id) {
                    resp.level = cybor_dynamic.level;
                    resp.grade = cybor_dynamic.grade;
                    resp.lucky = cybor_dynamic.lucky;
                    resp.exp = cybor_dynamic.exp + (exec::block_height() as u128) - (cybor_dynamic.start_at as u128);
                } else {
                }

                if let Some(_is_freeze) = state.freeze_by_id.get(token_id) {
                    resp.is_freeze = true;
                } else {
                    resp.is_freeze = false;
                }

                new_map.insert(0, (token_id.clone(), resp));
            }
        }
        new_map
    }

    pub fn cybor_info(&self, token_id: TokenId) -> CyborStream {
        let mut resp = CyborStream::default();

        let state = self.state.borrow();
        if let Some(cybor_metainfo) = state.metadata_by_id.get(&token_id) {
            resp.race_name = cybor_metainfo.cybor_template.race_name;
            resp.basic_damage = cybor_metainfo.cybor_template.basic_damage;
            resp.basic_hp = cybor_metainfo.cybor_template.basic_hp;
            resp.basic_move_speed = cybor_metainfo.cybor_template.basic_move_speed;
            resp.basic_knockdown_hit = cybor_metainfo.cybor_template.basic_knockdown_hit;
            resp.score_per_block = cybor_metainfo.cybor_template.score_per_block;

            resp.is_have_finishing_skill = cybor_metainfo.is_have_finishing_skill;
            resp.mint_at = cybor_metainfo.mint_at;
            resp.image = cybor_metainfo.image.clone();
        } else {
        }

        if let Some(cybor_dynamic) = state.dynamic_by_id.get(&token_id) {
            resp.level = cybor_dynamic.level;
            resp.grade = cybor_dynamic.grade;
            resp.lucky = cybor_dynamic.lucky;
            resp.exp = cybor_dynamic.exp + (exec::block_height() as u128) - (cybor_dynamic.start_at as u128);
        } else {
        }

        if let Some(_is_freeze) = state.freeze_by_id.get(&token_id) {
            resp.is_freeze = true;
        } else {
            resp.is_freeze = false;
        }

        resp
    }

    pub fn up_level(&mut self, token_id: TokenId) {
        let owner_by_id = Storage::owner_by_id();
        if let Some(&owner) = owner_by_id.get(&token_id) {
            if msg::source() == owner {
                if msg::value() < 101e+12 as u128 {
                    panic("CyborNFT: not enough value for uplevel");
                }
                let mut cybor_state = self.state.borrow_mut();
                let dynamic = cybor_state.dynamic_by_id.get_mut(&token_id).unwrap();
                
                if dynamic.exp < 864000 {
                    panic("CyborNFT: not enough exp");
                } else {
                    dynamic.exp -= 864000;
                    dynamic.level += 1;
                }

                dynamic.grade = dynamic.level / 10;

                let evt = CyborEvents::Uplevel {
                    from: msg::source(),
                    value: token_id,
                };
                let _ = self.notify_on(evt);
            }
        }
    }

    // pub fn indexer_exp(&mut self, token_id: TokenId, exp: u128) {
    //     if msg::source() == INDEXER_WALLET_ADDRESS {
    //         let dynamic = cybor_state.dynamic_by_id.get_mut(&token_id).unwrap();
    //         dynamic.exp += exp;
    //     }
    // }
}

impl AsRef<BaseVnftService> for CyborNFTService {
    fn as_ref(&self) -> &BaseVnftService {
        &self.vnft
    }
}
