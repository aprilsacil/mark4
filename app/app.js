"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var ionic_angular_1 = require('ionic-angular');
var ionic_native_1 = require('ionic-native');
var buyer_signup_1 = require('./pages/buyer-signup/buyer-signup');
var buyer_dashboard_1 = require('./pages/buyer-dashboard/buyer-dashboard');
var seller_dashboard_1 = require('./pages/seller-dashboard/seller-dashboard');
var relogin_1 = require('./pages/relogin/relogin');
var central_ble_1 = require('./providers/bluetooth/central-ble');
var peripheral_ble_1 = require('./providers/bluetooth/peripheral-ble');
var local_storage_provider_1 = require('./providers/storage/local-storage-provider');
var MyApp = (function () {
    function MyApp(centralBle, events, localStorage, peripheralBle, platform) {
        var _this = this;
        this.centralBle = centralBle;
        this.events = events;
        this.localStorage = localStorage;
        this.peripheralBle = peripheralBle;
        this.platform = platform;
        platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            ionic_native_1.StatusBar.styleDefault();
            _this.authenticationEvents();
        });
    }
    /**
     * Listens for events like logout, login, and change of role.
     */
    MyApp.prototype.authenticationEvents = function () {
        var _this = this;
        var currentTimestamp = Math.round(new Date().getTime() / 1000);
        // check if there are logged in users
        this.localStorage.getFromLocal('user').then(function (data) {
            if (data) {
                _this.localStorage.getFromLocal('timestamp').then(function (timestamp) {
                    // get the difference between the current and saved timestamp
                    var difference = currentTimestamp - timestamp;
                    // check it's almost 30 minutes
                    if (difference >= 1800) {
                        // if it's almost 30 minutes, set the root page to the relog page
                        _this.rootPage = relogin_1.ReloginPage;
                        return;
                    }
                    // get the user
                    var user = JSON.parse(data);
                    // get the role
                    var role = user.roles[0];
                    // set the page based on the given role
                    if (role == 'buyer') {
                        // start the peripheral device events
                        _this.buyerEvents();
                        // set the data to be advertised
                        var advertiseData = {
                            _id: user._id,
                            fullname: user.fullname,
                            name: user.name,
                            job_description: user.job_description,
                            company_name: user.company_name,
                            level: user.level
                        };
                        // set data
                        _this.events.publish('peripheral:set_buyer_data', advertiseData);
                        // set the dashboard
                        _this.rootPage = buyer_dashboard_1.BuyerDashboardPage;
                        return;
                    }
                    if (role == 'seller') {
                        // start the central device events
                        _this.sellerEvents();
                        // set the dashboard
                        _this.rootPage = seller_dashboard_1.SellerDashboardPage;
                        return;
                    }
                });
            }
        });
        // set the default root page
        this.rootPage = buyer_signup_1.BuyerSignupPage;
        // register some event listeners here
        // central
        this.events.subscribe('central:start', function (eventData) {
            // initialize the central ble events
            _this.sellerEvents();
        });
        // peripheral
        this.events.subscribe('peripheral:start', function (eventData) {
            // initialize the peripheral ble events
            _this.buyerEvents();
        });
    };
    /**
     * Seller event listeners
     */
    MyApp.prototype.sellerEvents = function () {
        var self = this;
        // initialize this
        self.centralBle.init();
        this.events.subscribe('central:startScan', function (eventData) {
            console.log('event: start scan');
            // check if the bluetooth is enabled or not
            self.centralBle.status().then(function (result) {
                if (!result) {
                    // prompt that the bluetooth is not enabled
                    return;
                }
                // check if location services is enabled
            });
            // start scanning
            self.centralBle.scan();
        });
        this.events.subscribe('central:stopScan', function (eventData) {
            console.log('event: stop scan');
            // stop scanning
            self.centralBle.stop();
        });
        // write event
        // this.events.subscribe('central:write', (eventData) => {
        //     console.log('event: write', eventData[0]);
        //     self.centralBle.write(JSON.stringify(eventData[0]));
        // });
    };
    /**
     * Buyer event listeners
     */
    MyApp.prototype.buyerEvents = function () {
        var self = this;
        // initialize the peripheral ble
        self.peripheralBle.init();
        self.events.subscribe('peripheral:stop', function () {
            self.peripheralBle.stop();
        });
        // do some cleanup by removing the looking for product data
        self.localStorage.removeFromLocal('looking_for');
    };
    MyApp = __decorate([
        core_1.Component({
            template: '<ion-nav [root]="rootPage"></ion-nav>',
            providers: [central_ble_1.CentralBle, local_storage_provider_1.LocalStorageProvider, peripheral_ble_1.PeripheralBle]
        }), 
        __metadata('design:paramtypes', [central_ble_1.CentralBle, ionic_angular_1.Events, local_storage_provider_1.LocalStorageProvider, peripheral_ble_1.PeripheralBle, ionic_angular_1.Platform])
    ], MyApp);
    return MyApp;
}());
exports.MyApp = MyApp;
ionic_angular_1.ionicBootstrap(MyApp, [
    core_1.provide('CouchDBEndpoint', { useValue: 'http://192.168.0.105:5984/' }),
    core_1.provide('APIEndpoint', { useValue: 'http://192.168.0.124/' })]);
