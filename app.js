// Imports
var path = require('path');
var db = require('./db.js');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

// import sub modules
var login = require('./login');
var register = require('./register');
var listing = require('./listing');
var profile = require('./profile');
var fileUpload = require('./fileUpload');

// Port constant
const port = 3001;

var app = express();

// Set up resources directory to server static files
app.use(express.static('resources'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(session({
    secret: 'currentUser',
    resave: false,
    saveUninitialized: false
}));

// DB configuration
db.open();
app.set('db', db);


var checkAuth = function(req, res, next) {
    if (!req.session.currentUser) {
        res.sendFile(path.join(__dirname + '/login.html'));
    } else {
        next();
    }
};

// General
app.get('/', checkAuth, function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Login
app.post('/login', login.login);
app.get('/logout', checkAuth, login.logout);

// Register
app.get('/register', register.display);
app.post('/register', register.registerUser);

app.get('/currentUser', checkAuth, function(req, res) {
    res.send(req.session.currentUser);
});

// Listings
app.get('/listings', checkAuth, listing.listings);
app.post('/search', checkAuth, listing.search);
app.post('/listing', checkAuth, listing.filterOn);
app.post('/newListing', checkAuth, listing.newListing);
app.post('/updateListing', checkAuth, listing.updateListing);
app.get('/listing/:listingId', checkAuth, listing.listing);
app.get('/listingImage/:listingImageId', checkAuth, listing.listingImage);
app.get('listing/removeFilter/:keyword', checkAuth, listing.filterRemove);
app.post('/buyIt', checkAuth, listing.purchaseListing);
app.post('/makeBid', checkAuth, listing.makeBid);
app.get('/bids/:listingId', checkAuth, listing.findValidBids);
app.post('/addListingKeywords', checkAuth, listing.addListingKeywords);
app.post('/removeKeyword', checkAuth, listing.removeListingKeyword);

// Profile
app.get('/profile/:userName', checkAuth, profile.profile);
app.post('/updateProfile', checkAuth, profile.updateProfile);
app.get('/userImage/:userName', checkAuth, profile.userImage);
app.post('/userImage', checkAuth, upload.single('file'), profile.postUserImage);
app.get('/getSellerInfo/:sellerId', checkAuth, profile.getSellerInfo);

// File Upload
app.post('/upload', checkAuth, upload.single('file'), fileUpload.upload);
 
// Listener
var server = app.listen(port, function () {
    console.log('u*Pay listening on port ' + port + '!');
});


// Fires when node is terminated?
process.on('SIGTERM', function () {
    server.close(function () {
        dao.close();
    });
});
