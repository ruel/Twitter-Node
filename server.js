/*
 * server.js
 */

var express = require('express');
var twitter = require('./twitter.js');

var app = express();

// We need a local cache here
var cache = [];

// We need this for catching POST data
app.use(express.bodyParser());

// Send in the HTML :)
app.get('/', function(request, response) {
    response.sendfile(__dirname + '/html/index.html');
});

// Serve static js files
app.get('/js/*.js', function(request, response) {
    response.sendfile(__dirname + request.path);
});

// Handler for the timeline
app.get('/tweets', function(request, response) {
    twitter.getTimeline(30, function(data) {
        
        // Fill the cache
        cache = data;

        // Let's just send what we need for now
        // Stripping off the unused details always helps
        var tws = [];

        for (var i in data) {
            var tw = {
                id_str : data[i].id_str,
                text : data[i].text,
                user : {
                    profile_image_url : data[i].user.profile_image_url,
                    name : data[i].user.name,
                    screen_name : data[i].user.screen_name
                }
            };
            
            // Push into a fresh array
            tws.push(tw);
        }

        response.json(tws);
    });
});

// This one's for a specific tweet
app.get('/tweets/:id', function(request, response) {
    var id = request.params.id;
    var tweet = {};

    // Look for id in cache
    for (var i in cache) {
        if (id === cache[i].id_str) {
            tweet = cache[i];
            break;
        }
    }

    response.json(tweet);
});

// Handles POST for updates
app.post('/tweets', function(request, response) {
    twitter.postStatus(request.body, function(data) {
        
        // Let's add to the local cache
        cache.push(data);
        response.json(data);
    });
});

app.listen(1337);

process.setgid('www-data');
process.setuid('www-data');
