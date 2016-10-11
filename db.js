var fs = require('fs');
var mappings = require('./db-mapping');
var objectMapper = require('object-mapper');
var sqlite3 = require("sqlite3");

/**
 * Database interface class
 */
function DbInterface()
{

}

DbInterface.DB_FILE_NAME = 'upay.sqlite';
/* LISTING TABLE SQL */
DbInterface.CREATE_LISTING_SQL = `INSERT INTO listing 
                                  (title, description, user_name, buy_it_now_price, min_bid, start_date, end_date, sold) 
                                  VALUES ($title, $description, $userName, $buyItNowPrice, $minBid, $startDate, $endDate, $sold)`;
DbInterface.UPDATE_LISTING_SQL = `UPDATE listing 
                                  SET title = $title, 
                                      description = $description, 
                                      buy_it_now_price = $buyItNowPrice, 
                                      min_bid = $minBid, 
                                      start_date = $startDate, 
                                      end_date = $endDate
                                  WHERE listing_id = $listingId`;
DbInterface.SELECT_LISTING_SQL = `SELECT DISTINCT l.listing_id, title, description, buy_it_now_price, min_bid, start_date, 
                                         end_date, sold, u.user_name, u.first_name, u.middle_name, u.last_name, 
                                         (SELECT max(user_image_id) FROM user_image WHERE user_name = u.user_name AND active = 1) as user_image_id,
                                         (SELECT group_concat(keyword) FROM listing_keyword WHERE listing_id = l.listing_id) AS keywords,
                                         (SELECT group_concat(listing_image_id) FROM listing_image WHERE listing_id = l.listing_id) AS image_ids,
                                         (SELECT max(amount) FROM bid WHERE listing_id = l.listing_id AND bid_date BETWEEN l.start_date AND l.end_date AND amount >= l.min_bid) AS max_bid
                                  FROM listing AS l
                                  INNER JOIN user AS u ON l.user_name = u.user_name `;
DbInterface.FIND_LISTING_BY_LISTING_ID_SQL = DbInterface.SELECT_LISTING_SQL + 
                                             `WHERE l.listing_id = ?`;
DbInterface.FIND_ACTIVE_LISTINGS_SQL = DbInterface.SELECT_LISTING_SQL +
                                       `WHERE sold = 0 AND 
                                              start_date <= current_timestamp AND 
                                              end_date >= current_timestamp`;
DbInterface.FIND_ACTIVE_LISTINGS_BY_KEYWORD_SQL = DbInterface.SELECT_LISTING_SQL +
                                                  `LEFT OUTER JOIN listing_keyword AS k ON l.listing_id = k.listing_id 
                                                  WHERE sold = 0 AND 
                                                         start_date <= current_timestamp AND 
                                                         end_date >= current_timestamp AND
                                                         (k.keyword LIKE ? OR l.title like ? OR l.description like ?)`;
DbInterface.CREATE_LISTING_IMAGE_PS = "INSERT INTO listing_image (listing_id, image_data, mime_type) VALUES ($listingId, $imageData, $mimeType)";
DbInterface.MARK_LISTING_SOLD_SQL = "UPDATE listing SET sold = 1 WHERE listing_id = ?";
                    
/* LISTING KEYWORD TABLE SQL */
DbInterface.CREATE_LISTING_KEYWORD_SQL = `INSERT INTO listing_keyword (listing_id, keyword) VALUES (?, ?)`;
DbInterface.DELETE_LISTING_KEYWORD_SQL = `DELETE FROM listing_keyword WHERE listing_id = ? AND keyword = ?`;

/* PURCHASE TABLE SQL */
DbInterface.CREATE_PURCHASE_SQL = `INSERT INTO purchase 
                                   (user_name, listing_id, amount, purchase_date, billing_name, billing_street1,
                                    billing_street2, billing_city, billing_state, billing_zip_code, shipping_name,
                                    shipping_street1, shipping_street2, shipping_city, shipping_state,
                                    shipping_zip_code, credit_card_number, credit_card_expiration_date, 
                                    credit_card_validation_code, credit_card_type) 
                                   VALUES ($userName, $listingId, $amount, $purchaseDate, $billingName, $billingStreet1,
                                           $billingStreet2, $billingCity, $billingState, $billingZipCode, $shippingName,
                                           $shippingStreet1, $shippingStreet2, $shippingCity, $shippingState, 
                                           $shippingZipCode, $creditCardNumber, $creditCardExpirationDate, 
                                           $creditCardValidationCode, $creditCardType)`;

