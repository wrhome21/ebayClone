module.exports = {

    userToDatabaseMapping: {
        userName: "$userName",
        password: "$password",
        firstName: "$firstName",
        middleName: "$middleName",
        lastName: "$lastName",
        "address.street1": "$street1",
        "address.street2": "$street2",
        "address.city": "$city",
        "address.state": "$state",
        "address.zipCode": "$zipCode",
        phone: "$phone",
        email: "$email"
    },

    userToBusinessMapping: {
        user_name: "userName",
        password: "password",
        first_name: "firstName",
        middle_name: "middleName",
        last_name: "lastName",
        street1: "address.street1",
        street2: "address.street2",
        city: "address.city",
        state: "address.state",
        zip_code: "address.zipCode",
        phone: "phone",
        email: "email",
        user_image_id: "userImageId"
    },

    purchaseToDatabaseMapping: {
        listingId: '$listingId',
        userName: '$userName',
        amount: '$amount',
        purchaseDate: '$purchaseDate',
        'billing.name': '$billingName',
        'billing.street1': '$billingStreet1',
        'billing.street2': '$billingStreet2',
        'billing.city': '$billingCity',
        'billing.state': '$billingState',
        'billing.zipCode': '$billingZipCode',
        'shipping.name': '$shippingName',
        'shipping.street1': '$shippingStreet1',
        'shipping.street2': '$shippingStreet2',
        'shipping.city': '$shippingCity',
        'shipping.state': '$shippingState',
        'shipping.zipCode': '$shippingZipCode',
        creditCardNumber: '$creditCardNumber',
        creditCardExpirationDate: '$creditCardExpirationDate',
        creditCardValidationCode: '$creditCardValidationCode',
        creditCardType: '$creditCardType'
    },

    purchaseToBusinessMapping: {
        purchase_id: 'purchaseId',
        listing_id: 'listingId',
        user_name: 'userName',
        amount: 'amount',
        purchase_date: {
            key: 'purchaseDate',
            transform: function(val) {
                return (val ? new Date(val) : null);
            }
        },
        billing_name: 'billing.name',
        billing_street1: 'billing.street1',
        billing_street2: 'billing.street2',
        billing_city: 'billing.city',
        billing_state: 'billing.state',
        billing_zip_code: 'billing.zipCode',
        shipping_name: 'shipping.name',
        shipping_street1: 'shipping.street1',
        shipping_street2: 'shipping.street2',
        shipping_city: 'shipping.city',
        shipping_state: 'shipping.state',
        shipping_zip_code: 'shipping.zipCode',
        credit_card_number: 'creditCardNumber',
        credit_card_expiration_date: 'creditCardExpirationDate',
        credit_card_validation_code: 'creditCardValidationCode',
        credit_card_type: 'creditCardType' 
    },
    
    /* NOTE: Had to add start and end date transforms because 
     * database defaults were failing when params were undefined 
     * or null 
     */
    listingToDatabaseMapping: {
        listingId: '$listingId',
        title: '$title',
        description: '$description',
        buyItNowPrice: '$buyItNowPrice',
        minBid: '$minBid?',
        startDate: {
            key: '$startDate',
            transform: function(val) {
                
                if (!val)
                {
                    val = new Date();
                }

                if (!(val instanceof Date))
                {
                    val = new Date(val);
                }

                return  val.getFullYear() + '-' + 
                        (val.getMonth() < 9 ? '0' : '') +
                        (val.getMonth() + 1) + '-' +
                        (val.getDate() < 10 ? '0' : '') + 
                        val.getDate() + ' ' +
                        (val.getHours() < 10 ? '0' : '') + 
                        val.getHours() + ':' +
                        (val.getMinutes() < 10 ? '0' : '') + 
                        val.getMinutes() + ':' +
                        (val.getSeconds() < 10 ? '0' : '') + 
                        val.getSeconds();  
            }
        },
        endDate: {
            key: '$endDate',
            transform: function(val) {
                
                if (!val)
                {
                    val = new Date( (new Date()).getTime() + (24 * 5 * 60 * 60 * 1000) );
                }

                if (!(val instanceof Date))
                {
                    val = new Date(val);
                }

                return  val.getFullYear() + '-' + 
                        (val.getMonth() < 9 ? '0' : '') +
                        (val.getMonth() + 1) + '-' +
                        (val.getDate() < 10 ? '0' : '') + 
                        val.getDate() + ' ' +
                        (val.getHours() < 10 ? '0' : '') + 
                        val.getHours() + ':' +
                        (val.getMinutes() < 10 ? '0' : '') + 
                        val.getMinutes() + ':' +
                        (val.getSeconds() < 10 ? '0' : '') + 
                        val.getSeconds();  
            }
        },
        sold: {
            key: '$sold',
            transform: function(val) {
                if (val) return 1;
                else return 0;
            }
        },
        "user.userName": '$userName'
    },

    listingToBusinessMapping: {
        listing_id: 'listingId', 
        title: 'title', 
        description: 'description', 
        buy_it_now_price: 'buyItNowPrice', 
        min_bid: 'minBid', 
        start_date: {
            key: 'startDate',
            transform: function(val) {
                return val ? new Date(val) : null;
            }
        },
        end_date: {
            key: 'endDate',
            transform: function(val) {
                return val ? new Date(val) : null;
            }    
        }, 
        sold: {
            key: 'sold',
            transform: function(val) {
                return val === 1;
            }
        }, 
        user_name: 'user.userName', 
        first_name: 'user.firstName', 
        middle_name: 'user.middleName', 
        last_name: 'user.lastName',
        user_image_id: 'user.userImageId',
        keywords: {
            key: "keywords",
            transform: function(val) {
                if (val)
                {
                    return val.split(',');
                }
                else
                {
                    return [];
                }
            }
        }, image_ids: {
            key: "imageIds",
            transform: function(val) {
                if (val)
                {
                    return val.split(',');
                }
                else
                {
                    return [];
                }
            }
        },
        max_bid: "maxBid"
    }

};
