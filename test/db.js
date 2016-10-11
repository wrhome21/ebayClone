
var dbi = require('../db');
var assert = require('assert');

describe('Testing DbInterface', function() {

    before(function() {
        dbi.open(null, true);
    });

    after(function() {
        dbi.close();
    });

    it('can create listing with defaults', function(done) {

        dbi.createListing({
            user: {
                userName: 'cvaughan'
            },
            title: 'Test Listing',
            buyItNowPrice: 14.95
        }, function(err, id) {
            if (err) done(err);
            else
            {
                if (!id) done(new Error("ID is not set"));
                else done();
            }
        });
    });

    it('can create listing with values', function(done) {

        var dt = new Date();

       dbi.createListing({
            user: {
                userName: 'cvaughan'
            },
            title: 'Test Listing',
            buyItNowPrice: 14.95,
            minBid: 5.00,
            description: 'Could be some very long text describing the item',
            startDate: new Date(dt.getTime() - (24 * 60 * 60000 * 4)),
            endDate: new Date(dt.getTime() + (24 * 60 * 60000 * 4)),
            sold: false
        }, function(err, id) {
            if (err) done(err);
            else
            {
                if (!id) done(new Error("ID is not set"));
                else done();
            }
        });
    });

    it('can create test user', function(done) {

        dbi.createUser({
            userName: 'Test' + (new Date()).getTime(),
            password: 'tiger',
            firstName: "Test",
            lastName: 'User',
            address: {
                street1: '100 Main St',
                city: 'Baltimore',
                state: 'MD',
                zipCode: '21201'
            },
            phone: '(410) 555-1212',
            email: 'TestUser@ssa.gov'
        }, function(err, cnt) {
            if (err)
            {
                done(err);
            }
            else
            {
                if (cnt !== 1)
                {
                    done(new Error('Received %s count: expected 1', cnt));
                }
                else
                {
                    done();
                }
            }
        });
    });

    it('can get active listings', function(done) {

        dbi.findActiveListings(function(err, listings) {
            if (err)
            {
                done(err);
            }
            else
            {
                done();
            }
        });
    });

    it('can update user', function(done) {

        dbi.authenticateUser({userName: 'jku', password: 'tiger'}, function(err, user) {
            if (err) done(err);
            else
            {
                user.middleName = 'X' + (new Date()).getTime();
                dbi.updateUser(user, function(err, cnt) {
                    if (err)
                    {
                        done(err);
                    }
                    else
                    {
                        done();
                    }
                });
            }
        });
    });

    it('can authenticate', function(done) {

        dbi.authenticateUser({userName: 'cvaughan', password: 'tiger'}, function(err, user) {

            if (err) done(err);
            else {
                done();
            }

        });
    });

});