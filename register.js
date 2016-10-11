var path = require('path');
var db = require('./db.js');

// app.get('/register')
exports.display = function (req, res) {
    res.sendFile(path.join(__dirname + '/register.html'));
};


// app.post('/register')
exports.registerUser = function (req, res) {

    var user = {
        userName: req.body.userName,
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        password: req.body.password,
        address: {
            street1: '6401 Security Blvd',
            city: 'Baltimore',
            state: 'MD',
            zipCode: '21235'
        },
        email: req.body.firstName + '.' + req.body.lastName + '@ssa.gov',
        phone: '(410) 965-5500'
    };

    db.createUser(user, function(err, cnt) {
        if (err)
        {
            console.log(err);
        }
    
        res.redirect('/');
    });
};