const httpService = require('../services/http.js');
const frequencyService = require('../services/frequency.js');
const topService = require('../services/top.js');

function getTopWordsFromURL(url, n, ignoreCommon, callback) {
    httpService.getBodyFromUrl(url, (err, body) => {
        if (err) {
            callback(err);
            return;
        }

        frequencyService.getWordFrequenciesFromText(body, ignoreCommon, (freqErr, frequencies) => {
            if (freqErr) {
                callback(freqErr);
                return;
            }

            topService.getTopInOrder(frequencies, n, (topError, newFrequencies) => {
                if (topError) {
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

const wrapper = {
    getTop: function (req, res) {
        var n = parseInt(req.params._n);
        var url = req.query.url;

        if (isNaN(n) || n < 1) {
            res.status(400).send({
                message: "Invalid input."
            });
            return;
        }
        // http://norvig.com/big.txt
        getTopWordsFromURL(url, n, req.query.ignoreCommon, function (err, words) {
            if (err) {
                console.log(err);
                res.status(500).send({
                    message: err.message
                });
            }
            else {
                res.json(words);
            }
        });
    }
};

module.exports = wrapper;