console.log("Spotify API")
const soundchartsSongId = args[0]
const songstatsSongId = args[1]
const chartmetricSongId = args[2]


// To make an HTTP request, use the Functions.makeHttpRequest function
// Functions.makeHttpRequest function parameters:
// - url
// - method (optional, defaults to 'GET')
// - headers: headers supplied as an object (optional)
// - params: URL query parameters supplied as an object (optional)
// - data: request body supplied as an object (optional)
// - timeout: maximum request duration in ms (optional, defaults to 10000ms)
// - responseType: expected response type (optional, defaults to 'json')+

let chartmetricAuthToken = ""
const chartmetricAPITokenRequest = Functions.makeHttpRequest({
  url: `https://api.chartmetric.com/api/token`,
  method: "POST",
  data: {
    "refreshtoken": secrets.chartmetricRefreshToken
  }
})
const [chartmetricAPITokenResponse] = await Promise.all([
  chartmetricAPITokenRequest
])

if (!chartmetricAPITokenResponse.error) {
  chartmetricAuthToken = chartmetricAPITokenResponse.data.token;
} else {
  console.log("Chartmetric Auth Token Error ",chartmetricAPITokenResponse);
  return Functions.encodeUint256(0);
}



const spotifyStreamCountRequest = Functions.makeHttpRequest({
  url: `https://customer.api.soundcharts.com/api/v2.24/song/${soundchartsSongId}/spotify/stream`,
  //url: `https://customer.api.soundcharts.com/api/v2/artist/${uuid}/streaming/spotify/listeners`,
  // Get a free API key from https://coinmarketcap.com/api/
  headers: { "x-app-id": secrets.soundchartsAppId, "x-api-key":secrets.soundchartsApiKey  },
})

const spotifyStreamCountSongStatsRequest = Functions.makeHttpRequest({
  url: `https://api.songstats.com/enterprise/v1/tracks/stats?source=spotify&songstats_track_id=${songstatsSongId}`,
  //url: `https://api.songstats.com/enterprise/v1/artists/stats?songstats_artist_id=${songStatsArtistId}`,
  // Get a free API key from https://coinmarketcap.com/api/
  headers: { "apikey": secrets.songStatsAPIKey  },
})

const spotifyStreamCountChartmetricRequest = Functions.makeHttpRequest({
  url: `https://api.chartmetric.com/api/track/${chartmetricSongId}/spotify/stats?type=streams&latest=true`,
  headers: { "Authorization": `Bearer ${chartmetricAuthToken}`  },
})



// First, execute all the API requests are executed concurrently, then wait for the responses
const [spotifyStreamCountResponse, spotifyStreamCountSongStatsResponse, spotifyStreamCountChartmetricResponse] = await Promise.all([
  spotifyStreamCountRequest,
  spotifyStreamCountSongStatsRequest,
  spotifyStreamCountChartmetricRequest
])

//console.log("spotifyStreamCountResponse = ",spotifyStreamCountResponse);
//console.log("spotifyStreamCountResponse.data = ",spotifyStreamCountResponse.data.items[0]);
//console.log("spotifyStreamCountResponse value = ",spotifyStreamCountResponse.data.items[0].plots[0].value);


//console.log("spotifyStreamCountSongStatsResponse = ",spotifyStreamCountSongStatsResponse);
//console.log("spotifyStreamCountSongStatsResponse.data = ",spotifyStreamCountSongStatsResponse.data.stats[0]);
//console.log("spotifyStreamCountSongStatsResponse streams_total = ",spotifyStreamCountSongStatsResponse.data.stats[0].data.streams_total);

//console.log("spotifyStreamCountChartmetricResponse = ",spotifyStreamCountChartmetricResponse);
//console.log("spotifyStreamCountChartmetricResponse.data = ",spotifyStreamCountChartmetricResponse.data.obj[0]);
//console.log("spotifyStreamCountChartmetricResponse streams count = ",spotifyStreamCountChartmetricResponse.data.obj[0].value);

const stats = [];

if (!spotifyStreamCountResponse.error) {
  stats.push(spotifyStreamCountResponse.data.items[0].plots[0].value)
  console.log("spotifyStreamCountResponse value = ",spotifyStreamCountResponse.data.items[0].plots[0].value);
} else {
  console.log("SoundCharts Spotify Stream Count Error")
}

if (!spotifyStreamCountSongStatsResponse.error) {
  stats.push(spotifyStreamCountSongStatsResponse.data.stats[0].data.streams_total)
  console.log("spotifyStreamCountSongStatsResponse streams_total = ",spotifyStreamCountSongStatsResponse.data.stats[0].data.streams_total);
} else {
  console.log("Song Stats Spotify Stream Count Error")
}

if (!spotifyStreamCountChartmetricResponse.error) {
  stats.push(spotifyStreamCountChartmetricResponse.data.obj[0].value)
  console.log("spotifyStreamCountChartmetricResponse streams count = ",spotifyStreamCountChartmetricResponse.data.obj[0].value);
} else {
  console.log("Chartmetric Spotify Stream Count Error")
}

/*
// At least 3 out of 4 prices are needed to aggregate the median price
if (prices.length < 3) {
  // If an error is thrown, it will be returned back to the smart contract
  throw Error("More than 1 API failed")
}
*/
console.log(`sorted: ${stats.sort((a, b) => a - b)}`);
console.log(`middle number: ${Math.floor(stats.length / 2)}`);
const medianStats = stats.sort((a, b) => a - b)[Math.floor(stats.length / 2)]
console.log(`Median Spotify Listeners: ${medianStats}`)

// The source code MUST return a Buffer or the request will return an error message
// Use one of the following functions to convert to a Buffer representing the response bytes that are returned to the client smart contract:
// - Functions.encodeUint256
// - Functions.encodeInt256
// - Functions.encodeString
// Or return a custom Buffer for a custom byte encoding
//return Functions.encodeUint256(parseInt(stats[0]))
return Functions.encodeUint256(parseInt(medianStats))

