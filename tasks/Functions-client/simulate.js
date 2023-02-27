const { simulateRequest, buildRequest, getDecodedResultLog } = require("../../FunctionsSandboxLibrary")
const { networkConfig } = require("../../network-config")

task("functions-simulate", "Simulates an end-to-end fulfillment locally for the FunctionsConsumer contract")
  .addParam("datatype", "Data Type for functions, '1 for youtube' or '2 for spotify'")
  .addOptionalParam(
    "gaslimit",
    "Maximum amount of gas that can be used to call fulfillRequest in the client contract (defaults to 100,000)"
  )
  .setAction(async (taskArgs, hre) => {
    // Simulation can only be conducted on a local fork of the blockchain
    if (network.name !== "hardhat") {
      throw Error('Simulated requests can only be conducted using --network "hardhat"')
    }

    // Check to see if the maximum gas limit has been exceeded
    const gasLimit = parseInt(taskArgs.gaslimit ?? "100000")
    if (gasLimit > 300000) {
      throw Error("Gas limit must be less than or equal to 300,000")
    }

    const datatype = parseInt(taskArgs.datatype);

    // Recompile the latest version of the contracts
    console.log("\n__Compiling Contracts__")
    await run("compile")

    // Deploy a mock oracle & registry contract to simulate a fulfillment
    const { oracle, registry, linkToken } = await deployMockOracle()
    // Deploy the client contract
    const clientFactory = await ethers.getContractFactory("FunctionsConsumer")
    const client = await clientFactory.deploy(oracle.address)
    await client.deployTransaction.wait(1)

    const NotesNFTFactory =  await ethers.getContractFactory("NotesNFT");
    const notesNFT = await NotesNFTFactory.deploy("NotesNFT", "NNFT")
    await notesNFT.deployTransaction.wait(1)
    /*
    const bondValue = ethers.utils.parseEther("0.012");
    const numberOfYears = 3;
    const initialFundingProvided = ethers.utils.parseEther("0.001") //bondValue.div(numberOfYears.mul(4));
    const numberOfBonds = 1;
    const bondInitializeTx = await bondNFT.initialize("MmmCherry","UCOmHUn--16B90oW2L6FRR3A","79e77b3c-de82-11e8-8402-549f35161576","uve7d2ya",
                              initialFundingProvided,numberOfYears,numberOfBonds,bondValue, 
                              55000, 540, "0x1b172041137e7c404903ea2ee28898abab93c83f") 
    const bondInitializeTxReceipt = await bondInitializeTx.wait(1)
    */

    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    // Add the wallet initiating the request to the oracle whitelist
    const whitelistTx = await oracle.addAuthorizedSenders([deployer.address])
    await whitelistTx.wait(1)

    // Create & fund a subscription
    const createSubscriptionTx = await registry.createSubscription()
    const createSubscriptionReceipt = await createSubscriptionTx.wait(1)
    const subscriptionId = createSubscriptionReceipt.events[0].args["subscriptionId"].toNumber()
    const juelsAmount = ethers.utils.parseUnits("10")
    await linkToken.transferAndCall(
      registry.address,
      juelsAmount,
      ethers.utils.defaultAbiCoder.encode(["uint64"], [subscriptionId])
    )
    // Authorize the client contract to use the subscription
    await registry.addConsumer(subscriptionId, client.address)

    // Build the parameters to make a request from the client contract
    let requestConfig = require("../../Functions-request-config.js")
    if(datatype == 2) {
      requestConfig = require("../../Functions-request-config-spotify.js")
    }
    // Fetch the DON public key from on-chain
    const DONPublicKey = await oracle.getDONPublicKey()
    // Remove the preceeding 0x from the DON public key
    requestConfig.DONPublicKey = DONPublicKey.slice(2)
    const request = await buildRequest(requestConfig)

    // Make a request & simulate a fulfillment
    await new Promise(async (resolve) => {
      // Initiate the request from the client contract
      const clientContract = await clientFactory.attach(client.address)
      const requestTx = await clientContract.executeRequest(
        request.source,
        request.secrets ?? [],
        request.args ?? [],
        subscriptionId,
        gasLimit, 
        datatype,
        notesNFT.address
      )
      const requestTxReceipt = await requestTx.wait(1)
      const requestId = requestTxReceipt.events[2].args.id

      // Simulating the JavaScript code locally
      console.log("\nExecuting JavaScript request source code locally...")
      let _requestConfig = require("../../Functions-request-config")
      if(datatype == 2) {
        _requestConfig = require("../../Functions-request-config-spotify.js")
      }
      const { success, result, resultLog } = await simulateRequest(_requestConfig)
      console.log(`\n${resultLog}`)

      // Simulate a request fulfillment
      const accounts = await ethers.getSigners()
      const dummyTransmitter = accounts[0].address
      const dummySigners = Array(31).fill(dummyTransmitter)
      let i = 0
      try {
        const fulfillTx = await registry.fulfillAndBill(
          requestId,
          success ? result : "0x",
          success ? "0x" : result,
          dummyTransmitter,
          dummySigners,
          4,
          100_000,
          500_000,
          {
            gasLimit: 500_000,
          }
        )
        const fulfillTxData = await fulfillTx.wait(1)
      } catch (fulfillError) {
        // Catch & report any unexpected fulfillment errors
        console.log("\nUnexpected error encountered when calling fulfillRequest in client contract.")
        console.log(fulfillError)
        resolve()
      }

      // Listen for the OCRResponse event & log the simulated response returned to the client contract
      client.on("OCRResponse", async (eventRequestId, result, err) => {
        console.log("__Simulated On-Chain Response__")
        if (eventRequestId !== requestId) {
          throw new Error(`${eventRequestId} is not equal to ${requestId}`)
        }
        // Check for & log a successful request
        if (result !== "0x") {
          console.log(
            `Response returned to client contract represented as a hex string: ${result}\n${getDecodedResultLog(
              requestConfig,
              result
            )}`
          )
        }
        // Check for & log a request that returned an error message
        if (err !== "0x") {
          console.log(`Error message returned to client contract: "${Buffer.from(err.slice(2), "hex")}"\n`)
        }
      })

      // Listen for the BillingEnd event & log the estimated billing data
      registry.on(
        "BillingEnd",
        async (
          eventRequestId,
          eventSubscriptionId,
          eventSignerPayment,
          eventTransmitterPayment,
          eventTotalCost,
          eventSuccess
        ) => {
          if (requestId == eventRequestId) {
            // Check for a successful request & log a mesage if the fulfillment was not successful
            if (!eventSuccess) {
              console.log(
                "\nError encountered when calling fulfillRequest in client contract.\n" +
                  "Ensure the fulfillRequest function in the client contract is correct and the --gaslimit is sufficent.\n"
              )
            }
            console.log(
              `Estimated transmission cost: ${hre.ethers.utils.formatUnits(
                eventTransmitterPayment,
                18
              )} LINK (This will vary based on gas price)`
            )
            console.log(`Base fee: ${hre.ethers.utils.formatUnits(eventSignerPayment, 18)} LINK`)
            console.log(`Total estimated cost: ${hre.ethers.utils.formatUnits(eventTotalCost, 18)} LINK`)
            return resolve()
          }
        }
      )
    })
  })

