// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDCMock is ERC20, Ownable {

    constructor() ERC20("Mock USDC", "MUSDC") {
        // 10k initial supply
        _mint(msg.sender, 10_000 * 10 ** decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}