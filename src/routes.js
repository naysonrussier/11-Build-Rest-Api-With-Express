'use strict'

var express = require("express");
var auth = require('basic-auth');

var router = express.Router();

var Users = require("./models/Users");
var Courses = require("./models/Courses");
var Reviews = require("./models/Reviews");
var mid = require("./middleware/index.js");

// GET USERS, require login
router.get("/users", mid.requiresLogin, function(req, res, next) {
	Users.findById(req.user._id)
		.exec(function(err, users) {
			if(err) {
				next(err);
			} else {
				res.send(users);
			}
		});
});

//POST USERS
router.post("/users", function(req, res, next) {
	if(req.body.password === req.body.confirmPassword) {
		Users.checkEmail(req.body.emailAddress, function(err, results) {
				if(err) {
					next(err)
				} else {
					Users.create(req.body, function(err, result) {
						if(err) {
							next(err);
						} else {
							res.setHeader("Location", "/");
							res.status(201);
							res.send({})
						}
					});
				};
			});
	} else {
		var err = new Error({message: "Your passwords didn't match"});
		next(err);
	}
});

//GET COURSES
router.get("/courses", function(req, res, next) {
	Courses.find({})
		.select('_id title')
		.exec(function(err, courses) {
			if(err) {
				next(err);
			} else {
				res.send(courses);
			}
		});
});

//GET COURSES/:COURSEID require login
router.get("/courses/:courseId", mid.requiresLogin, function(req, res, next) {
	Courses.findById(req.params.courseId)
		.populate({path: 'user', select: 'fullName'})
		.populate({path: 'reviews', populate: {path: 'user', select: 'fullName'}})
		.exec(function(err, course) {
			if(err) {
				next(err);
			} else if(!course) {
				next({message: "This course couldn't be found!"});
			} else {
				res.send(course);
			}
		});
});

//POST COURSES require login
router.post("/courses", mid.requiresLogin, function(req, res, next) {
	req.body.user = req.user._id;
	Courses.create(req.body, function(err, result) {
			if(err) {
				next(err);
			} else {
				res.setHeader("Location", "/");
				res.status(201);
				res.send({})
			}
		});
});

//UPDATE COURSES/:COURSEID require login
router.put("/courses/:courseId", mid.requiresLogin, function(req, res, next) {
	req.body._id = req.params.courseId;
	Courses.findByIdAndUpdate(req.params.courseId, req.body)
		.exec(function(err, result) {
			if(err) {
				next(err);
			} else if(!result) {
				next({message: "This course couldn't be found!"});
			} else {
				res.setHeader("Location", "/");
				res.status(204);
				res.send({})
			}
		});
});

//POST COURSES/:COURSEID/REVIEWS, add a review, require login
router.post("/courses/:courseId/reviews", mid.requiresLogin, function(req, res, next) {
	Courses.findById(req.params.courseId)
		.populate("reviews")
		.exec(function(err, course) {
			if (err) {
				return next(err);
			} else if (!course) {
				next({message: "This course couldn't be found!"});
			} else if (course.user.toString() == req.user._id.toString()) {
				return next({message: "You can't review your own courses!"});
			} else {
				for(var i = 0; i < course.reviews.length; i ++) {
					if (course.reviews[i].user.toString() == req.user._id.toString()) {
						
						return next({message: "You can't review the same course twice!"});
						break;
					}
				};
				req.body.user = req.user._id;
				Reviews.create(req.body, function(err, result) {
					if(err) {
						next(err);
					} else {
						Courses.findByIdAndUpdate(req.params.courseId, {$push: {"reviews": result.id}},function(err, result) {
							if (err) {
								next(err);
							} else {
								res.setHeader("Location", "/");
								res.status(201);
								res.send({});
							};
						});
					};
				});
			};
		});	
});

module.exports = router;
