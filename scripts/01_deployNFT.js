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

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
