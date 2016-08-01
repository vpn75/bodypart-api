const mongoose = require('mongoose');

mongoose.connect('mongodb://10.173.13.192/test');

const Schema = mongoose.Schema;

const bpSchema =  new Schema({
	imgcode: {type: String, required: true},
	bodypart: {type: String, required: true},
	description: {type: String, required: true},
	modality: {type: String, required: true}
});

const bodypart = mongoose.model('bodypart', bpSchema);

module.exports = bodypart;