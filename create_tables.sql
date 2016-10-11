/*
 * USER Table
 */
CREATE TABLE IF NOT EXISTS user
(
    user_name VARCHAR(20) NOT NULL PRIMARY KEY,
    password VARCHAR(20) NOT NULL,
    first_name VARCHAR(20) NOT NULL,
    middle_name VARCHAR(20),
    last_name VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    street1 VARCHAR(255) NOT NULL,
    street2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    phone VARCHAR(14) NOT NULL
);

/*
 * USER IMAGE Table
 */
CREATE TABLE IF NOT EXISTS user_image
(
    user_image_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_name VARCHAR(20) NOT NULL,
    image_data BLOB NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_name)
        REFERENCES user (user_name)
);

/*
 * LISTING Table
 */
CREATE TABLE IF NOT EXISTS listing
(
    listing_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_name VARCHAR(20) NOT NULL,
    title VARCHAR(40) NOT NULL,
    description TEXT,
    buy_it_now_price NUMERIC,
    min_bid NUMERIC,
    start_date TIMESTAMP NOT NULL DEFAULT (datetime('now', 'localtime')),
    end_date TIMESTAMP NOT NULL DEFAULT (datetime('now', '7 days', 'localtime')),
    sold INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_name)
        REFERENCES user (user_name)
);

/*
 * LISTING KEYWORD Table
 */
CREATE TABLE IF NOT EXISTS listing_keyword
(
    listing_id INTEGER NOT NULL,
    keyword VARCHAR(20) NOT NULL,
    FOREIGN KEY (listing_id)
        REFERENCES listing (listing_id)
);

/*
 * LISTING KEYWORD INDEX
 * Should be optimized for quick retrieval of listings by keyword
 */
CREATE UNIQUE INDEX IF NOT EXISTS listing_keyword_idx
ON listing_keyword (keyword, listing_id);

/*
 * LISTING IMAGE Table
 */
CREATE TABLE IF NOT EXISTS listing_image
(
    listing_image_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    image_data BLOB NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    FOREIGN KEY (listing_id)
        REFERENCES listing (listing_id)
);

/**
 * Purchase table
 */ 
CREATE TABLE IF NOT EXISTS purchase
(
    purchase_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    user_name VARCHAR(20) NOT NULL,
    amount NUMERIC NOT NULL,
    purchase_date TIMESTAMP NOT NULL DEFAULT (datetime('now', 'localtime')),
    billing_name VARCHAR(80) NOT NULL,
    billing_street1 VARCHAR(255) NOT NULL,
    billing_street2 VARCHAR(255),
    billing_city VARCHAR(255) NOT NULL,
    billing_state CHAR(2) NOT NULL,
    billing_zip_code VARCHAR(10) NOT NULL,
    shipping_name VARCHAR(80) NOT NULL,
    shipping_street1 VARCHAR(255) NOT NULL,
    shipping_street2 VARCHAR(255),
    shipping_city VARCHAR(255) NOT NULL,
    shipping_state CHAR(2) NOT NULL,
    shipping_zip_code VARCHAR(10) NOT NULL,
    credit_card_number VARCHAR(32) NOT NULL,
    credit_card_expiration_date CHAR(4) NOT NULL,
    credit_card_validation_code VARCHAR(4) NOT NULL,
    credit_card_type CHAR(1) NOT NULL,
    FOREIGN KEY (listing_id) REFERENCES listing (listing_id),
    FOREIGN KEY (user_name) REFERENCES user (user_name)
);

CREATE TABLE IF NOT EXISTS bid
(
    bid_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    amount NUMERIC NOT NULL,
    user_name VARCHAR(20) NOT NULL,
    listing_id INTEGER NOT NULL,
    bid_date TIMESTAMP DEFAULT(datetime('now', 'localtime')),
    FOREIGN KEY (listing_id) REFERENCES listing (listing_id),
    FOREIGN KEY (user_name) REFERENCES user (user_name)
);