use sigmaverse::SigmaverseProgram;
use sigmaverse::cybor_nft::CyborRace;


#[tokio::test]
async fn test_program() {
    let pro = SigmaverseProgram::default();
    let mut cyborService = pro.cybor_nft();

    let r = cyborService.mint(CyborRace::Nguyen);

    println!("MintRRRRR:::::: {:?}", r);
    
    assert_eq!((1), 1);
}