const deployMockOracle = async () => {
  // Deploy a mock LINK token contract
  const linkTokenFactory = await ethers.getContractFactory("LinkToken")
  const linkToken = await linkTokenFactory.deploy()
  const linkEthFeedAddress = networkConfig["hardhat"]["linkEthPriceFeed"]
  // Deploy the mock oracle factory contract
  const oracleFactoryFactory = await ethers.getContractFactory("FunctionsOracleFactory")
  const oracleFactory = await oracleFactoryFactory.deploy()
  await oracleFactory.deployTransaction.wait(1)
  // Deploy the mock oracle contract
  const accounts = await ethers.getSigners()
  const deployer = accounts[0]
  const OracleDeploymentTransaction = await oracleFactory.deployNewOracle()
  const OracleDeploymentReceipt = await OracleDeploymentTransaction.wait(1)
  const FunctionsOracleAddress = OracleDeploymentReceipt.events[1].args.don
  const oracle = await ethers.getContractAt("FunctionsOracle", FunctionsOracleAddress, deployer)
  // Accept ownership of the mock oracle contract
  const acceptTx = await oracle.acceptOwnership()
  await acceptTx.wait(1)
  // Set the secrets encryption public DON key in the mock oracle contract
  await oracle.setDONPublicKey("0x" + networkConfig["hardhat"]["functionsPublicKey"])
  // Deploy the mock registry billing contract
  const registryFactory = await ethers.getContractFactory("FunctionsBillingRegistry")
  const registry = await registryFactory.deploy(linkToken.address, linkEthFeedAddress, FunctionsOracleAddress)
  await registry.deployTransaction.wait(1)
  // Set registry configuration
  const config = {
    maxGasLimit: 400_000,
    stalenessSeconds: 86_400,
    gasAfterPaymentCalculation: 21_000 + 5_000 + 2_100 + 20_000 + 2 * 2_100 - 15_000 + 7_315,
    weiPerUnitLink: ethers.BigNumber.from("5000000000000000"),
    gasOverhead: 100_000,
    requestTimeoutSeconds: 300,
  }
  await registry.setConfig(
    config.maxGasLimit,
    config.stalenessSeconds,
    config.gasAfterPaymentCalculation,
    config.weiPerUnitLink,
    config.gasOverhead,
    config.requestTimeoutSeconds
  )
  // Set the current account as an authorized sender in the mock registry to allow for simulated local fulfillments
  await registry.setAuthorizedSenders([oracle.address, deployer.address])
  await oracle.setRegistry(registry.address)

  return { oracle, registry, linkToken }
}