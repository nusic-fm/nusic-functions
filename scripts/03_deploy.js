const { ethers } = require('hardhat');
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1] = await ethers.getSigners();

  console.log("data = ",network.config);
  console.log("data = ",network.name);

  const USDCMockFactory =  await ethers.getContractFactory("USDCMock");
  const usdcMock = await USDCMockFactory.deploy();
  await usdcMock.deployed(); 
  console.log("USDCMockFactory deployed to:", usdcMock.address);

  const ratingEngineFactory =  await ethers.getContractFactory("RatingEngine");
  const ratingEngine = await ratingEngineFactory.deploy();
  await ratingEngine.deployed(); 
  console.log("RatingEngine deployed to:", ratingEngine.address);

  const bondNFTGeneratorFactory =  await ethers.getContractFactory("BondNFTGenerator");
  const bondNFTGenerator = await bondNFTGeneratorFactory.deploy();
  await bondNFTGenerator.deployed(); 
  console.log("BondNFTGenerator deployed to:", bondNFTGenerator.address);

  const BondNFTManagerFactory =  await ethers.getContractFactory("BondNFTManager");
  const bondNFTManager = await BondNFTManagerFactory.deploy();
  await bondNFTManager.deployed(); 
  console.log("BondNFTManager deployed to:", bondNFTManager.address);

  const bondNFTManagerInitializeTx = await bondNFTManager.initialize(ratingEngine.address,bondNFTGenerator.address,usdcMock.address,owner.address) 
  console.log("bondNFTManagerInitializeTx.hash = ",bondNFTManagerInitializeTx.hash);
  const bondInitializeTxReceipt = await bondNFTManagerInitializeTx.wait(1)

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
