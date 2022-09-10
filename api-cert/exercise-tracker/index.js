const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
require('dotenv').config();

const port = process.env.PORT || 5000;
const db = process.env.MONGO_URI;

const connectDB = async () => {
	try {
		await mongoose.connect(db);
		console.log('MongoDB connected...');
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
};

connectDB();

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('public'));

const ExerciseSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	description: { type: String, required: true },
	duration: { type: Number, required: true },
	date: String,
});

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);
const Exercise = mongoose.model('Exercise', ExerciseSchema);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});

// GET: Users
app.get('/api/users', async (req, res) => {
	try {
		const users = await User.find();
		res.send(users);
	} catch (error) {
		console.error(error);
		res.status(500).json('Server error');
	}
});

// POST: New User
app.post('/api/users', async (req, res) => {
	const name = req.body.username;
	const user = new User({ username: name });
	let newUser = await user.save();
	res.json({ _id: newUser._id, username: newUser.username });
});

// Sample ID: 631a8294c5d6e4a5bcf60bde
// POST: Exercises
app.post('/api/users/:_id/exercises', (req, res) => {
	const id = req.params._id;
	const dateInput = req.body.date;
	const { description, duration } = req.body;

	let date = new Date(dateInput);
	if (dateInput === '' || dateInput === undefined) date = new Date();

	User.findById(id, (err, userData) => {
		if (err) {
			res.send('Could not find user');
		} else {
			const newExercise = new Exercise({
				userId: id,
				description: description,
				duration: parseInt(duration),
				date: date,
			});
			newExercise.save((err, data) => {
				if (err) {
					res.status(500).json('Server error');
				} else {
					const { description, duration, date } = data;
					const formattedDate = new Date(date + 'Z').toDateString();
					res.json({
						username: userData.username,
						description: description,
						duration: duration,
						date: formattedDate,
						_id: userData.id,
					});
				}
			});
		}
	});
});

app.get('/api/users/:_id/logs', (req, res) => {
	const { _id } = req.params;
	const { limit, to, from } = req.query;

	User.findById(_id, (err, userData) => {
		if (!err) {
			Exercise.find({ userId: _id })
				// Could just use .limit functionality of .find, but
				// FreeCodeCamp won't pass test with this.
				//.limit(limit)
				.exec((err, data) => {
					if (!err) {
						let responseObject = {};
						const count = data.length;
						const { _id, username } = userData;

						const log = data.map(l => {
							const formattedDate = new Date(l.date + 'Z').toDateString();
							return {
								description: l.description,
								duration: l.duration,
								date: formattedDate,
							};
						});

						responseObject = { username, _id, log };

						if (from || to) {
							let fromDate = new Date();
							let toDate = new Date();

							if (req.query.from) {
								fromDate = new Date(req.query.from + 'Z');
							}

							if (req.query.to) {
								toDate = new Date(req.query.to + 'Z');
							}

							fromDate = fromDate;
							toDate = toDate;

							responseObject.log = responseObject.log.filter(session => {
								let sessionDate = new Date(session.date + 'Z');
								return sessionDate >= fromDate && sessionDate <= toDate;
							});
						}

						// Limit log results, per the formatting FCC expects.
						if (req.query.limit) {
							responseObject.log = resObj.log.slice(0, req.query.limit);
						}

						responseObject.count = responseObject.log.length;
						res.json(responseObject);
					} else {
						res.status(500).json('Server error!');
					}
				});
		} else {
			res.status(500).json('Server error');
		}
	});
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port);
});
