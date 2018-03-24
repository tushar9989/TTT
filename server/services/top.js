const wrapper = {
    getTopInOrder: function (inputFrequencies, n, callback) {
        if (inputFrequencies.length <= n) {
            inputFrequencies.sort((a, b) => b.count - a.count);
            callback(null, inputFrequencies);
        }
        else {
            try {
                callback(null, getTopByBuckets(inputFrequencies, n));
            }
            catch (e) {
                callback(e);
            }
        }
    }
};

function getTopByBuckets(inputFrequencies, n) {

    var [ buckets, max ] = getMaxAndBuckets(inputFrequencies);

    return getTopFromBucketsAndMax(buckets, max, n);
}

function getMaxAndBuckets(inputFrequencies) {
    var buckets = {};
    var max = inputFrequencies[0].count;
    for (i = 0; i < inputFrequencies.length; i++) {
        if (inputFrequencies[i].count > max)
            max = inputFrequencies[i].count;

        if (buckets[inputFrequencies[i].count] === undefined)
            buckets[inputFrequencies[i].count] = [];

        buckets[inputFrequencies[i].count].push(inputFrequencies[i]);
    }

    return [ buckets, max ];
}

function getTopFromBucketsAndMax(buckets, max, n) {
    var top = [];

    for (var i = max; i >= 0; i--) {
        if (buckets[i] !== undefined) {
            for (var j = 0; j < buckets[i].length; j++) {
                top.push(buckets[i][j]);

                if (top.length === n) {
                    return top;
                }
            }
        }
    }

    return top;
}

module.exports = wrapper;