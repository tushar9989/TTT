const redis = require('redis');
const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB
});

const wrapper = {
    get: function(key, callback) {
        client.exists(key, (err, reply) => {
            if (err) {
                callback(err);
                return;
            }

            if (reply === 1) {
                client.get(key, (err, reply) => {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, reply);
                    }
                });
            }
            else {
                callback({ message: 'Not in cache' });
            }
        });
    },

    set: function(key, value, expiry) {
        if(expiry !== undefined)
            client.setex(key, expiry, value);
        else
            client.selected_db(key, value);
    }
};

module.exports = wrapper;