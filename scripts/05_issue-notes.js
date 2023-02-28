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

  const price = BigNumber.from("1").mul(1000000);
  const numberOfTokens = 1;

  const issueNotesTx = await notesNFTManager.connect(owner).issueNotes("MmmCherry", owner.address,"7vEPncg8zno","a59154fd-61aa-4076-9569-335dcc5e2b79","sznmhxr8","31456083",
      price,numberOfTokens,"DNotes","DNFT", {
        spotifyStreamCount: BigNumber.from("55000"),
        youtubeViewsCount: BigNumber.from("540"),
      },
      {
        influencerOne: owner.address,
        influencerTwo: owner.address,
        influencerOneShare: BigNumber.from("2000"),
        influencerTwoShare: BigNumber.from("3000")
      })
  //.initialize("MmmCherry",owner.address,"7vEPncg8zno","a59154fd-61aa-4076-9569-335dcc5e2b79","sznmhxr8","31456083", price,numberOfTokens, 55000, 540, owner.address); 
  //.initialize(ratingEngine.address, notesNFTGenerator.address, addresses[network.name].usdcMock, owner.address) 
  console.log("issueNotesTx.hash = ",issueNotesTx.hash);
  const nissueNotesTxReceipt = await issueNotesTx.wait(1)

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
