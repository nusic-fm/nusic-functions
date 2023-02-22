const { ethers } = require('hardhat');
const { networkConfig } = require("../network-config")
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1] = await ethers.getSigners();

  const bondNFTFactory =  await ethers.getContractFactory("BondNFT");
  const bondNFT = await bondNFTFactory.attach("0x05cA3e08c871D6CE41AaffdEB59d71088dFD76F0");
  console.log("BondNFT Address: ", bondNFT.address);

  const _spotifyStreamCount = await bondNFT.spotifyStreamCount();
  const _youtubeViewsCount = await bondNFT.youtubeViewsCount();

  console.log("spotifyStreamCount = ",_spotifyStreamCount.toString());
  console.log("youtubeViewsCount = ",_youtubeViewsCount.toString());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
