var path = require('path');
var db = require('./db.js');
var fs = require('fs');

var profileUser = {userName:'test', firstName:'Test', middleName:'T', lastName:'Test'};

// app.post('/profile')
exports.profile = function(req, res) {
    var userName = req.param.userName;

    db.findUserByUsername(req.params.userName, function(err, profile) {
        if (err)
        {
            res.status(500).send(err);
        }
        else
        {
            res.send(profile);
        }
    });

};

/**
 * Returns "seller info" for the specified user name
 * 
 */
exports.getSellerInfo = function(req, res) {

    db.findUserByUsername(req.params.sellerId, function(err, seller) {

        if (err)
        {
            res.status(500).send(err);
        }
        else
        {
            var sellerInfo = {
                sellerId: seller.userName,
                imageId: seller.userImageId,
                city: seller.address.city,
                state: seller.address.state,
                email: seller.email,
                name: seller.firstName + 
                    (seller.middleName ? ' ' + seller.middleName : '') + ' ' + 
                    seller.lastName,
                sinceDate: new Date(
                    (new Date()).getTime() - 
                    ((24 * 60 * 60 * 1000) * Math.ceil(Math.random() * 100))),
                totalSales: Math.floor(Math.random() * 10000),
                averageRating: (Math.random() * 5).toFixed(1)
            };

            res.send(sellerInfo);
        }
    });

};

exports.postUserImage = function(req, res) {

    if (req.session.currentUser.userName !== req.body.userName)
    {
        res.status(403).end();
        return;
    }

    fs.readFile(req.file.path, function(err, data) {

        if (err)
        {
            console.log('Unable to read user image file: ' + err);
            res.status(500).send(err);
        }
        else
        {
            db.createUserImage(req.body.userName, data, req.file.mimetype, function(err, userImageId) {

                if (err)
                {
                    console.log("Unable to insert user image into database: " + err);
                    res.status(500).send(err);
                }
                else
                {
                    res.send('ok');
                }
            });
        }

        fs.unlink(req.file.path, function(err) {
            if (err)
                console.log("Unable to remove temp file: " + err);
        });
    });
};

exports.userImage = function(req, res) {

    db.findUserImage(req.params.userName, function(err, image) {

        if (err)
        {
            console.log(err);
            res.status(500).send(err);
        }
        else
        {
            if (image)
            {
                res.type(image.mime_type);
                res.send(image.image_data);
            }
            else
            {
                console.log('User image is null for user name ' + req.params.userName);
                res.status(500).send("Image is null.");
            }
        }
    });
    
};

// app.post('/updateProfile')
exports.updateProfile = function(req, res) {
    var profileUser = req.body.profileUser;
    var phone = profileUser.phone.replace(/[^0-9]/g, '');
    profileUser.phone = '(' + phone.substring(0,3) + ') ' + phone.substring(3,6) + '-' + phone.substring(6);
    
    db.updateUser(profileUser, function(err, result) {
        if (err)
        {
            res.status(500).send(err);
        }
        else
        {
            res.send('ok');
        }
    });
};
