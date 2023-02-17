const { ethers } = require('hardhat');
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1] = await ethers.getSigners();

  const bondNFTFactory =  await ethers.getContractFactory("BondNFT");
  
  // Using address for localhost
  const bondNFT = await bondNFTFactory.deploy("Coupon", "NFTT");

  await bondNFT.deployed(); 
  console.log("BondNFT deployed to:", bondNFT.address);

  const bondValue = ethers.utils.parseEther("0.012");
  const numberOfYears = 3;
  const initialFundingProvided = ethers.utils.parseEther("0.001") //bondValue.div(numberOfYears.mul(4));
  const numberOfBonds = 1;

  /*
  const bondInitializeTx = await bondNFT.initialize("MmmCherry","UCOmHUn--16B90oW2L6FRR3A","79e77b3c-de82-11e8-8402-549f35161576","uve7d2ya",
                              initialFundingProvided,numberOfYears,numberOfBonds,bondValue, 
                              55000, 540, "0x1b172041137e7c404903ea2ee28898abab93c83f") 
  */
  const bondInitializeTx = await bondNFT.initialize("Howie B","UCOmHUn--16B90oW2L6FRR3A","11e81bbf-f008-b6a4-b1c1-a0369fe50396","1q0hd7mr",
                      initialFundingProvided,numberOfYears,numberOfBonds,bondValue, 
                      55000, 540, "0x1b172041137e7c404903ea2ee28898abab93c83f") 
  const bondInitializeTxReceipt = await bondInitializeTx.wait(1)
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
