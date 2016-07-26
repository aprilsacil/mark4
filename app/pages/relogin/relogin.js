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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('@angular/core');
var ionic_angular_1 = require('ionic-angular');
var buyer_dashboard_1 = require('../buyer-dashboard/buyer-dashboard');
var login_1 = require('../login/login');
var seller_dashboard_1 = require('../seller-dashboard/seller-dashboard');
var local_storage_provider_1 = require('../../providers/storage/local-storage-provider');
var buyer_1 = require('../../models/buyer');
var seller_1 = require('../../models/seller');
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
/*
  Generated class for the ReloginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var ReloginPage = (function () {
    function ReloginPage(events, localStorage, nav, couchDbEndpoint) {
        var _this = this;
        this.events = events;
        this.localStorage = localStorage;
        this.nav = nav;
        this.couchDbEndpoint = couchDbEndpoint;
        this.user = {
            name: null,
            image: null
        };
        this.relogin = {
            password: null
        };
        this.pouchDb = new PouchDB(this.couchDbEndpoint + 'cheers', { skipSetup: true });
        // local integration
        this.localDb = new PouchDB('cheers');
        // this will sync locally
        this.localDb.sync(this.pouchDb, { live: true, retry: true })
            .on('error', console.log.bind(console));
        // get user
        this.localStorage.getFromLocal('user').then(function (data) {
            _this.user = JSON.parse(data);
        });
    }
    /**
     * "Logs out" the current user and redirects to the login page
     */
    ReloginPage.prototype.changeUser = function () {
        var self = this;
        // unsubscribe events
        self.unsubscribeEvents();
        // remove from the local storage
        self.localStorage.removeFromLocal('user');
        // set to login page
        self.nav.setRoot(login_1.LoginPage);
    };
    /**
     * Validates and autheticate the data provided.
     */
    ReloginPage.prototype.verifyRelogin = function (reloginForm) {
        var _this = this;
        var self = this;
        // check if the form is not valid
        if (!reloginForm.valid) {
            // prompt that something is wrong in the form
            var alert = ionic_angular_1.Alert.create({
                title: 'Ooops...',
                subTitle: 'Something is wrong. Make sure the form fields are properly filled in.',
                buttons: ['OK']
            });
            // render in the template
            this.nav.present(alert);
            return;
        }
        // show a loader
        var loading = ionic_angular_1.Loading.create({
            content: 'Logging in...'
        });
        // render in the template
        this.nav.present(loading);
        // provide some ajax headers for authorization
        var ajaxOpts = {
            ajax: {
                headers: {
                    Authorization: 'Basic ' + window.btoa(this.user.name + ':' + this.relogin.password)
                }
            }
        };
        // login the user
        this.pouchDb.login(this.user.name, this.relogin.password, ajaxOpts, function (err, response) {
            console.log(err);
            console.log('login response', response);
            var loginResponse = response;
            if (!err) {
                // get user details
                _this.pouchDb.getUser(loginResponse.name, function (err, response) {
                    // delete the password and salt
                    delete response.password_scheme;
                    delete response.salt;
                    var user = response;
                    // set the timestamp
                    self.localStorage
                        .setToLocal('timestamp', Math.round(new Date().getTime() / 1000));
                    // if seller redirect to seller dashboard
                    if (response.roles[0] === 'seller') {
                        // save user data to the local storage
                        self.localStorage.setToLocal('user', JSON.stringify(new seller_1.Seller(user)));
                        // broadcast event to start some event listeners
                        _this.events.publish('central:start', JSON.stringify(new seller_1.Seller(user)));
                        // remove loader and set the root page
                        loading.dismiss().then(function () {
                            _this.nav.setRoot(seller_dashboard_1.SellerDashboardPage);
                        });
                    }
                    // if buyer redirect to buyer dashboard
                    if (response.roles[0] === 'buyer') {
                        var buyer = new buyer_1.Buyer(user);
                        // save user data to the local storage
                        self.localStorage.setToLocal('user', JSON.stringify(buyer));
                        // broadcast event to start some event listeners
                        _this.events.publish('peripheral:start');
                        // set the data to be advertised
                        var advertiseData = {
                            _id: buyer._id,
                            fullname: buyer.fullname,
                            name: buyer.name,
                            job_description: buyer.job_description,
                            company_name: buyer.company_name,
                            level: buyer.level
                        };
                        // let's advertise
                        _this.events.publish('peripheral:set_buyer_data', advertiseData);
                        // remove loader and set the root page
                        loading.dismiss().then(function () {
                            _this.nav.setRoot(buyer_dashboard_1.BuyerDashboardPage);
                        });
                    }
                });
                return;
            }
            // remove the loader
            loading.dismiss().then(function () {
                var message;
                // check the error message
                switch (err.message) {
                    case 'ETIMEDOUT':
                        message = 'Can\'t connect to the server. Please try again.';
                        break;
                    default:
                        message = err.message;
                        break;
                }
                // check status number
                if (err.status == 500) {
                    message = 'Something is wrong while processing your request. Please try again later.';
                }
                // show an alert
                setTimeout(function () {
                    var alert = ionic_angular_1.Alert.create({
                        title: 'Error!',
                        subTitle: message,
                        buttons: ['OK']
                    });
                    // render in the template
                    self.nav.present(alert);
                }, 300);
            });
            return;
        });
    };
    /**
     * Unsubscribe to all central and peripheral events
     */
    ReloginPage.prototype.unsubscribeEvents = function () {
        // central
        this.events.unsubscribe('central:start', function () { });
        this.events.unsubscribe('central:startScan', function () { });
        this.events.unsubscribe('central:stopScan', function () { });
        this.events.unsubscribe('central:write', function () { });
        this.events.unsubscribe('central:buyersNearby', function () { });
        // peripheral
        this.events.unsubscribe('peripheral:start', function () { });
        this.events.unsubscribe('peripheral:emoteFound', function () { });
    };
    ReloginPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/relogin/relogin.html',
            providers: [local_storage_provider_1.LocalStorageProvider]
        }),
        __param(3, core_1.Inject('CouchDBEndpoint')), 
        __metadata('design:paramtypes', [ionic_angular_1.Events, local_storage_provider_1.LocalStorageProvider, ionic_angular_1.NavController, String])
    ], ReloginPage);
    return ReloginPage;
}());
exports.ReloginPage = ReloginPage;
