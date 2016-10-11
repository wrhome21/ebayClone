app.config(function ($routeProvider) {
    $routeProvider.when("/purchase/:listingId", {
        templateUrl: "templates/purchase.html",
        controller: "purchaseController",
        link: function($scope, element, attrs) {

        }
    });
});

app.directive('address', function () {
    return {
        restrict: 'E', // Element
        scope: {
            //@ reads the attribute value, = provides two-way binding, & works with functions
            address: '=address'        
        },
        templateUrl: '/templates/address-form.html'/*,
        controller: controllerFunction, //Embed a custom controller in the directive
        link: function ($scope, element, attrs) { } //DOM manipulation*/
    };
});

app.directive('paymentInfo', function() {
    return {
        restrict: 'E',
        scope: {
            paymentInfo: '=info'
        },
        templateUrl: '/templates/payment-info.html'
    }
});

app.directive('sellerInfo', function() {
    return {
        restrict: 'E',
        scope: {
            seller: '=info'
        },
        templateUrl: '/templates/seller-info.html'
    }
});

app.controller('purchaseController', function($scope, $http, $routeParams) {
    
    $scope.rejectFee = function() {
        alert("Too bad - this is u$Pay, not e*Bay!");
    };

    /**
     * Build user name from user object
     */
    $scope.buildUserName = function(user) {

        var n = '';
        var sp = '';

        if (user)
        {
            if (user.firstName)
            {
                n += user.firstName;
                sp = " ";
            }

            if (user.middleName)
            {
                n += sp + user.middleName;
                sp = " ";
            }

            if (user.lastName)
            {
                n += sp + user.lastName;
            }
        }

        return n;
    };

    $scope.displaySeller = function(sellerId) {
        
        $('#sellerInfoModal').modal('show');

        $http.get('/getSellerInfo/' + sellerId, {cache: false}).success(function(data) {

            $scope.seller = data;

            if (data.sinceDate && !(data.sinceDate instanceof Date))
            {
                data.sinceDate = new Date(data.sinceDate);
            }
        }).error(function(err) {
            alert("Unable to retrieve seller information for seller " + sellerId + ": " + err);
        });
    };

    /**
     * For now, compute shipping on price points
     */
    $scope.computeShipping = function(total) {

        if (total > 10000)
        {
            return 1000;
        }
        else if (total > 1000)
        {
            return 75;
        }
        else if (total > 100)
        {
            return 15;
        }
        else
        {
            return 4.99;
        }
    };


    $scope.sumBillingDetails = function(billingDetails) {

        var amt = 0;

        if (billingDetails)
        {
            for (var i = 0, l = billingDetails.length; i < l; i++)
            {
                amt += billingDetails[i].amount;
            }
        }

        return amt;
    };

    $scope.discourageQuit = function() {    

        $scope.alert = {
            title: "Oh Come On",
            text: "That's one sweet " + $scope.listing.title + "!  You know you want it.  Everyone will think you\'re soooo cool!",
            dismissals: ['Yeah, you\'re right!', 'I guess so', 'OK']
        };

        $('#purchaseModal').modal('show');
    };

    $scope.getUserImageSource = function() {

        if ($scope.listing && $scope.listing.user && $scope.listing.user.userImageId)
        {
            return '/userImage/' + $scope.listing.user.userName;
        }
        else
        {
            return 'http://placehold.it/50/55C1E7/fff';
        }
    };

    /**
     * Handle the next button click event
     */
    $scope.moveNext = function() {

        var nextStep;
        var currentStep = $('.nav-tabs li.active a').attr('id');

        // Get current step
        if (currentStep.substr(0, 7) === 'details')
        {
            // No action necessary
            nextStep = 'billing';
        }
        else if (currentStep.substr(0, 7) === 'billing')
        {

            nextStep = 'shipping';
        }
        else if (currentStep.substr(0, 8) === 'shipping')
        {

            nextStep = 'summary';
        }
        else if (currentStep.substr(0, 7) === 'summary')
        {

            nextStep = 'summary';
        }


        $('#' + nextStep + 'Tab').trigger('click');
     }; 

    $scope.$on('$viewContentLoaded', function (event) {

        setTimeout(function() {

            $('#ccNumber').payment('formatCardNumber');
            $('#ccExpires').payment('formatCardExpiry');
            $('#ccCcv').payment('formatCardCVC');

            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                var target = $(e.target).attr("href"); // activated tab

                if (target === '#summary')
                {
                    $('#nextButton').addClass('disabled').prop('disabled', true);
                }
                else
                {
                    $('#nextButton').removeClass('disabled').prop('disabled', false);
                }
            });

        }, 500);

        // Get the listing from the server to make sure you have the latest info
        $http.get("/listing/" + $routeParams.listingId, {cache: false}).success(function(data) {
            
            if (data.endDate && !(data.endDate instanceof Date))
            {
                data.endDate = new Date(data.endDate);
            }

            if (data.startDate && !(data.startDate instanceof Date))
            {
                data.startDate = new Date(data.startDate);
            }

            $scope.listing = data;

            var st = '';

            if (data && data.user && data.user.address && data.user.address.state)
            {
                st = '(' + data.user.address.state + ')';
            }

            // Billing details (order line items)
            //
            $scope.billingDetails = [{
                description: 'Buy It Now Price',
                amount: data.buyItNowPrice
            }, {
                description: 'Sales Tax ' + st,
                prompt: {
                    text: 'Why do I have to pay sales tax?',
                    click: function() {
                        $scope.alert = {
                            title: "Sales Tax",
                            text: "Sorry, that's the price you pay for being a 'Merican!",
                            dismissals: ['Yes, sir!']
                        };

                        $('#purchaseModal').modal('show');
                    }
                },
                amount: data.buyItNowPrice * .06
            }, {
                description: 'Finder\'s Fee',
                prompt: {
                    text: 'I don\'t want to pay a finder\s fee!',
                    click: function() {
                        $scope.alert = {
                            title: "Finder's Fee",
                            text: "Hey, you won't find sweet loot like this on e*Bay, buddy!",
                            dismissals: ['OK']
                        };

                        $('#purchaseModal').modal('show');
                    }
                },
                amount: data.buyItNowPrice * .15
            }, {
                description: 'Shipping',
                amount: $scope.computeShipping(data.buyItNowPrice)
            }]

            $scope.useShippingAddress = true;

            $scope.submitPurchase = function() {
                // TODO Validate purchase info
                $http.post('/buyIt', $scope.purchase).success(function(data) {
                    $scope.listing.sold = true;
                    alert("Congratulations!  You've successfully purchased " + $scope.listing.title + 
                        "!  The drone is being dispatched now with your item.");

                }).error(function(err) {
                    alert("Something's gone wrong with your order.");
                });
            };

            $scope.purchase = {
                listingId: data.listingId,
                userName: $scope.currentUser.userName,
                amount: $scope.sumBillingDetails($scope.billingDetails),
                purchaseDate: new Date(),
                billing: {
                    name: $scope.buildUserName($scope.currentUser),
                    street1: $scope.currentUser.address.street1,
                    street2: $scope.currentUser.address.street2,
                    city: $scope.currentUser.address.city,
                    state: $scope.currentUser.address.state,
                    zipCode: $scope.currentUser.address.zipCode
                }, 
                shipping: {
                    name: $scope.buildUserName($scope.currentUser),
                    street1: $scope.currentUser.address.street1,
                    street2: $scope.currentUser.address.street2,
                    city: $scope.currentUser.address.city,
                    state: $scope.currentUser.address.state,
                    zipCode: $scope.currentUser.address.zipCode
                },
                creditCardNumber: '',
                creditCardExpirationDate: '',
                creditCardValidationCode: '',
                creditCardType: '' 
            };
        
        }).error(function(err) {
        
            alert("Error " + err);
        });

        // Get the user's information
    });
    
});