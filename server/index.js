const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

const topController = require('./controllers/top.js');

const app = express();
app.use(bodyParser.json());

// Static files
app.use(express.static(__dirname + '/../client'));
app.use('/node_modules', express.static(__dirname + '/../node_modules/'));

// Public API
app.get('/api/top/:_n', topController.getTop);

// Start server
app.listen(process.env.HTTP_PORT);
