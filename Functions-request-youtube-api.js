console.log("Youtube API")
const id = args[0]
// To make an HTTP request, use the Functions.makeHttpRequest function
// Functions.makeHttpRequest function parameters:
// - url
// - method (optional, defaults to 'GET')
// - headers: headers supplied as an object (optional)
// - params: URL query parameters supplied as an object (optional)
// - data: request body supplied as an object (optional)
// - timeout: maximum request duration in ms (optional, defaults to 10000ms)
// - responseType: expected response type (optional, defaults to 'json')+
/*
const youtubeSubscribersRequest = Functions.makeHttpRequest({
  url: `https://content-youtube.googleapis.com/youtube/v3/channels?key=${secrets.key}&part=statistics&id=${id}`,
})
*/
const youtubeViewsCountRequest = Functions.makeHttpRequest({
  url: `https://content-youtube.googleapis.com/youtube/v3/channels?key=${secrets.key}&part=statistics&id=${id}`,
})

//https://content-youtube.googleapis.com/youtube/v3/videos?key=AIzaSyBK86jGrCR8lh5IVyKSohMN1Q2_tvUy2uA&part=statistics&id=7vEPncg8zno
// First, execute all the API requests are executed concurrently, then wait for the responses
const [youtubeViewsCountResponse] = await Promise.all([
  youtubeViewsCountRequest
])
/*
const [youtubeSubscribersResponse] = await Promise.all([
  youtubeSubscribersRequest
])

console.log("youtubeSubscribersResponse = ",youtubeSubscribersResponse);
console.log("youtubeSubscribersResponse.data = ",youtubeSubscribersResponse.data.items[0]);
console.log("youtubeSubscribersResponse.data = ",youtubeSubscribersResponse.data.items[0].statistics.subscriberCount);
*/

console.log("youtubeViewsCountResponse = ",youtubeViewsCountResponse);
console.log("youtubeViewsCountResponse.data = ",youtubeViewsCountResponse.data.items[0]);
console.log("youtubeViewsCountResponse.data = ",youtubeViewsCountResponse.data.items[0].statistics.subscriberCount);

const stats = [];

/*
if (!youtubeSubscribersResponse.error) {
  stats.push(youtubeSubscribersResponse.data.items[0].statistics.subscriberCount)
} else {
  console.log("Youtube Subscribers Count Error")
}
*/
if (!youtubeViewsCountResponse.error) {
  stats.push(youtubeViewsCountResponse.data.items[0].statistics.subscriberCount)
} else {
  console.log("Youtube Views Count Error")
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
