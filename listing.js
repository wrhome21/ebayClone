var path = require('path');
var db = require('./db.js');

var data = [{id:1, title:'cat'}, {id:2, title:'dog'}];
var count = 2;

// app.get('/listings')
exports.listings = function(req, res) {

    db.findActiveListings(function(err,result) {

        if (err)
        {
            res.send("Unable to find active listings: " + err);
        }
        else
        {
            res.send(result);
        }
    }); 
};

exports.findValidBids = function(req, res) {

    db.findValidBids(req.params.listingId, function(err, bids) {
        if (err) res.status(500).send(err);
        else res.send(bids);
    });
};

exports.makeBid = function(req, res) {

    db.createBid({ 
        listingId: req.body.listingId, 
        userName: req.body.userName,
        amount: req.body.amount,
        bidDate: req.body.bidDate
    }, function(err, bidId) {
        if (err) res.status(500).send(err)
        else res.send('ok');
    });
};

exports.purchaseListing = function(req, res) {

    db.purchaseListing(req.body, function(err, listingId) {

        if (err)
        {
            console.log(err);
            res.status(500).send(err);
        }
        else
        {
            res.send('ok');
        }
    });
};

exports.listingImage = function(req, res) {

    db.findListingImage(req.params.listingImageId, function(err, image) {

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
                console.log('Listing image ' + req.params.listingImageId + ' not found');
                res.status(500).send("Image is null.");
            }
        }
    });
};
 

// app.get('/listing/:listing')
exports.listing = function(req, res) {

    db.findListingByListingId(req.params.listingId, function(err, listing) {
        if (err)
        {
            res.status(500).send(err);
        }
        else
        {
            res.send(listing);
        }
    });
};

exports.getKeywords = function(req, res){
    db.getAllKeywords(function(err,keywords){
        if(err){
            console.log(err);
            res.status.send(500);
        }else{
            res.send(keywords);
        }
    });
}

// app.post('/search')
exports.search = function(req, res) {
    var srchTerm = req.body.srchTerm;
    var srchResult = [];

    if (srchTerm) {
        db.findActiveListingsByKeyword(srchTerm, function(err,listing){
            if(err){
                console.log(err);
                res.status.send(500);
            }else{
                for(var i in listing){
                    srchResult.push(listing[i]);
                }
                
                //srchResult.push(listing);
                res.send(srchResult);
            }
        });
    }
    else {
          //added default search capabilities --- search
        db.findActiveListings(function (err, result){
            if (err)
            {
                res.send("Unable to find active listings: " + err);
            }
            else
            {
                srchResult = result;
                res.send(srchResult);
            }
        });
    }  
};

// app.post('/newListing')
exports.newListing = function(req, res) {

    var data = req.body.newListing;
 
    db.createListing(data, function (err, listingId){
        if(err){
            res.status(500).send(err);
        }else{
             res.send(JSON.stringify(listingId));
        }
    }); 
};

// app.post('/updateListing')
exports.updateListing = function(req, res) {

   db.updateListing(req.body, function (err, result) {
        if(err){
            res.status(500).send(err);
        }else{
        
                res.send(result);
            }
        });
};

// app.post('/addListingKeywords')
exports.addListingKeywords = function(req, res) {

    var listingId = req.body.listingId;
    console.log('listingId: ' + listingId);
    var keywords = req.body.keywords;
    console.log('keywords: ', keywords);

   db.addListingKeywords(listingId, keywords, function (err, count) {
        if(err){
            res.status(500).send(err);
        }else{
        
                res.send(JSON.stringify(count));
            }
        });
};

exports.removeListingKeyword = function(req, res) {

    db.removeListingKeyword(req.body.listingId, req.body.keyword, function(err) {
        if (err) {
            res.status(500).end();
        }
        else
        {
            res.send('ok');
        }
    });
};

// app.post('/listings')
exports.filterOn = function (req, res){    
    var stringVersion =  req.body.filterOnTerm;
    db.findActiveListingsByKeyword(stringVersion, function (err, listing){
        if(err){
            res.status(500).send(err);
        }else{
            res.send(listing);
        }
    });
};

exports.filterRemove = function (req, res){
    
    db.findActiveWhereMissingKeyword(req.params.keyword, function(err, listing){
        if(err){
            res.status(500).send(err);
        }else{
            res.send(listing);
        }
    });
}