DbInterface.SELECT_PURCHASE_SQL = `SELECT purchase_id, user_name, listing_id, amount, purchase_date, billing_name, billing_street1,
                                          billing_street2, billing_city, billing_state, billing_zip_code, shipping_name,
                                          shipping_street1, shipping_street2, shipping_city, shipping_state, shipping_zip_code,
                                          credit_card_number, credit_card_expiration_date, credit_card_type, credit_card_validation_code
                                   FROM purchase `;

/* IMAGE SQL */
DbInterface.FIND_LISTING_IMAGE_BY_LISTING_IMAGE_ID_SQL = "SELECT mime_type, image_data FROM listing_image WHERE listing_image_id = ?";
DbInterface.FIND_USER_IMAGE_BY_USER_NAME_SQL = `SELECT mime_type, image_data 
                                                FROM user_image 
                                                WHERE user_name = ? AND active = 1 
                                                ORDER BY user_image_id DESC 
                                                LIMIT 1`;

DbInterface.INSERT_USER_IMAGE_SQL = `INSERT INTO user_image 
                                     (user_name, image_data, mime_type, active) 
                                     VALUES ($userName, $imageData, $mimeType, 1);`
DbInterface.MAKE_LASTEST_IMAGE_ACTIVE_SQL = `UPDATE user_image
                                             SET active = 0
                                             WHERE user_name = $userName AND
                                                   user_image_id != (SELECT max(user_image_id)
                                                                     FROM user_image
                                                                     WHERE user_name = $userName);`;

/* USER TABLE SQL */
DbInterface.CREATE_USER_SQL = `INSERT INTO user
                               (user_name, password, first_name, middle_name, last_name, email, street1, street2, city, state, zip_code, phone) 
                               VALUES ($userName, $password, $firstName, $middleName, $lastName, $email, $street1, $street2, $city, $state, $zipCode, $phone)`;
DbInterface.UPDATE_USER_SQL = `UPDATE user 
                               SET first_name = $firstName,
                                   middle_name = $middleName,
                                   last_name = $lastName,
                                   email = $email,
                                   street1 = $street1,
                                   street2 = $street2,
                                   city = $city,
                                   state = $state,
                                   zip_code = $zipCode,
                                   phone = $phone 
                               WHERE user_name = $userName`;
DbInterface.SELECT_USER_SQL = `SELECT user_name, first_name, middle_name, last_name, email, street1, street2, city, state, zip_code, phone, 
                                      (SELECT MAX(user_image_id) FROM user_image WHERE user_name = user.user_name AND active = 1) AS user_image_id
                               FROM user `;
DbInterface.AUTHENTICATE_USER_SQL = DbInterface.SELECT_USER_SQL + 
                                    `WHERE user_name = ? AND password = ?`;
DbInterface.FIND_USER_BY_USERNAME_SQL = DbInterface.SELECT_USER_SQL + 
                                    `WHERE user_name = ?`;
//fixed NOT --- search 
DbInterface.FIND_ACTIVE_LISTINGS_BY_KEYWORD_SQL_NOT_EQUAL = DbInterface.SELECT_LISTING_SQL + 
                                                  `WHERE sold = 0 AND 
                                                         start_date <= current_timestamp AND 
                                                         end_date >= current_timestamp AND
                                                         listing_id IN (SELECT listing_id 
                                                                        FROM listing_keyword 
                                                                        WHERE keyword NOT IN (?))`;

/* BID TABLE SQL */
DbInterface.FIND_VALID_BIDS_SQL = `SELECT b.bid_id, b.amount, b.user_name, b.bid_date,
                                          u.first_name, u.middle_name, u.last_name 
                                   FROM bid AS b
                                   INNER JOIN user AS u
                                        ON b.user_name = u.user_name
                                   INNER JOIN listing AS l
                                        ON b.listing_id = l.listing_id
                                   WHERE b.listing_id = ? AND
                                         b.bid_date BETWEEN l.start_date AND l.end_date AND
                                         b.amount >= l.min_bid
                                   ORDER BY b.bid_amound DESC`;

DbInterface.CREATE_BID_SQL = `INSERT INTO bid 
                              (amount, user_name, bid_date, listing_id)
                              VALUES (?, ?, ?, ?)`;


