const mongoose = require('mongoose');

const mongo_host = process.env.MONGO_DB_URI || 'mongodb://localhost/test';
mongoose.connect(mongo_host);

const Schema = mongoose.Schema;

const bpSchema =  new Schema({
	imgcode: {type: String, required: true},
	bodypart: {type: String, required: true},
	description: {type: String, required: true},
	modality: {type: String, required: true}
});

const bodypart = mongoose.model('bodypart', bpSchema);

module.exports = bodypart;
