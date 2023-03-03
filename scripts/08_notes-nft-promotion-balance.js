const { BigNumber } = require('ethers');
const { ethers, network } = require('hardhat');
const addresses = require("./address.json");
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1, addr2,addr3] = await ethers.getSigners();

  console.log("network.name = ",network.name);

  const NotesNFTFactory =  await ethers.getContractFactory("NotesNFT");
  const notesNFT = await NotesNFTFactory.attach("0x2B926d1EEb35FA53c9a042B78D19dF328c3881D0");
  console.log("NotesNFT address:", notesNFT.address);

  const promotionOneBalance = await notesNFT.promotionOneBalance();
  const promotionTwoBalance = await notesNFT.promotionTwoBalance();

  console.log("promotionOneBalance = ",promotionOneBalance.toString());
  console.log("promotionTwoBalance = ",promotionTwoBalance.toString());
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
