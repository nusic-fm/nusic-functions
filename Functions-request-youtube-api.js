console.log("Youtube API")
const youtubeId = args[0]
const songstatsYoutubeSongId = args[1]
// To make an HTTP request, use the Functions.makeHttpRequest function
// Functions.makeHttpRequest function parameters:
// - url
// - method (optional, defaults to 'GET')
// - headers: headers supplied as an object (optional)
// - params: URL query parameters supplied as an object (optional)
// - data: request body supplied as an object (optional)
// - timeout: maximum request duration in ms (optional, defaults to 10000ms)
// - responseType: expected response type (optional, defaults to 'json')+

const youtubeViewCountRequest = Functions.makeHttpRequest({
  url: `https://content-youtube.googleapis.com/youtube/v3/videos?key=${secrets.key}&part=statistics&id=${youtubeId}`,
})

const youtubeViewsCountSongstatsRequest = Functions.makeHttpRequest({
  url: `https://api.songstats.com/enterprise/v1/tracks/stats?source=youtube&songstats_track_id=${songstatsYoutubeSongId}`,
  headers: { "apikey": secrets.songStatsAPIKey  },
})

//https://content-youtube.googleapis.com/youtube/v3/videos?key=AIzaSyBK86jGrCR8lh5IVyKSohMN1Q2_tvUy2uA&part=statistics&id=7vEPncg8zno
// First, execute all the API requests are executed concurrently, then wait for the responses
const [youtubeViewCountResponse, youtubeViewsCountSongstatsResponse] = await Promise.all([
  youtubeViewCountRequest,
  youtubeViewsCountSongstatsRequest
])

//console.log("youtubeViewCountResponse = ",youtubeViewCountResponse);
//console.log("youtubeViewCountResponse.data = ",youtubeViewCountResponse.data.items[0]);
console.log("youtubeViewCountResponse.value = ",youtubeViewCountResponse.data.items[0].statistics.viewCount);

//console.log("youtubeViewsCountSongstatsResponse = ",youtubeViewsCountSongstatsResponse);
//console.log("youtubeViewsCountSongstatsResponse.data = ",youtubeViewsCountSongstatsResponse.data.stats[0]);
console.log("youtubeViewsCountSongstatsResponse.value = ",youtubeViewsCountSongstatsResponse.data.stats[0].data.video_views_total);

const stats = [];


if (!youtubeViewCountResponse.error) {
  stats.push(youtubeViewCountResponse.data.items[0].statistics.viewCount)
} else {
  console.log("API Youtube Views Count Count Error")
}

if (!youtubeViewsCountSongstatsResponse.error) {
  stats.push(youtubeViewsCountSongstatsResponse.data.stats[0].data.video_views_total)
} else {
  console.log("Songstats Youtube Views Count Error")
}
/*
// At least 3 out of 4 prices are needed to aggregate the median price
if (prices.length < 3) {
  // If an error is thrown, it will be returned back to the smart contract
  throw Error("More than 1 API failed")
}
*/
const medianStats = stats.sort((a, b) => a - b)[Math.round(stats.length / 2)]
console.log(`Median Youtube Views: ${medianStats}`)

// The source code MUST return a Buffer or the request will return an error message
// Use one of the following functions to convert to a Buffer representing the response bytes that are returned to the client smart contract:
// - Functions.encodeUint256
// - Functions.encodeInt256
// - Functions.encodeString
// Or return a custom Buffer for a custom byte encoding
return Functions.encodeUint256(parseInt(medianStats))
