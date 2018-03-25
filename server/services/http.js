const http = require('http');
const https = require('https');
const cache = require('../models/redis.js');

const wrapper = {
    getBodyFromUrl: function (url, callback) {
        var key = 'ttt_' + url;

        cache.get(key, (err, response) => {
            if(err)
            {
                getContentsFromUrl(url, callback, key);
            }
            else
            {
                callback(null, response);
            }
        });
    }
};

function getContentsFromUrl(url, callback, key) {
    var client = http;

    if(url.indexOf('https') === 0) 
        client = https;

    try
    {
        var req = client.get(url, function (res) {
            var bodyChunks = [];
            res.on('data', (chunk) => {
                bodyChunks.push(chunk);
            }).on('end', function () {
                var body = Buffer.concat(bodyChunks).toString();
                cache.set(key, body, 3600);
                callback(null, body);
            });
        });

        req.on('error', function (e) {
            callback(e);
        });
    }
    catch(e) {
        callback(e);
    }
}

module.exports = wrapper;