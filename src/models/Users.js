'use strict'
/*
Load dependencies :
Mongoose, for the database;
bcrypt, to encrypt passwords.
*/

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

var UsersSchema = new Schema({
	fullName: {type: String, required: true},
	emailAddress: {
		type: String, 
		required: true, 
		unique: true, 
		validate: {
			validator: function(v) {
				return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(v);
			},
			message: '{VALUE} is not a valid email address!'
        }
	},
	password: {type: String, required: true}
});

//Static method to check logins and passwords
UsersSchema.statics.authenticate = function(email, password, callback) {
	Users.findOne({emailAddress: email})
		.exec(function(error, user) {
			if (error) {
				return callback(error);
			} else if ( !user ) {
				var err = new Error('User not found.');
				err.status = 401;
				return callback(err);
			}
			bcrypt.compare(password, user.password, function(error, result) {
				if (result === true) {
					return callback(null, user);
				} else {
					return callback();
				}
			});
		});
}

//Check if the email is unique
UsersSchema.statics.checkEmail = function(email, callback) {
    Users.findOne({emailAddress: email}, function(err, results) {
		if (err) {
			return callback(err);
		} else if (results) {
			return callback({message: "This email address is already taken!"});
		} else {
			return callback(null, results);
		}
	});
};

// hash password before saving to database
UsersSchema.pre("save", function(next) {
	var user = this;
	bcrypt.hash(user.password, 10, function(err, hash) {
		if(err) {
			return next(err);
		}
		user.password = hash;
		next();
	});
});

//Exports the Schema, to be used in others files
var Users = mongoose.model("User", UsersSchema);

module.exports = Users;