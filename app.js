//Define app dependencies
const express = require('express'),
	bodyParser = require('body-parser'),
	bodypart = require('./model'),
	colors =  require('colors'),
	cors = require('cors');

//Instantiate app engine
const app = express();
const router = express.Router();
const port = process.env.API_PORT || 3001;
const batch_limit = 100; //Set limit on number of records to return from

//Helper function to encapsulate JSON response from API queries
const jsonResponse = function (docs) {
	const result = {}
	result.totalRecords = docs.length;
	result.records = docs;
	return result;
}


app.use(cors()); //Enable CORS
app.use(bodyParser.json()); //Enable bodyParser for POST requests
app.use(bodyParser.urlencoded({extended: true}));
app.use('/api', router); //Define API root as /api

//Base route returns portion of bodypart collection.
//Adjust batch_limit parameter to return fewer/more records.
router.route('/')
	.get((req, res) => {
		bodypart.find()
			.limit(batch_limit)
			.exec((err, docs) => {
				if (err) res.send(err);
				const result = jsonResponse(docs);
				res.json(result);
			});
	})

	//Define POST route at base for adding new procedure-codes/bodyparts
	.post((req, res) => {
		
		const newbp = new bodypart({
			imgcode: req.body.imgcode,
			bodypart: req.body.bodypart,
			modality: req.body.modality,
			description: req.body.description
		});

		newbp.save()
		.then((bodypart) => {
			res.json(bodypart);
		})
		.catch(err => {
			res.status(500).json({msg:'Error saving document!'});
		});

	});
//Define PUT route for updating existing records
router.route('/update/:id')
	.put((req, res) => {
		bodypart.findByIdAndUpdate(req.params.id, {$set: req.body})
			.exec((err, result) => {
				if (err) {
					console.log(err);
					res.status(500).json({msg:'Error!'});
				}
				else {
					console.log(result);
					res.json({msg:'Success!'});
				}	
			});
		});
//Define DELETE route for removing existing records
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

//Return array of distinct bodyparts in collection
router.route('/bodypart')
	.get((req, res) => {
		bodypart.distinct('bodypart', (err, bp) => {
			if (err) {
				res.status(404).json({'msg':'Error!'});
			}
			else {
				const result = {};
				result.bodyparts = bp.sort(); //Sort alphabetically
				res.json(result);
			}
		});
	});

//Query by specific bodypart with optional modality filter
router.route('/bodypart/:name')
	.get((req, res) => {
		//const bpname = req.params.name;
		if (req.query.modality) {
			//console.log(req.query.modality);
			bodypart.find()
				.and(
					[
						{bodypart: req.params.name.toUpperCase()}, 
						{modality: req.query.modality.toUpperCase()}
					]
				)
				.exec((err, docs) => {
					if (err) {
						res.status(500).json({'msg':'error'});
					}
					else {
						const result = jsonResponse(docs);
						res.json(result);
					}
				});
		}
		else {
			bodypart.find()
				.where('bodypart')
				.equals(req.params.name.toUpperCase())
				.exec((err, docs) => {
					if (err) {
						res.status(500).json({'msg':'Error!'});
					}
					if (docs.length < 1) {
						res.status(404).send();
					}
					else {
						const result = jsonResponse(docs);
						res.json(result);
					}
				});
		}
	});

//Query by procedure-code. Defaults to exact-match but can specify partial-match through query param
router.route('/code/:code_value')
	.get((req, res) => {
		if (req.query.match == 'partial') {
			const regex = new RegExp(req.params.code_value, "i");

			bodypart.find({imgcode: regex})
				.exec((err, docs) => {
					if (err) {
						res.status(500).json({'msg':'Error!'});
					}
					if (docs.length < 1) {
						res.status(200).json({msg:'Search failed!',records: []});
					}
					else {
						const result = jsonResponse(docs);
						res.json(result);
					}
				});
		}
		else {
			bodypart.findOne({imgcode: req.params.code_value.toUpperCase()})
				.exec((err, doc) => {
					if (err) {
						res.status(500).send();
					}
					if (!doc) {
						res.status(404).send();
					}
					else {
						res.json(doc);
					}
				});
		}
	});

//Query by procedure-description with optional modality filter
router.route('/description/:value')
	.get((req,res) => {
		if (!req.params.value) {
			//console.log('Missing description search value!');
			res.status(200).json({msg:'Missing parameter', records: []});
		}
		if (req.query.modality) {
			bodypart.find()
				.and(
					[
						{$text: {$search: encodeURI(req.params.value)}},
						{modality: req.query.modality.toUpperCase()}
					]
				)
				.exec((err, docs) => {
					if (err) {
						res.status(500).send({msg:'Error', records: []});
					}
					if (docs.length < 1) {
						res.status(200).json({msg:'No results', records: []});
					}
					else {
						const result = jsonResponse(docs);
						res.json(result);
					}
				});
		}
		else {
			bodypart.find(
					{$text: {$search: encodeURI(req.params.value)}}
				)
				.exec((err, docs) => {
					if (err) {
						res.status(500).json({msg:'Error', records: []});
					}
					if (docs.length < 1) {
						res.status(200).json({msg:'No results', records: []});
					}
					else {
						const result = jsonResponse(docs);
						res.json(result);
					}
				});
		}		
	});

	app.listen(port, () => {
		console.log(colors.bold.green('Bodypart API running on localhost:' + port));
});
