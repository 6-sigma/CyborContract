#![no_std]

use sails_rs::{cell::RefCell, prelude::*};

use vnft_service::Storage;


pub mod cybor_nft;
mod imprint_nft;


// static mut BATTLE_DATA: Option<RefCell<gamestate::SigmaverseGameData>> = None;

static mut CYBOR_STATE: Option<RefCell<cybor_nft::CyborState>> = None;

static mut IMPRINT_STATE: Option<RefCell<imprint_nft::ImprintState>> = None;


fn cybor_state() -> &'static RefCell<cybor_nft::CyborState> {
    unsafe {
        CYBOR_STATE
            .as_ref()
            .unwrap_or_else(|| panic!("`CYBOR_STATE` should be initialized first"))
    }
}

fn imprint_state() -> &'static RefCell<imprint_nft::ImprintState> {
    unsafe {
        IMPRINT_STATE
            .as_ref()
            .unwrap_or_else(|| panic!("`IMPRINT_STATE` should be initialized first"))
    }
}


pub struct SigmaverseProgram {
}

#[program]
impl SigmaverseProgram {
    #[allow(clippy::should_implement_trait)]
    // Program constructor (called once at the very beginning of the program lifetime)
    pub fn default() -> Self {
        unsafe {
            Storage::init(String::from("Sigmaverse"), String::from("Sigmaverse"));

            CYBOR_STATE = Some(RefCell::new(cybor_nft::CyborState::new()));

            IMPRINT_STATE = Some(RefCell::new(imprint_nft::ImprintState::new()));
        }
        Self{}
    }


    pub fn cybor_nft(&self) -> cybor_nft::CyborNFTService {
        cybor_nft::CyborNFTService::init(cybor_state())
    }

    pub fn imprint_nft(&self) -> imprint_nft::ImprintNFTService {
        imprint_nft::ImprintNFTService::init(imprint_state())
    }

}
