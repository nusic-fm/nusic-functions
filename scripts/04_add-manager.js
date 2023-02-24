const { ethers } = require('hardhat');
const addresses = require("./address.json");
/*
* Main deployment script to deploy all the relevent contracts
*/

async function main() {
  const [owner, addr1, addr2, addr3] = await ethers.getSigners();
  /*
  const AssetPool =  await ethers.getContractFactory("AssetPool");
  const assetPool = await AssetPool.attach("0x72cc0e675a7a8df144c4e653f1aab220f94fa505");
  console.log("AssetPool deployed to:", assetPool.address);
*/
  const BondNFTManagerFactory =  await ethers.getContractFactory("BondNFTManager");
  const bondNFTManager = await BondNFTManagerFactory.attach("0xF1Ff48cE1027a132F5Daf942ffC040a366b906C8");
  await bondNFTManager.deployed(); 
  console.log("BondNFTManager deployed to:", bondNFTManager.address);


  const txt = await bondNFTManager.setManager("0x07C920eA4A1aa50c8bE40c910d7c4981D135272B");
  console.log("bondNFTManager.setManager txt.hash = ",txt.hash);
  const txtReceipt = await txt.wait();
  //console.log("wethMock.transfer txt.hash = ",txtReceipt);

  /*
  const txt = await assetPool.setManager("0x07C920eA4A1aa50c8bE40c910d7c4981D135272B");
  console.log("assetPool.setManager txt.hash = ",txt.hash);
  const txtReceipt = await txt.wait();
  */
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
