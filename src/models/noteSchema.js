const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	details: {
		type: String,
		required: true
	},
	user: {
		type: String,
		required: true
	},
	isPhoto: {
		type: Boolean,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('note', noteSchema);
