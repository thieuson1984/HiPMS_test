'use strict';
var customersApp = angular.module('customers');
// Customers controller
customersApp.controller('CustomersController', ['$scope', '$stateParams', 'Authentication', 'Customers', '$modal', '$log',
	function($scope, $stateParams, Authentication, Customers, $modal, $log) {
        this.authentication = Authentication;
        // Find a list of Customers
        this.customers = Customers.query();

        // Define angular-ui-modal for doing update
        this.modalUpdate = function (size, selectedCustomer) {
            // Check Create or Update customer condition
            // Default path is edit view
            var templateUrl = 'modules/customers/views/edit-customer.client.view.html';
            if(!selectedCustomer){
                templateUrl = 'modules/customers/views/create-customer.client.view.html';
            }
            var modalInstance = $modal.open({
                templateUrl: templateUrl,
                controller: function ($scope, $modalInstance, customer) {
                    $scope.customer = customer;
                    $scope.ok = function () {
                        if(this.saveCustomerForm.$valid){
                            console.log(this.saveCustomerForm.$valid);
                            $modalInstance.close($scope.customer);
                        }else {
                            this.saveCustomerForm.submitted = true;
                        }
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                size: size,
                resolve: {
                    customer: function () {
                        return selectedCustomer;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        // Remove existing Customer
        this.remove = function(customer) {
            if ( customer ) {
                customer.$remove();

                for (var i in this.customers) {
                    if (this.customers [i] === customer) {
                        this.customers.splice(i, 1);
                    }
                }
            } else {
                this.customer.$remove(function() {
                    //do something after delete
                });
            }
        };
    }
]);

customersApp.controller('CustomersCreateController', ['$scope', 'Customers', 'Notify',
    function($scope, Customers, Notify) {
        // Create new Customer
        this.create = function() {
            // Create new Customer object
            var customer = new Customers ({
                firstName: this.firstName,
                surname: this.surname,
                suburb: this.suburb,
                country: this.country,
                industry: this.industry,
                email: this.email,
                phone: this.phone,
                referred: this.referred,
                channel: this.channel
            });
            console.log(customer);
            // Redirect after save
            customer.$save(function(response) {
                Notify.sendMsg('NewCustomer', {'id': response._id});
                // Clear form fields
                $scope.name = '';
                $scope.surname = '';
                $scope.suburb = '';
                $scope.country = '';
                $scope.industry = '';
                $scope.email = '';
                $scope.phone = '';
                $scope.referred = '';
                $scope.channel = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
    }
]);

customersApp.controller('CustomersUpdateController', ['$scope', 'Customers',
    function($scope, Customers) {
        // TODO: must implement shared data to get list from other documents
        // For mongodb object (channel as channel.name for channel in channels track by channel._id)
        /* var channelsJson = '[
                    { "_id": "53703935cadf4ef008000000", "name": "Facebook" },
                    { "_id": "536fee62cadf4efc08000001", "name": "Twitter" },
                    { "_id": "536fee3ccadf4ef808000000", "name": "Google+" }
           ]';
        */
        // Using ng-select
        $scope.channelOptions = [
            {id:'12345678ssdf9', item:'Facebook'},
            {id:'4598445465sdf', item:'Twitter'},
            {id:'54654654sdfsdf', item:'Google+'}
        ];
        console.log($scope.channelOptions);
        // Update existing Customer
        this.update = function(updatedCustomer) {
            var customer = updatedCustomer;

            customer.$update(function() {
                //do something
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
    }
]);

customersApp.directive('customerList', ['Customers', 'Notify', function(Customers, Notify){
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'modules/customers/views/customer-list-template.html',
        link: function(scope, element, attrs){
            //update customers list
            Notify.getMsg('NewCustomer', function(event, data){
                scope.customersCtrl.customers = Customers.query();
            });
        }
    };
}]);
