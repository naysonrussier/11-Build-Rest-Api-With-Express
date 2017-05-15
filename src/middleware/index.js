var User = require("../models/Users");
var auth = require('basic-auth');

function requiresLogin(req, res, next) {
	var credentials = auth(req);
	
	if(credentials) {
		User.authenticate(credentials.name, credentials.pass, function(error, user) {
			if (error || !user) {
				var err = {error: 'Wrong email or password.', status: 401};
				return next(err);
			} else {
				req.user = user;
				next();
			}
		});
	} else {
		var err = {message: 'You are not authorized to view this page.', status: 401};
		return next(err);
	};
};

module.exports.requiresLogin = requiresLogin;