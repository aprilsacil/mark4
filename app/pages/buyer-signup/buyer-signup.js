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
var seller_signup_1 = require('../seller-signup/seller-signup');
var buyer_dashboard_1 = require('../buyer-dashboard/buyer-dashboard');
var seller_dashboard_1 = require('../seller-dashboard/seller-dashboard');
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
/*
  Generated class for the BuyerSignupPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var BuyerSignupPage = (function () {
    function BuyerSignupPage(nav, couchDbEndpoint) {
        this.nav = nav;
        this.couchDbEndpoint = couchDbEndpoint;
        this.buyer = {
            username: null,
            password: null,
            name: null
        };
        // couch db integration
        this.db = new PouchDB(this.couchDbEndpoint + 'cheers', { skipSetup: true });
        // local integration
        var local = new PouchDB('cheers');
        // this will sync locally
        local.sync(this.db, { live: true, retry: true }).on('error', console.log.bind(console));
    }
    /**
     * Redirects to the login page
     */
    BuyerSignupPage.prototype.goToLoginPage = function () {
        this.nav.push(login_1.LoginPage);
    };
    /**
     * Redirects to the seller signup page
     */
    BuyerSignupPage.prototype.goToStoreSignupPage = function () {
        this.nav.push(seller_signup_1.SellerSignupPage);
    };
    /**
     * Redirects to the seller dashboard
     */
    BuyerSignupPage.prototype.goToSellerDashboardPage = function () {
        this.nav.push(seller_dashboard_1.SellerDashboardPage);
    };
    /**
     * Redirects to the buyer dashboard
     */
    BuyerSignupPage.prototype.goToBuyerDashboardPage = function () {
        this.nav.push(buyer_dashboard_1.BuyerDashboardPage);
    };
    /**
     * Validates and submits the buyer data.
     */
    BuyerSignupPage.prototype.submitSignupForm = function (buyerSignupForm) {
        var self = this;
        // check if the form is not valid
        if (!buyerSignupForm.valid) {
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
        this.db.signup(this.buyer.username, this.buyer.password, {
            metadata: {
                fullname: this.buyer.name,
                level: 0,
                roles: ['buyer']
            }
        }, function (err, response) {
            console.log('err', err);
            console.log('signup response: ', response);
            if (!err) {
                // no error, go to login page
                // TODO: put a toast or something to tell the user that he/she is
                // logged in.
                loading.dismiss().then(function () {
                    self.goToLoginPage();
                });
                return;
            }
            // there's an error, handle it
            var message;
            switch (err.name) {
                case 'conflict':
                    message = 'Username already exists.';
                    break;
                case 'forbidden':
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
    BuyerSignupPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/buyer-signup/buyer-signup.html'
        }),
        __param(1, core_1.Inject('CouchDBEndpoint')), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, String])
    ], BuyerSignupPage);
    return BuyerSignupPage;
}());
exports.BuyerSignupPage = BuyerSignupPage;
