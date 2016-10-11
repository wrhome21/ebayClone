var path = require('path');
var db = require('./db.js');
var stringUtil = require('string');

// app.post('/login')
exports.login = function (req, res) {
    if (stringUtil(req.body.userName).isEmpty() || stringUtil(req.body.password).isEmpty()) {
        res.sendFile(path.join(__dirname + '/login.html'));
    } else {
        credentials = {
            userName: req.body.userName,
            password: req.body.password
        };

        db.authenticateUser(credentials, function (err, user) {
            if (err) {
                res.send(err);
            }
            else {
                if (user) {
                    req.session.currentUser = user;
                }
                res.redirect('/');
            }
        });
    }
};

// app.get('/logout')
exports.logout = function (req, res) {
    delete req.session.currentUser;
    res.redirect('/');
};