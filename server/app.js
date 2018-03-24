const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const constants = require('./constants.js');
const redis = require('redis');

app.use(express.static(__dirname+'/client_react'));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use(bodyParser.json());
const client = redis.createClient();

app.get('/api/top/:_n', (req, res) => {
	var n = parseInt(req.params._n);
	var url = req.query.url;

	if(isNaN(n) || n < 1)
	{
		res.status(400).send({
			message: "Invalid input."
		});
		return;
	}
	// http://digest.textfiles.com/TELECOMDIGEST/vol14.iss0051-0100.txt
	getTopWordsFromURL(url, n, req.query.ignoreCommon, function(err, words) {
		if(err)
		{
			console.log(err);
			res.status(500).send({
				message: err.message
			});
		}
		else {
			res.json(words);
		}
	});
});

function getTopWordsFromURL(url, n, ignoreCommon, callback)
{
	getBodyFromUrl(url, (err, body) => {
		if(err) {
			callback(err);
			return;
		}
		console.log("Characters: " + body.length);

		getWordFrequenciesFromText(body, ignoreCommon, (freqErr, frequencies) => {
			if(freqErr)
			{
				callback(freqErr);
				return;
			}

			getTop(frequencies, n, (topError, newFrequencies) => {
				if(topError)
				{
					callback(topError);
					return;
				}

				callback(null, {
					data: newFrequencies
				});
			});
		});
	});
}

function getTop(inputFrequencies, n, callback) {
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function partition(array) {
		var left = [];
		var right = [];
		var end = array.length - 1;
		var random = getRandomInt(0, end);
		var pivot = array[random].count;
		for(var i = 0; i <= end; i++)
		{
			if(i === random)
				continue;

			if(array[i].count > pivot)
				left.push(array[i]);
			else
				right.push(array[i]);
		}

		return {
			left: left,
			pivot: array[random],
			right: right
		};
	}

	try {
		console.time('getTop');
		if(n >= inputFrequencies.length)
		{
			callback(null, inputFrequencies);
			return;
		}

		var frequencies = JSON.stringify(inputFrequencies);
		frequencies = JSON.parse(frequencies);
		var wordsRemaining = 0;
		var top = [];

		while(top.length < n) {
			var partitioned = partition(frequencies);

			if(partitioned.left.length <= (n - top.length))
			{
				for(var i = 0; i < partitioned.left.length; i++)
				{
					top.push(partitioned.left[i]);
					if(top.length === n)
					{
						break;
					}
				}

				if(top.length < n)
				{
					top.push(partitioned.pivot);
				}
				frequencies = partitioned.right;
			}
			else
			{
				frequencies = partitioned.left;
			}
		}

		console.timeEnd('getTop');
		callback(null, top);
	} catch (e) {
		callback(e);
	}
}

function getWordFrequenciesFromText(text, ignoreCommon, callback)
{
	try {
		console.time('test');

		// Will work only for english words. Special characters will be ignored.
		var extractWordsRegex = /(\w+(['’-]?\w+)?)/g;

		var words = text.match(extractWordsRegex);
		var frequency = {};
		for(var i = 0; i < words.length; i++)
		{
			// Ignoring numbers
			if(!isNaN(parseInt(words[i])))
			{
				continue;
			}
			var lowerCaseWord = words[i].toLowerCase();
			if(constants.stopWords[lowerCaseWord] === true && ignoreCommon === 'true')
			{
				continue;
			}
			if(frequency[lowerCaseWord] === undefined)
			{
				frequency[lowerCaseWord] = {
					count: 0,
					word: lowerCaseWord
				};
			}
			frequency[lowerCaseWord].count++;
		}
		console.timeEnd('test');
		callback(null, Object.values(frequency));

	} catch (e) {
		callback(e);
	}
}

function getBodyFromUrl(url, callback) {
	var key = 'ttt_' + url;
	client.exists(key, (err, reply) => {
		if(err)
		{
			callback(err);
			return;
		}

		if (reply === 1) {
			client.get(key, (err, reply) => {
				if(err)
				{
					callback(err);
				}
				else
				{
					callback(null, reply);
				}
			});
		}
		else {
			var req = http.get(url, function (res) {
	  var bodyChunks = [];
	  res.on('data', (chunk) => {
	    bodyChunks.push(chunk);
				}).on('end', function () {
					var body = Buffer.concat(bodyChunks).toString();
					client.setex(key, 3600, body);
					callback(null, body);
				});
	});

			req.on('error', function (e) {
		callback(e);
	});
}
	});
}

app.listen(3000);
console.log('Running on port 3000...');
