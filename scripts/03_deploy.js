const { ethers, network } = require('hardhat');
const addresses = require("./address.json");
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1] = await ethers.getSigners();

  console.log("data = ",network.config);
  console.log("data = ",network.name);
  console.log("test data = ", addresses[network.name].usdcMock);

  /*
  const USDCMockFactory =  await ethers.getContractFactory("USDCMock");
  const usdcMock = await USDCMockFactory.deploy();
  await usdcMock.deployed(); 
  console.log("USDCMockFactory deployed to:", usdcMock.address);
  */
 
  const ratingEngineFactory =  await ethers.getContractFactory("RatingEngine");
  const ratingEngine = await ratingEngineFactory.deploy();
  await ratingEngine.deployed(); 
  console.log("RatingEngine deployed to:", ratingEngine.address);
  
  
  const NotesNFTGeneratorFactory =  await ethers.getContractFactory("NotesNFTGenerator");
  const notesNFTGenerator = await NotesNFTGeneratorFactory.deploy();
  await notesNFTGenerator.deployed(); 
  console.log("NotesNFTGenerator deployed to:", notesNFTGenerator.address);


  const NotesNFTManagerFactory =  await ethers.getContractFactory("NotesNFTManager");
  const notesNFTManager = await NotesNFTManagerFactory.deploy();
  await notesNFTManager.deployed(); 
  console.log("NotesNFTManager deployed to:", notesNFTManager.address);

  const notesNFTManagerInitializeTx = await notesNFTManager.initialize(ratingEngine.address, notesNFTGenerator.address, addresses[network.name].usdcMock, owner.address) 
  console.log("NotesNFTManagerInitializeTx.hash = ",notesNFTManagerInitializeTx.hash);
  const notesInitializeTxReceipt = await notesNFTManagerInitializeTx.wait(1)

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
