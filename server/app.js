const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');

app.use(express.static(__dirname+'/client_react'));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use(bodyParser.json());

app.get('/api/top/:_n', (req, res) => {
	var n = parseInt(req.params._n);
	getTopWordsFromURL('http://terriblytinytales.com/test.txt', n, function(err, words) {
		res.json(words);
	});
});

function getTopWordsFromURL(url, n, callback)
{
	getBodyFromUrl(url, (err, body) => {
		if(err) {
			callback(err);
		}
		console.log("boom.\n\n");
		console.log(body);
		var re = /(\w+(['’-]?\w+)?)/g;
		console.time('test');
		var words = body.match(re);
		var frequency = {};
		for(var i = 0; i < words.length; i++)
		{
			var lowerCaseWord = words[i].toLowerCase();
			if(frequency[lowerCaseWord] === undefined)
			{
				frequency[lowerCaseWord] = 0;
			}
			frequency[lowerCaseWord]++;
		}
		console.timeEnd('test');
		callback(null, {
			words: words,
			frequency: frequency,
			n: n
		});
	});
}

function getBodyFromUrl(url, callback) {
	var req = http.get(url, function(res) {
	  var bodyChunks = [];
	  res.on('data', (chunk) => {
	    bodyChunks.push(chunk);
	  }).on('end', function() {
			callback(null, Buffer.concat(bodyChunks).toString());
	  })
	});

	req.on('error', function(e) {
		callback(e);
	});
}

app.listen(3000);
console.log('Running on port 3000...');
