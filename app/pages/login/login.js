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
var buyer_signup_1 = require('../buyer-signup/buyer-signup');
var buyer_dashboard_1 = require('../buyer-dashboard/buyer-dashboard');
var seller_dashboard_1 = require('../seller-dashboard/seller-dashboard');
var local_storage_provider_1 = require('../../providers/storage/local-storage-provider');
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
/*
  Generated class for the LoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var LoginPage = (function () {
    function LoginPage(events, nav, localStorage, couchDbEndpoint) {
        this.events = events;
        this.nav = nav;
        this.localStorage = localStorage;
        this.couchDbEndpoint = couchDbEndpoint;
        this.login = {
            username: null,
            password: null
        };
        this.pouchDb = new PouchDB(this.couchDbEndpoint + 'cheers', { skipSetup: true });
        // local integration
        this.localDb = new PouchDB('cheers');
        // this will sync locally
        this.localDb.sync(this.pouchDb, { live: true, retry: true })
            .on('error', console.log.bind(console));
    }
    /**
     * Redirects to the buyer dashboard
     */
    LoginPage.prototype.goToBuyerDashboardPage = function () {
        this.nav.setRoot(buyer_dashboard_1.BuyerDashboardPage);
    };
    /**
     * Redirects to the buyer signup page
     */
    LoginPage.prototype.goToBuyerSignupPage = function () {
        this.nav.push(buyer_signup_1.BuyerSignupPage);
    };
    /**
     * Redirects to the seller dashboard
     */
    LoginPage.prototype.goToSellerDashboardPage = function () {
        this.nav.setRoot(seller_dashboard_1.SellerDashboardPage);
    };
    /**
     * Validates and submits the buyer data.
     */
    LoginPage.prototype.submitLogin = function (loginForm) {
        var _this = this;
        var self = this;
        // check if the form is not valid
        if (!loginForm.valid) {
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
                    Authorization: 'Basic ' + window.btoa(this.login.username + ':' + this.login.password)
                }
            }
        };
        // login the user
        this.pouchDb.login(this.login.username, this.login.password, ajaxOpts, function (err, response) {
            var loginResponse = response;
            if (!err) {
                // get user details
                _this.pouchDb.getUser(loginResponse.name, function (err, response) {
                    console.log('get user response', response);
                    // delete the password and salt
                    delete response.password_scheme;
                    delete response.salt;
                    var user = JSON.stringify(response);
                    // save user data to the local storage
                    self.localStorage.setToLocal('user', user);
                    self.localStorage.setToLocal('timestamp', Math.round(new Date().getTime() / 1000));
                    // if seller redirect to seller dashboard
                    if (response.roles[0] === 'seller') {
                        // broadcast event to start some event listeners
                        _this.events.publish('central:start', user);
                        // remove loader and set the root page
                        loading.dismiss().then(function () {
                            return self.goToSellerDashboardPage();
                        });
                    }
                    // if buyer redirect to buyer dashboard
                    if (response.roles[0] === 'buyer') {
                        // broadcast event to start some event listeners
                        _this.events.publish('peripheral:start');
                        // set the data to be advertised
                        var advertiseData = {
                            _id: response._id,
                            fullname: response.fullname,
                            name: response.name,
                            job_description: response.job_description,
                            company_name: response.company_name,
                            level: response.level
                        };
                        _this.events.publish('peripheral:setData', advertiseData);
                        // remove loader and set the root page
                        loading.dismiss().then(function () {
                            return self.goToBuyerDashboardPage();
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
    LoginPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/login/login.html',
            providers: [local_storage_provider_1.LocalStorageProvider]
        }),
        __param(3, core_1.Inject('CouchDBEndpoint')), 
        __metadata('design:paramtypes', [ionic_angular_1.Events, ionic_angular_1.NavController, local_storage_provider_1.LocalStorageProvider, String])
    ], LoginPage);
    return LoginPage;
}());
exports.LoginPage = LoginPage;
