const { ethers } = require('hardhat');
const { networkConfig } = require("../network-config")
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1] = await ethers.getSigners();

  const bondNFTFactory =  await ethers.getContractFactory("BondNFT");
  const bondNFT = await bondNFTFactory.attach("0x28161e390C5fC551DA9B2fa216B63bD88b7094B6");
  console.log("BondNFT Address: ", bondNFT.address);

  const _spotifyListeners = await bondNFT.spotifyListeners();
  const _youtubeSubscribers = await bondNFT.youtubeSubscribers();

  console.log("spotifyListeners = ",_spotifyListeners.toString());
  console.log("youtubeSubscribers = ",_youtubeSubscribers.toString());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
