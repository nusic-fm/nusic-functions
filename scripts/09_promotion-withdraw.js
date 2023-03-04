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

  const NotesNFTFactory =  await ethers.getContractFactory("NotesNFT");
  const notesNFT = await NotesNFTFactory.attach("0x2e4e92e0D519468b3ec456F7fA0D550e0d33dABd");
  console.log("NotesNFT address:", notesNFT.address);

  const ownerBalance = await usdcMock.balanceOf(owner.address)
  console.log("Balance Before ", ownerBalance.toString() );
  
  const promotionOneWithdrawTx = await notesNFT.withdrawForPromotionOne();
  console.log("promotionOneWithdrawTx.hash = ",promotionOneWithdrawTx.hash);
  const promotionOneWithdrawTxReceipt = await promotionOneWithdrawTx.wait(1);

  const promotionOneBalance = await notesNFT.promotionOneBalance();
  console.log("promotionOneBalance = ",promotionOneBalance.toString());

  const ownerBalanceAfter = await usdcMock.balanceOf(owner.address)
  console.log("Balance After ", ownerBalanceAfter.toString() );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
