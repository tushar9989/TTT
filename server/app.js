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

		getWordFrequenciesFromText(body, ignoreCommon, (freqErr, frequencies) => {
			if(freqErr)
			{
				callback(freqErr);
				return;
			}

			getTopInOrder(frequencies, n, (topError, newFrequencies) => {
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

function getTopInOrder(inputFrequencies, n, callback)
{
	console.time('getTopInOrder');
	if(inputFrequencies.length <= n)
	{
		inputFrequencies.sort((a, b) => b.count - a.count);
		callback(null, inputFrequencies);
	}
	else
	{
		try {
			var buckets = {};
			var max = inputFrequencies[0].count;
			var i;
			var top = [];
			var done = false;

			for (i = 0; i < inputFrequencies.length; i++) {
				if (inputFrequencies[i].count > max)
					max = inputFrequencies[i].count;

				if (buckets[inputFrequencies[i].count] === undefined)
					buckets[inputFrequencies[i].count] = [];

				buckets[inputFrequencies[i].count].push(inputFrequencies[i]);
			}

			for (i = max; i >= 0; i--) {
				if (buckets[i] !== undefined) {
					for (var j = 0; j < buckets[i].length; j++) {
						top.push(buckets[i][j]);

						if (top.length === n) {
							callback(null, top);
							done = true;
							break;
						}
					}

					if (done)
						break;
				}
			}
		}
		catch (e) {
			callback(e);
		}
	}
	console.timeEnd('getTopInOrder');
}

function getWordFrequenciesFromText(text, ignoreCommon, callback)
{
	try {
		console.time('getWordFrequenciesFromText');

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
		console.timeEnd('getWordFrequenciesFromText');
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
