console.log("Spotify API")
const uuid = args[0]
const songStatsArtistId = args[1]


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

const spotifyListenersSongStatsRequest = Functions.makeHttpRequest({
  url: `https://api.songstats.com/enterprise/v1/artists/stats?songstats_artist_id=${songStatsArtistId}`,
  // Get a free API key from https://coinmarketcap.com/api/
  headers: { "apikey": secrets.songStatsAPIKey  },
})

// First, execute all the API requests are executed concurrently, then wait for the responses
const [spotifyListenersResponse, spotifyListenersSongStatsResponse] = await Promise.all([
  spotifyListenersRequest,
  spotifyListenersSongStatsRequest
])

//console.log("spotifyListenersResponse = ",spotifyListenersResponse);
console.log("spotifyListenersResponse.data = ",spotifyListenersResponse.data.items[0]);
console.log("spotifyListenersResponse value = ",spotifyListenersResponse.data.items[0].value);


//console.log("spotifyListenersResponse = ",spotifyListenersResponse);
//console.log("spotifyListenersSongStatsResponse = ",spotifyListenersSongStatsResponse);
console.log("spotifyListenersSongStatsResponse.data = ",spotifyListenersSongStatsResponse.data.stats[0]);
console.log("spotifyListenersSongStatsResponse monthly_listeners_current = ",spotifyListenersSongStatsResponse.data.stats[0].data.monthly_listeners_current);

const stats = [];

if (!spotifyListenersResponse.error) {
  stats.push(spotifyListenersResponse.data.items[0].value)
} else {
  console.log("SoundCharts Spotify Listeners Count Error")
}

if (!spotifyListenersSongStatsResponse.error) {
  stats.push(spotifyListenersSongStatsResponse.data.stats[0].data.monthly_listeners_current)
} else {
  console.log("Song Stats Spotify Listeners Count Error")
}

/*
// At least 3 out of 4 prices are needed to aggregate the median price
if (prices.length < 3) {
  // If an error is thrown, it will be returned back to the smart contract
  throw Error("More than 1 API failed")
}
*/

const medianStats = stats.sort((a, b) => a - b)[Math.round(stats.length / 2)]
console.log(`Median Spotify Listeners: ${medianStats}`)

// The source code MUST return a Buffer or the request will return an error message
// Use one of the following functions to convert to a Buffer representing the response bytes that are returned to the client smart contract:
// - Functions.encodeUint256
// - Functions.encodeInt256
// - Functions.encodeString
// Or return a custom Buffer for a custom byte encoding
//return Functions.encodeUint256(parseInt(stats[0]))
return Functions.encodeUint256(parseInt(medianStats))

