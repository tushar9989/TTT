const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.static(__dirname+'/client_react'));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use(bodyParser.json());

// Customers
app.get('/api/top/:_n', (req, res) => {
	var n = req.params._n;
	res.json({
		n: n
	});
});

app.listen(3000);
console.log('Running on port 3000...');
