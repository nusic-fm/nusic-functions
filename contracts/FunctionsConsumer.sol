// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./dev/functions/FunctionsClient.sol";
// import "@chainlink/contracts/src/v0.8/dev/functions/FunctionsClient.sol"; // Once published
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

/**
 * @title Functions Copns contract
 * @notice This contract is a demonstration of using Functions.
 */
contract FunctionsConsumer is FunctionsClient, ConfirmedOwner {
  using Functions for Functions.Request;

  bytes32 public latestRequestId;
  bytes public latestResponse;
  bytes public latestError;
  mapping(bytes32=>uint256) public requestDataMapping; // requestId => datatype - 1 = youtube, 2 = spotify

  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err, string datatype);

  /**
   * @notice Executes once when a contract is created to initialize state variables
   *
   * @param oracle - The FunctionsOracle contract
   */
  constructor(address oracle) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {}

  /**
   * @notice Send a simple request
   * @param source JavaScript source code
   * @param secrets Encrypted secrets payload
   * @param args List of arguments accessible from within the source code
   * @param subscriptionId Billing ID
   */
  function executeRequest(
    string calldata source,
    bytes calldata secrets,
    string[] calldata args,
    uint64 subscriptionId,
    uint32 gasLimit,
    uint256 datatype
  ) public onlyOwner returns (bytes32) {
    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);
    if (secrets.length > 0) req.addInlineSecrets(secrets);
    if (args.length > 0) req.addArgs(args);

    bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit, tx.gasprice);
    latestRequestId = assignedReqID;
    requestDataMapping[assignedReqID] = datatype;
    return assignedReqID;
  }

  /**
   * @notice Callback that is invoked once the DON has resolved the request or hit an error
   *
   * @param requestId The request ID, returned by sendRequest()
   * @param response Aggregated response from the user code
   * @param err Aggregated error from the user code or from the execution pipeline
   * Either response or error parameter will be set, but never both
   */
  function fulfillRequest(
    bytes32 requestId,
    bytes memory response,
    bytes memory err
  ) internal override {
    // revert('test');
    latestResponse = response;
    latestError = err;
    uint256 _datatype = requestDataMapping[requestId];
    if(_datatype == 1) { // 1 = youtube
      emit OCRResponse(requestId, response, err, "youtube");
    }
    else if(_datatype == 2) { // 2 = spotify
      emit OCRResponse(requestId, response, err, "spotify");
    }
    
  }

  function updateOracleAddress(address oracle) public onlyOwner {
    setOracle(oracle);
  }
}
