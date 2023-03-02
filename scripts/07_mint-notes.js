const { BigNumber } = require('ethers');
const { ethers, network } = require('hardhat');
const addresses = require("./address.json");
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1, addr2,addr3] = await ethers.getSigners();

  console.log("network.name = ",network.name);

  const USDCMockFactory =  await ethers.getContractFactory("USDCMock");
  const usdcMock = await USDCMockFactory.attach(addresses[network.name].usdcMock);
  console.log("USDCMockFactory Address:", usdcMock.address);

  const NotesNFTManagerFactory =  await ethers.getContractFactory("NotesNFTManager");
  const notesNFTManager = await NotesNFTManagerFactory.attach(addresses[network.name].notesNFTManager);
  console.log("NotesNFTManager address:", notesNFTManager.address);

  const price = BigNumber.from("1").mul(1000000);
  const numberOfTokens = 1;

  const usdcApprovalTx = await usdcMock.approve("0x2e4e92e0D519468b3ec456F7fA0D550e0d33dABd",price);
  console.log("usdcApprovalTx.approve  txt.hash = ",usdcApprovalTx.hash);
  const usdcApprovalTxReceipt = await usdcApprovalTx.wait();

  const mintNotesTx = await notesNFTManager.mintNFTNotes("0x2e4e92e0D519468b3ec456F7fA0D550e0d33dABd", price);
  console.log("mintNotesTx.hash = ",mintNotesTx.hash);
  const mintNotesTxReceipt = await mintNotesTx.wait(1)

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
