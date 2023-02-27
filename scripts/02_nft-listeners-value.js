const { ethers } = require('hardhat');
const { networkConfig } = require("../network-config")
/*
* Main deployment script to deploy all the relevent contracts
*/
async function main() {
  const [owner, addr1] = await ethers.getSigners();

  const NotesNFTFactory =  await ethers.getContractFactory("NotesNFT");
  const notesNFT = await NotesNFTFactory.attach("0x39EeE195eC10682F794D5C671b378bD607E2CFeD");
  console.log("NotesNFT Address: ", notesNFT.address);

  const _soundchartsSongId = await notesNFT.soundchartsSongId();
  const _songstatsSongId = await notesNFT.songstatsSongId();
  const _chartmetricSongId = await notesNFT.chartmetricSongId();
  console.log(`soundchartsSongId = '${_soundchartsSongId}'`);
  console.log(`songstatsSongId = '${_songstatsSongId}'`);
  console.log(`chartmetricSongId = '${_chartmetricSongId}'`);
  

  const _spotifyStreamCount = await notesNFT.spotifyStreamCount();
  const _youtubeViewsCount = await notesNFT.youtubeViewsCount();

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
