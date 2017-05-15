'use strict'

//Require mongoose for database connection
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//require the Course Schema, to be used in validation
var CoursesSchema = require("./Courses").schema;

var ReviewsSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	postedOn: {type: Date, default: Date.now},
	rating: {type: Number, min: 1, max: 5},
	review: {type: String}
});

// check if the reviewer is also the course owner.
ReviewsSchema.statics.authorize = function(userId, courseID, callback) {
	CoursesSchema.findOne({_id : courseId}, function(err, result) {
		if (err) {
			return callback(err);
		} else if (results.user === userId) {
			return callback({message: "You can't review your own courses!"});
		} else {
			return callback(null, results)
		}
	});	
};

//Exports the Schema, to be used in others files
var Reviews = mongoose.model("Review", ReviewsSchema);

module.exports = Reviews;