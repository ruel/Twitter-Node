/*
 * twitter.js
 */

var tweetjs = require('twitter');

// This is where the keys go
var keys = {
    consumer_key:           'YOUR_KEY_HERE',
    consumer_secret:        'YOUR_KEY_HERE',
    access_token_key:       'YOUR_KEY_HERE',
    access_token_secret:    'YOUR_KEY_HERE'
};

var twitter = new tweetjs(keys);

// Our cache variables
var cache = [];
var lastwrite = Date.now();

// Cache age is 60 seconds
var age = 60;

// Function to get the latest timeline of tweets
// We'll do the caching here
exports.getTimeline = function(count, callback) {

    // Check if cache is empty, or lastwrite's age has reached its limit
    if (cache.length == 0 || ((Date.now() - lastwrite) / 1000) >= age) {
        
        // Refresh the cache
        // console.log("Rebuilding cache");
        twitter.get('/statuses/home_timeline.json', { count : count }, function(data) {
            cache = data;
            lastwrite = Date.now();
            callback(cache);
        });
    } else {
        
        // Return the cache
        // console.log("Returning cache");
        callback(cache); 
    }
}

// Posts status to twitter
exports.postStatus = function(status, callback) {
    
    // The module seems to have a good way to do such functions
    // but as recommended, they are not API stable
    twitter.post('/statuses/update.json', status, 'application/json', function(data) {
        if (data.id !== undefined) {

            // Let's empty the cache, so we can see our tweet
            // Actually, no, just append the data to the cache.
            cache.push(data);
        }
        callback(data);
    });
}
