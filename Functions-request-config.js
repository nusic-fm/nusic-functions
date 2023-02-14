const fs = require("fs")

// Loads environment variables from .env file (if it exists)
require("dotenv").config()

const Location = {
  Inline: 0,
}

const CodeLanguage = {
  JavaScript: 0,
}

const ReturnType = {
  uint: "uint256",
  uint256: "uint256",
  int: "int256",
  int256: "int256",
  string: "string",
  bytes: "Buffer",
  Buffer: "Buffer",
}

// Configure the request by setting the fields below
const requestConfig = {
  // location of source code (only Inline is currently supported)
  codeLocation: Location.Inline,
  // location of secrets (only Inline is currently supported)
  secretsLocation: Location.Inline,
  // code language (only JavaScript is currently supported)
  codeLanguage: CodeLanguage.JavaScript,
  // string containing the source code to be executed
  source: fs.readFileSync("./Functions-request-youtube-api.js").toString(),
  //source: fs.readFileSync('./Functions-request-source-API-example.js').toString(),
  // secrets can be accessed within the source code with `secrets.varName` (ie: secrets.apiKey)
  secrets: { apiKey: process.env.COINMARKETCAP_API_KEY },
  // ETH wallet key used to sign secrets so they cannot be accessed by a 3rd party
  walletPrivateKey: process.env["PRIVATE_KEY"],
  // args (string only array) can be accessed within the source code with `args[index]` (ie: args[0]). 
  args: ["AIzaSyBK86jGrCR8lh5IVyKSohMN1Q2_tvUy2uA", "statistics", "UCOmHUn--16B90oW2L6FRR3A"],
  // expected type of the returned value
  expectedReturnType: ReturnType.uint256,
}

module.exports = requestConfig
