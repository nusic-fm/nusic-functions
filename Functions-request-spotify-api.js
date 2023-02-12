console.log("Spotify API")
const uuid = args[0]

// To make an HTTP request, use the Functions.makeHttpRequest function
// Functions.makeHttpRequest function parameters:
// - url
// - method (optional, defaults to 'GET')
// - headers: headers supplied as an object (optional)
// - params: URL query parameters supplied as an object (optional)
// - data: request body supplied as an object (optional)
// - timeout: maximum request duration in ms (optional, defaults to 10000ms)
// - responseType: expected response type (optional, defaults to 'json')+

const spotifyListenersRequest = Functions.makeHttpRequest({
  url: `https://customer.api.soundcharts.com/api/v2/artist/${uuid}/streaming/spotify/listeners`,
  // Get a free API key from https://coinmarketcap.com/api/
  headers: { "x-app-id": secrets.soundchartsAppId, "x-api-key":secrets.soundchartsApiKey  },
})

// First, execute all the API requests are executed concurrently, then wait for the responses
const [spotifyListenersResponse] = await Promise.all([
  spotifyListenersRequest
])
console.log("spotifyListenersResponse = ",spotifyListenersResponse);
console.log("spotifyListenersResponse.data = ",spotifyListenersResponse.data.items[0]);
console.log("spotifyListenersResponse.data = ",spotifyListenersResponse.data.items[0].value);

const stats = [];

if (!spotifyListenersResponse.error) {
  stats.push(spotifyListenersResponse.data.items[0].value)
} else {
  console.log("Spotify Listeners Count Error")
}

/*
// At least 3 out of 4 prices are needed to aggregate the median price
if (prices.length < 3) {
  // If an error is thrown, it will be returned back to the smart contract
  throw Error("More than 1 API failed")
}

const medianPrice = prices.sort((a, b) => a - b)[Math.round(prices.length / 2)]
console.log(`Median Bitcoin price: $${medianPrice.toFixed(2)}`)
*/
// The source code MUST return a Buffer or the request will return an error message
// Use one of the following functions to convert to a Buffer representing the response bytes that are returned to the client smart contract:
// - Functions.encodeUint256
// - Functions.encodeInt256
// - Functions.encodeString
// Or return a custom Buffer for a custom byte encoding
return Functions.encodeUint256(parseInt(stats[0]))
