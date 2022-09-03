let bodyParser = require('body-parser');
let express = require('express');
let app = express();

require('dotenv').config();

app.use((req, res, next) => {
	console.log(`${req.method} ${req.path} - ${req.ip}`);
	next();
});

app.use(bodyParser.urlencoded({ extend: false }));

app.get(
	'/now',
	(req, res, next) => {
		req.time = new Date().toString();
		next();
	},
	(req, res) => {
		res.json({ time: req.time });
	}
);

app.use('/public', express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
	absolutePath = __dirname + '/views/index.html';
	res.sendFile(absolutePath);
});

app.get('/json', (req, res) => {
	const STYLE = process.env.MESSAGE_STYLE;
	let msg = 'Hello json';

	if (STYLE === 'uppercase') msg = msg.toUpperCase();
	res.json({ message: msg });
});

app.get('/:word/echo', (req, res) => {
	const { word } = req.params;
	res.json({
		echo: word,
	});
});

app.get('/name', (req, res) => {
	const first = req.query.first;
	const last = req.query.last;

	res.json({ name: `${first} ${last}` });
});

app.post('/name', (req, res) => {
	res.json({ name: `${req.body.first} ${req.body.last}` });
});

module.exports = app;