/**
 * Open the database
 */
DbInterface.prototype.open = function(dbFileName, update) {

    if (this.db)
    {
        throw "Database is already open";
    }

    if (!dbFileName)
    {
        dbFileName = DbInterface.DB_FILE_NAME;
    }

    this.db = new sqlite3.Database(dbFileName);

    if (update)
    {
        var self = this;

        var data = fs.readFileSync('create_tables.sql', 'utf8');
        
        self.db.serialize(function() {
            self.db.exec(data, function(err) {

                if (err)
                {
                    console.log("Unable to update database: " + err);
                }
            });
        });
    }
};

/**
 * Close the database
 */
DbInterface.prototype.close = function() {
    if (!this.db)
    {
        throw "No database is open";
    }

    this.db.close(function(err) {
        if (err)
        {
            console.log("Unable to close database: " + err);
        }
        else
        {
            delete this.db;
        }
    });
};

/**
 * Create a new bid
 */
DbInterface.prototype.createBid = function(bid, callback) {

    var self = this;

    this.db.serialize(function() {

        var stmt = self.db.prepare(DbInterface.CREATE_BID_SQL);

        if (bid.amount && typeof(bid.amount) === 'string')
        {
            bid.amount = Number(bid.amount.replace(/[^0-9\.]+/g,""));
        }

        stmt.run(bid.amount, bid.userName, bid.bidDate, bid.listingId, function(err) {
            if (err)
            {
                callback("Unable to place bid: " + err);
            }
            else
            {
                callback(null, this.lastID);
            }
        })

        stmt.finalize();
    });

};

/**
 * Get all bids
 */
DbInterface.prototype.findValidBids = function(listingId, callback) {

    this.db.all(DbInterface.FIND_VALID_BIDS_SQL, listingId, function(err, rows) {

        if (err)
        {
            callback('Unable to find valid bids: ' + err);
        }
        else
        {
            var bids = [];

            for (var row of rows)
            {
                bids.push({
                    bidId: row.bid_id,
                    bidAmount: row.amount,
                    listingId: row.listing_id,
                    bidDate: new Date(row.bid_date),
                    user: {
                        userName: row.user_name,
                        firstName: row.first_name,
                        middleName: row.middle_name,
                        lastName: row.last_name
                    }
                })
            }
        }
    });
};

/**
 * Create a new listing
 * @param listing
 * @callback (err, listingId)
 */
DbInterface.prototype.createListing = function(listing, callback) {

    var params = objectMapper(listing, mappings.listingToDatabaseMapping);

    this.db.run(DbInterface.CREATE_LISTING_SQL, params, function(err) {

        if (err)
        {
            callback("Unable to create listing: " + err);
        }
        else
        {
            callback(null, this.lastID);
        }
    });
};

DbInterface.prototype.updateListing = function(listing, callback) {

    var params = objectMapper(listing, mappings.listingToDatabaseMapping);

    delete params.$sold;
    delete params.$userName;

    this.db.run(DbInterface.UPDATE_LISTING_SQL, params, function(err) {
        if (err)
        {
            callback("Unable to update listing: " + err);
        }
        else
        {
            if (this.changes === 1)
            {
                callback(null);
            }
            else if (this.changes === 0)
            {
                callback("Unable to update listing: no rows were affected");
            }
            else
            {
                callback("Multiple listings were affected by this update!");
            }
        }    
    });
};

/**
 * Record a purchase
 */
DbInterface.prototype.purchaseListing = function(purchase, callback) {

    var self = this;

    this.db.serialize(function() {

        var stmt = self.db.prepare(DbInterface.CREATE_PURCHASE_SQL);

        var params = objectMapper(purchase, mappings.purchaseToDatabaseMapping);

        stmt.run(params, function(err) {

            if (err)
            {
                callback("Unable to insert purchase: " + err);
            }
            else
            {
                var lid = this.lastID;

                var stmt2 = self.db.prepare(DbInterface.MARK_LISTING_SOLD_SQL);

                stmt2.run(purchase.listingId, function(err) {

                    if (err)
                    {
                        console.log("Unable to mark listing " + purchase.listingId + " sold: " + err);
                    }
                    
                    callback(null, lid);
                });

                stmt2.finalize();
            }
        });

        stmt.finalize();
    });
};

/**
 * Find all active listings
 * @param callback (err, listings)
 */
