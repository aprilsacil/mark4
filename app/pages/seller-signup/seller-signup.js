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
var login_1 = require('../login/login');
var buyer_signup_1 = require('../buyer-signup/buyer-signup');
var buyer_dashboard_1 = require('../buyer-dashboard/buyer-dashboard');
var seller_dashboard_1 = require('../seller-dashboard/seller-dashboard');
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
/*
  Generated class for the SellerSignupPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var SellerSignupPage = (function () {
    function SellerSignupPage(nav, couchDbEndpoint) {
        this.nav = nav;
        this.couchDbEndpoint = couchDbEndpoint;
        this.seller = {
            username: null,
            password: null,
            name: null,
            store_name: null
        };
        var self = this;
        // couch db integration
        this.pouchDb = new PouchDB(this.couchDbEndpoint + 'cheers', { skipSetup: true });
        // local integration
        this.localDb = new PouchDB('cheers');
        // this will sync locally
        this.localDb.sync(this.pouchDb, { live: true, retry: true }).on('error', console.log.bind(console));
    }
    /**
     * Redirects to the login page
     */
    SellerSignupPage.prototype.goToLoginPage = function () {
        this.nav.push(login_1.LoginPage);
    };
    /**
     * Redirects to the buyer
     */
    SellerSignupPage.prototype.goToBuyerSignupPage = function () {
        this.nav.push(buyer_signup_1.BuyerSignupPage);
    };
    /**
     * Redirects to the seller dashboard
     */
    SellerSignupPage.prototype.goToSellerDashboardPage = function () {
        this.nav.push(seller_dashboard_1.SellerDashboardPage);
    };
    /**
     * Redirects to the buyer dashboard
     */
    SellerSignupPage.prototype.goToBuyerDashboardPage = function () {
        this.nav.push(buyer_dashboard_1.BuyerDashboardPage);
    };
    /**
     * Validates and submits the data of the seller.
     */
    SellerSignupPage.prototype.submitSellerForm = function (sellerForm) {
        var self = this;
        // check if the form is not valid
        if (!sellerForm.valid) {
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
        // initialize the loader
        var loading = ionic_angular_1.Loading.create({
            content: 'Processing...'
        });
        // render loader
        self.nav.present(loading);
        this.pouchDb.signup(this.seller.username, this.seller.password, {
            metadata: {
                store_name: this.seller.store_name,
                fullname: this.seller.name,
                level: 0,
                roles: ['seller'],
            }
        }, function (err, response) {
            if (!err) {
                // TODO: add a success thingy here
                loading.dismiss().then(function () {
                    self.goToLoginPage();
                });
                return;
            }
            // there's an error
            var message;
            // check what type of error has occurred
            switch (err.name) {
                case 'conflict':
                    message = 'Username already exists.';
                    break;
                case 'forbidden':
                default:
                    message = 'Something went wrong. Please try again later.';
                    break;
            }
            var alert = ionic_angular_1.Alert.create({
                title: 'Error!',
                subTitle: message,
                buttons: ['OK']
            });
            loading.dismiss().then(function () {
                // render alert once the loader dismisses
                self.nav.present(alert);
            });
            return;
        });
    };
    SellerSignupPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/seller-signup/seller-signup.html'
        }),
        __param(1, core_1.Inject('CouchDBEndpoint')), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, String])
    ], SellerSignupPage);
    return SellerSignupPage;
}());
exports.SellerSignupPage = SellerSignupPage;
