const constants = require('../constants/constants.js');

const wrapper = {
    getWordFrequenciesFromText: function (text, ignoreCommon, callback) {
        try {
            callback(null, Object.values(calculateFrequenciesFromWordsList(extractWordsFromText(text), ignoreCommon)));
        } catch (e) {
            callback(e);
        }
    }
};

function extractWordsFromText(text) {
    // Will work only for english words. Special characters will be ignored.
    var extractWordsRegex = /(\w+(['’-]?\w+)?)/g;

    var words = text.match(extractWordsRegex);

    if(words === null)
        words = [];

    return words;
}

function calculateFrequenciesFromWordsList(words, ignoreCommon) {
    var frequency = {};

    for (var i = 0; i < words.length; i++) {
        // Ignoring numbers
        if (!isNaN(parseInt(words[i]))) {
            continue;
        }
        var lowerCaseWord = words[i].toLowerCase();
        if (constants.stopWords[lowerCaseWord] === true && ignoreCommon === 'true') {
            continue;
        }
        if (frequency[lowerCaseWord] === undefined) {
            frequency[lowerCaseWord] = {
                count: 0,
                word: lowerCaseWord
            };
        }
        frequency[lowerCaseWord].count++;
    }

    return frequency;
}

module.exports = wrapper;