DbInterface.prototype.findActiveListings = function(callback) {

    this.db.all(DbInterface.FIND_ACTIVE_LISTINGS_SQL, function(err, rows) {

        if (err)
        {
            callback("Unable to find active listings: " + err);
        }
        else
        {
            var listings = [];

            for (var row of rows)
            {
                listings.push(objectMapper(row, mappings.listingToBusinessMapping));
            }

            callback(null, listings);
        }
    });
};

DbInterface.prototype.findListingImage = function(listingImageId, callback) {

    this.db.get(DbInterface.FIND_LISTING_IMAGE_BY_LISTING_IMAGE_ID_SQL, listingImageId, function(err, row) {
        if (err || !row)
        {
            callback("Unable to retrieve image for listing image ID " + listingImageId + ": " + err);
        }
        else
        {
            callback(null, row);
        }
    });
}

DbInterface.prototype.findUserImage = function(userName, callback) {

    this.db.get(DbInterface.FIND_USER_IMAGE_BY_USER_NAME_SQL, userName, function(err, row) {
        if (err)
        {
            callback("Unable to retrieve image for userName \"" + userName + "\": " + err);
        }
        else
        {
            if (row)
            {
                callback(null, row);
            }
            else
            {
                callback("No image found for userName \"" + userName + "\"");
            }
        }
    });
};

/**
 * Find the specific listing
 * @param listingId
 * @param callback (err, listing)
 */
DbInterface.prototype.findListingByListingId = function(listingId, callback) {

    this.db.get(DbInterface.FIND_LISTING_BY_LISTING_ID_SQL, listingId, function(err, row) {
        if (err)
        {
            callback("Unable to find listing with ID " + listingId + ": " + err);
        }
        else
        {
            callback(null, objectMapper(row, mappings.listingToBusinessMapping));
        }
    });
};

/**
 * Find all active listings with the specified keywords
 * @param keywords Array
 * @param callback (err, listings)
 */
DbInterface.prototype.findActiveListingsByKeyword = function(keywords, callback) {
    
    var keywordsLike = '%'+keywords+'%';
    this.db.all(DbInterface.FIND_ACTIVE_LISTINGS_BY_KEYWORD_SQL, keywordsLike, keywordsLike, keywordsLike, function(err, rows) {

        if (err)
        {
            callback("Unable to find active listings for keywords: " + keywords + ": " + err);
        }
        else
        {
            var listings = [];

            for (var row of rows)
            {
                listings.push(objectMapper(row, mappings.listingToBusinessMapping));
            }
            

            callback(null, listings);
        }
    });
};

DbInterface.prototype.removeListingKeyword = function(listingId, keyword, callback) {

    this.db.run(DbInterface.DELETE_LISTING_KEYWORD_SQL, listingId, keyword, function(err) {
        if (err)
        {
            callback("Unable to delete keyword '" + keyword + "' for listing '" + listingId + "': " + err);
        }
        else
        {
            callback(null);
        }
    });
};

/**
 * Add keywords to the listing
 * @param listingId 
 * @param keywords Array
 * @param callback (err, count (# of keywords added))
 */
DbInterface.prototype.addListingKeywords = function(listingId, keywords, callback) {
    
    if (keywords && keywords.length)
    {
        var self = this;

        // TODO Put this into a transaction
        this.db.serialize(function() {

            var stmt = self.db.prepare(DbInterface.CREATE_LISTING_KEYWORD_SQL);
            var ps  = [];
            var cnt = 0;
            
            for (var keyword of keywords)
            {
                ps.push(new Promise(function(resolve, reject) {

                    stmt.run(listingId, keyword, function(err) {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            cnt++;
                            resolve();
                        }
                    })
                }));
            }

            Promise.all(ps).then(function() {
                callback(null, cnt);

            }, function(err) {
                callback(err, cnt);
            });

            stmt.finalize();            
        });
    }
    else
    {
        callback(null, 0);
    }
};

/**
 * Create a new user
 * @param user User object
 * @param callback (err, count (0 or 1))
 */
DbInterface.prototype.createUser = function(user, callback) {

    var self = this;

    this.db.serialize(function() {
        var stmt = self.db.prepare(DbInterface.CREATE_USER_SQL);
        
        stmt.run(objectMapper(user, mappings.userToDatabaseMapping), function(err) {
                
                if (err)
                {
                    callback("Unable to create user: " + err);
                }
                else
                {
                    callback(null, this.changes);
                }
        });

        stmt.finalize();
    });

};

