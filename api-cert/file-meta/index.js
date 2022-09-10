var express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
var cors = require('cors');
require('dotenv').config();

var app = express();

app.use(fileUpload({ createParentPath: true }));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', async (req, res) => {
	try {
		if (!req.files) {
			res.send({ message: 'No file uploaded.' });
		} else {
			let upFile = req.files.upfile;

			res.send({
				name: upFile.name,
				type: upFile.mimetype,
				size: upFile.size,
			});
		}
	} catch (error) {
		res.status(500).send(error);
	}
});

const port = process.env.PORT || 5000;
app.listen(port, function () {
	console.log('Your app is listening on port ' + port);
});
