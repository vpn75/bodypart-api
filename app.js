const express = require('express');
const bodyParser = require('body-parser');
const bodypart = require('./model');

const app = express();
const router = express.Router();
const port = process.env.API_PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/api', router);


router.route('/')
	.get((req, res) => {
		bodypart.find().exec((err, docs) => {
			if (err) res.send(err);

			const result = {};
			result.totalRecords = docs.length;
			result.records = docs
			res.json(result);
		});
	})

	.post((req, res) => {
		
		const newbp = new bodypart({
			imgcode: req.body.imgcode,
			bodypart: req.body.bodypart,
			modality: req.body.modality,
			description: req.body.description
		});

		newbp.save((err) => {
			if (err) {
				res.status(500).json({msg: 'Error!'});
			}
				res.json({msg:'Success'})
		});

	});

router.route('/delete/:id')

	.delete((req, res) => {
		bodypart.remove({
			_id: req.params.id
		}, (err, doc) => {
			if (err) {
				res.status(500).send({'msg':'Deletion error!'});
			}
			else {
				res.json({'msg':'Record successfully deleted!'});
			}
		});
	});

router.route('/bodypart')
	.get((req, res) => {
		bodypart.distinct('bodypart', (err, bp) => {
			if (err) {
				res.status(404).json({'msg':'Error!'});
			}
			else {
				const result = {};
				result.bodyparts = bp;
				res.json(result);
			}
		});
	});

router.route('/bodypart/:name')
	.get((req, res) => {
		//const bpname = req.params.name;
		if (req.query.modality) {
			//console.log(req.query.modality);
			bodypart.find().
			and([
				{bodypart: req.params.name.toUpperCase()}, 
				{modality: req.query.modality.toUpperCase()}
			]).
			exec((err, docs) => {
				if (err) {
					res.status(500).json({'msg':'error'});
				}
				else {
					const result = {};
					result.totalRecords = docs.length;
					result.records = docs;
					res.json(result);
				}
			});
		}
		else {

			bodypart.find().
			where('bodypart').
			equals(req.params.name.toUpperCase()).
			exec((err, docs) => {
				if (err) {
					res.status(500).json({'msg':'Error!'});
				}
				if (docs.length < 1) {
					res.status(404).send({});
				}
				else {
					const result = {};
					result.totalRecords = docs.length;
					result.records = docs;
					res.json(result);
				}
			});
		}
	});


router.route('/code/:code_value')
	.get((req, res) => {
		if (req.params.code_value) {
			const regex = new RegExp(req.params.code_value, "i");

			bodypart.find({imgcode: regex}).
			exec((err, docs) => {
				if (err) {
					res.status(500).json({'msg':'Error!'});
				}
				if (docs.length < 1) {
					res.status(404).send({});
				}
				else {
					const result = {};
					result.totalRecords = docs.length;
					result.records = docs;
					res.json(result);
				}
			});
		}
	});

app.listen(port, () => {
	console.log('Server running on port ' + port);
});

router.route('/description/:value')
	.get((req,res) => {
		if (!req.params.value) {
			console.log('Missing description search value!');
			res.status(404).send({});
		}
		if (req.query.modality) {
			bodypart.find().
			and([
					{$text: {$search: encodeURI(req.params.value)}},
					{modality: req.query.modality.toUpperCase()}
				]).
			exec((err, docs) => {
				if (err) {
					res.status(500).send({'msg':'Error!'});
				}
				if (docs.length < 1) {
					res.status(400).send({});
				}
				else {
					const result = {};
					result.totalRecords = docs.length;
					result.records = docs;
					res.json(result);
				}
			});
		}
		else {
			bodypart.find(
					{$text: {$search: encodeURI(req.params.value)}}
				).
			exec((err, docs) => {
				if (err) {
					res.status(500).json({'msg':'Error!'});
				}
				if (docs.length < 1) {
					res.status(404).send({});
				}
				else {
					const result = {};
					result.totalRecords = docs.length;
					result.records = docs;
					res.json(result);
				}
			});
		}		
	});