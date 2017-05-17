'use strict'
//Require mongoose for database connection
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CoursesSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	title: {type: String, required: true},
	description: {type: String, required: true},
	estimatedTime: {type: String},
	materialsNeeded: {type: String},
	steps: [{stepNumber: {type: Number}, title: {type: String, required: true}, description: {type: String, required: true}}],
	reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}]
});

//Exports the Schema, to be used in others files
var Courses = mongoose.model("Course", CoursesSchema);

module.exports = Courses;
