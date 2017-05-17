'use strict';

// load modules
var express = require('express');
var morgan = require('morgan');
var jsonParser = require("body-parser").json;

var app = express();
var Users = require("./models/Users.js");
var Reviews = require("./models/Reviews.js");
var Courses = require("./models/Courses.js");
var api = require("./routes");
var config = require("./config.js");

var mongoose = require("mongoose");
var seeder = require("mongoose-seeder");

app.use(jsonParser());

//Open database connection
mongoose.connect("mongodb://" + config.host + ":" + config.port + "/" + config.dbName);

var db = mongoose.connection;

//Write to console on errors
db.on("error", function(err) {
	console.error(err);
});

db.once("open", function () {
	console.log("db connection successful");
	if(config.initialize) {
		var data = require('./data/data.json');
	 
		seeder.seed(data).then(function(dbData) {
			console.log("Data initialized successfully")
		}).catch(function(err) {
			console.log(err)
		});
	};
});
	
// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

// setup our static route to serve files from the "public" folder
app.use('/api/', api);

// catch 404 and forward to global error handler
app.use(function(req, res, next) {
	var err = new Error('File Not Found');
	err.status = 404;
	next(err);
});

// Express's global error handler
app.use(function(err, req, res, next) {
	var error = {
		error: err
	}
	res.status(err.status || 500);
	res.json(error);
});

// start listening on our port
var server = app.listen(app.get('port'), function() {
  console.log('Express server is listening on port ' + server.address().port);
});
