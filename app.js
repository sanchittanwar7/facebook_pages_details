let pageToken = 'EAACNl93bsPgBAKNC3IsBLACpeyOoS1KSd2ZCBy4ZCloCkn4c4KSnHvwyg1s9Hm6XUtNWj6yYhvMwRsRSIXbAloKsftVLyFQQA6oK0pIMfNknOSaCQ48ccEudY2T9ZAmAyiP8ACgyNB5ZCSg4DiMwMJD9tYABdQAZD'
let page_name = 'vociq'
let axios = require('axios')
let pageId, postType
let postId 
let info
let pageInfo = []
let lastExtractedAt = 1425168000
let lastPostTime = 1521093276
let commentCount = 0, likeCount = 0, shareCount = 0
var csvWriter = require('csv-write-stream')
var writer = csvWriter()
var fs = require('fs')

let apiURL = `https://graph.facebook.com/v2.11/${page_name}?fields=fan_count,overall_star_rating,rating_count&oauth_token=${pageToken}`;

axios.get(apiURL)
.then(async function (response) {
    pageId = response.data.id
    postType = 'posts'
    apiURL2 = `https://graph.facebook.com/v2.11/${pageId}/${postType}?since=${lastExtractedAt}&until=${lastPostTime}&limit=10&access_token=${pageToken}`;
    console.log("apiURL2", apiURL2)
    while(apiURL2){
        console.log("apiURL2", apiURL2)
        await axios.get(apiURL2)
        .then(async function(response) {
                    console.log("inside")

            // console.log(response)
            for(var i = 0; i < response.data.data.length; i++) {
                postId = response.data.data[i].id
                apiURL3 = `https://graph.facebook.com/v2.11/${postId}?fields=comments.filter(stream).limit(10).summary(true),likes.limit(10).summary(true),shares&access_token=${pageToken}`;
                await axios.get(apiURL3)
                .then(function(response) {
                   info = {}
                   info.commentCount = response.data.comments.summary === undefined ? 0 : response.data.comments.summary.total_count
                   info.likeCount = response.data.likes.summary === undefined ? 0 : response.data.likes.summary.total_count
                   info.shareCount = response.data.shares === undefined ? 0 : response.data.shares.count
                   pageInfo.push(info)
               })
                .catch(function (error) {
                   console.log(error)
               })
            }
            console.log(pageInfo.length)
            pageInfo.forEach((eachPost) => {
                commentCount += eachPost.commentCount
                likeCount += eachPost.likeCount
                shareCount += eachPost.shareCount
            })
            var writer = csvWriter({ headers: ["Page Name", "Total comments", "Total likes", "Total shares"]})
            writer.pipe(fs.createWriteStream('out.csv'))
            writer.write([page_name, commentCount, likeCount, shareCount])
            // writer.end()
            if(response.data.paging && response.data.paging.next){
                apiURL2 = response.data.paging.next + `&oauth_token=${pageToken}`
            }
            else{
                apiURL2 = undefined
            }
        })
        .catch(function (error) {
           console.log(error)
       })
    }
})
.catch(function (error) {
	console.log(error);
});
console.log(apiURL)
