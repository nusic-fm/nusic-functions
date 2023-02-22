// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AssetPool is Ownable {

    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed recipient, uint256 amount);

    address public artist;
    address public nftAddress;
    uint256 public bondValue;
    uint256 public numberOfYears;
    uint256 public numberOfQuarters;
    uint256 public currentQuarter;
    uint256 public expectedNextPaymentBlock;
    uint256 public quarterlyBlocks = 648000; // 90 * 24 * 60 * 5 (days * hours in day * min in an hours * block in a min)

    address public manager;
    ERC20 public USDC;

    struct DepositCheckPoint {
        uint256 fromBlock;
        uint256 amount;
        uint256 timestamp;
        uint256 quarterNumber;
        uint256 expectedNextPaymentBlock;
    }

    DepositCheckPoint[] public quarterCheckPoints;


    modifier onlyOwnerManagerOrArtist() {
        require((owner() == msg.sender) || (manager == msg.sender)  || (artist == msg.sender), "Caller needs to Owner or Manager or Artist");
        _;
    }

    modifier onlyOwnerOrManager() {
        require((owner() == msg.sender) || (manager == msg.sender), "Caller needs to Owner or Manager");
        _;
    }

    constructor(address _usdcAddress, address _manager) {
        USDC = ERC20(_usdcAddress);
        manager = _manager;
    }

    /*
    * For first quarter payment we will calculate next payment block as block.number+quarterlyBlocks
    * From second quarter onwards will calculate next payment block as previously calcualted block + quarterlyBlocks
    * This is becuase if user delays the payment then we will calcuate based on expected block not on current block
    */
    function depositFunds(uint256 _amount) public payable onlyOwnerManagerOrArtist{

        uint256 allowance = USDC.allowance(msg.sender, address(this));
        require(allowance >= (_amount),"Insufficient approval for funds");
        USDC.transferFrom(msg.sender, address(this), _amount);

        expectedNextPaymentBlock = currentQuarter == 0? block.number+quarterlyBlocks : expectedNextPaymentBlock + quarterlyBlocks;
        currentQuarter++;
        quarterCheckPoints.push(DepositCheckPoint(block.number, _amount, block.timestamp, currentQuarter, expectedNextPaymentBlock));
        emit Deposit(msg.sender, _amount);
    }

    // called once by the manager at time of deployment
    function initialize(address _artist, uint256 _bondValue) public onlyOwnerManagerOrArtist {
        artist = _artist;
        bondValue = _bondValue;
    }
    
    function initializeBondInfo(uint256 _numberOfYears, address _nftAddress) public onlyOwnerManagerOrArtist{
        require(_nftAddress != address(0), "Invalid Address");
        nftAddress = _nftAddress;
        numberOfYears = _numberOfYears;
        numberOfQuarters = numberOfYears * 4;
    }

    function quarterCheckPointsLength () public view returns(uint256) {
        return quarterCheckPoints.length;
    }

    function setManager(address _manager) public onlyOwnerOrManager {
        manager = _manager;
    } 

    function setQuarterlyBlocks(uint256 _quarterlyBlocks) public onlyOwnerOrManager {
        quarterlyBlocks = _quarterlyBlocks;
    }

    function updateBondInfo(uint256 _bondValue, uint256 _numberOfYears, address _nftAddress) public onlyOwnerManagerOrArtist{
        nftAddress = _nftAddress;
        bondValue = _bondValue;
        numberOfYears = _numberOfYears;
        numberOfQuarters = numberOfYears * 4;
    }

    /*
    function withdraw(
        address _recipient,
        uint256 _amount,
        address _token
    ) external {
        IERC20(_token).approve(address(this), _amount);
        IERC20(_token).transferFrom(address(this), _recipient, _amount);
        emit Withdrawal(_recipient, _amount);
    }
    */
}