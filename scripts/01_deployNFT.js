const { ethers } = require('hardhat');
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1] = await ethers.getSigners();

  const NotesNFTFactory =  await ethers.getContractFactory("NotesNFT");
  
  // Using address for localhost
  const notesNFT = await NotesNFTFactory.deploy("Coupon", "NFTT");

  await notesNFT.deployed(); 
  console.log("NotesNFT deployed to:", notesNFT.address);

  const price = ethers.utils.parseEther("0.001");
  const numberOfTokens = 2;
 
  const notesInitializeTx = await notesNFT.initialize("MmmCherry",owner.address,"7vEPncg8zno","a59154fd-61aa-4076-9569-335dcc5e2b79","sznmhxr8","31456083",
    price,numberOfTokens, 55000, 540, owner.address); 
  const notesInitializeTxReceipt = await notesInitializeTx.wait(1)
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
