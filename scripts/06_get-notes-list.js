const { BigNumber } = require('ethers');
const { ethers, network } = require('hardhat');
const addresses = require("./address.json");
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1, addr2,addr3] = await ethers.getSigners();

  console.log("network.name = ",network.name);
  
  const NotesNFTManagerFactory =  await ethers.getContractFactory("NotesNFTManager");
  const notesNFTManager = await NotesNFTManagerFactory.attach(addresses[network.name].notesNFTManager);
  console.log("NotesNFTManager address:", notesNFTManager.address);

  const nftList = await notesNFTManager.userBondConfigs(owner.address,0);
  console.log("NFT List = ",nftList);

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