/**
 * Update a user
 * @param user User with new values
 * @param callback (err, numRows (1 or 0))
 */
DbInterface.prototype.updateUser = function(user, callback) {
    
    var self = this;

    this.db.serialize(function() {
        
        var stmt = self.db.prepare(DbInterface.UPDATE_USER_SQL);

        stmt.run(objectMapper(user, mappings.userToDatabaseMapping), function(err) {

            if (err)
            {
                callback("Unable to update user: " + err, 0);
            }
            else
            {
                if (this.changes == 1)
                {
                    callback(null, 1);
                }
                else
                {
                    callback("There was an error updating the user: expected 1 modified row, but found " + this.changes, this.changes);
                }
            }
        });


    });

};

/**
 * Authenticate a user
 * @param credentials { userName: <value>, password: <value> }
 * @param callback (err, user)
 */
DbInterface.prototype.authenticateUser = function(credentials, callback) {

    this.db.get(DbInterface.AUTHENTICATE_USER_SQL, credentials.userName, credentials.password, function(err, row) {

        if (err)
        {
            callback('Unable to authenticate User: ' + err, null);
        }
        else 
        {
            if (row == null)
            {
                callback('Invalid user name or password', null);
            }
            else
            {
                callback(null, objectMapper(row, mappings.userToBusinessMapping));
            }
        }
    });
};

/**
 * Insert the user image (makes it the current user image)
 */
DbInterface.prototype.createUserImage = function(userName, imageData, mimeType, callback) {

    var params = {
        $imageData: imageData,
        $mimeType: mimeType,
        $userName: userName
    };

    var self = this;

    this.db.run(DbInterface.INSERT_USER_IMAGE_SQL, params, function(err) {

        if (err)
        {
            callback("Unable to insert user image: " + err);
        }
        else
        {
            var id = this.lastID;

            delete params.$imageData;
            delete params.$mimeType;

            self.db.run(DbInterface.MAKE_LASTEST_IMAGE_ACTIVE_SQL, params, function(err) {

                if (err)
                {
                    // This is a transactional issue - we still want to return the new ID in
                    // this case.
                    console.log("Unable to deactivate old user images: " + err);
                }

                callback(null, id);
            });
        }
    });
};


/**
 * Create a new listing image
 * @param imageFile
 * @param callback (err, count (0 or 1))
 */
DbInterface.prototype.createListingImage = function(imageFile, callback) {

    var self = this;

    this.db.serialize(function() {
        var stmt = self.db.prepare(DbInterface.CREATE_LISTING_IMAGE_PS);
        
        var params = {
            $listingId: imageFile.listingId,
            $imageData: imageFile.imageData,
            $mimeType: imageFile.mimeType
        };

        stmt.run(params, function(err) {
            if (err)
            {
                callback("Unable to save listing image: " + err);
            }
            else
            {
                callback(null, this.changes);
            }
        });
        stmt.finalize();
    });
};

/**
 * Find user by user name
 * @param credentials { userName: <value>, password: <value> }
 * @param callback (err, user)
 */
DbInterface.prototype.findUserByUsername = function(userName, callback) {

    this.db.get(DbInterface.FIND_USER_BY_USERNAME_SQL, userName, function(err, row) {

        if (err)
        {
            callback('Unable to find User by userName: ' + err, null);
        }
        else 
        {
            if (row == null)
            {
                callback('Invalid user name', null);
            }
            else
            {
                callback(null, objectMapper(row, mappings.userToBusinessMapping));
            }
        }
    });
};
/** 
 * Finds Active listing removing a possibility
 * @param keyword 
 * @param callback (err, row)
 */
DbInterface.prototype.findActiveWhereMissingKeyword = function(keyword, callback){
    this.db.all(DbInterface.FIND_ACTIVE_LISTINGS_BY_KEYWORD_SQL_NOT_EQUAL, keywords, function(err, rows) {

        if (err)
        {
            callback("Unable to find active listings that don't contain keywords: " + keywords + ": " + err);
        }
        else
        {
            var listings = [];

            for (var row of rows)
            {
                listings.push(objectMapper(row, mappings.listingToBusinessMapping));
            }
 
             return listings;
        }
    });
};



module.exports = new DbInterface();
