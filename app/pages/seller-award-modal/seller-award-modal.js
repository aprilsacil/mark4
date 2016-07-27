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
var http_1 = require('@angular/http');
var local_storage_provider_1 = require('../../providers/storage/local-storage-provider');
var buyer_1 = require('../../models/buyer');
var seller_1 = require('../../models/seller');
require('rxjs/add/operator/toPromise');
require('rxjs/add/operator/map');
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
/*
  Generated class for the SellerAwardModalPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var SellerAwardModalPage = (function () {
    function SellerAwardModalPage(localStorage, nav, params, http, view, couchDbEndpoint, apiEndpoint) {
        var _this = this;
        this.localStorage = localStorage;
        this.nav = nav;
        this.params = params;
        this.http = http;
        this.view = view;
        this.couchDbEndpoint = couchDbEndpoint;
        this.apiEndpoint = apiEndpoint;
        this.award = {
            purchasedItem: null,
            price: null,
            message: null,
            username: null,
            store: null,
            image: null
        };
        this.user = new seller_1.Seller({});
        // get the shopper details from the NavParams
        this.shopper = new buyer_1.Buyer(this.params.get('shopper'));
        // get logged in user details
        this.localStorage.getFromLocal('user').then(function (data) {
            _this.user = new seller_1.Seller(JSON.parse(data));
        });
    }
    /**
     * Closes the modal
     */
    SellerAwardModalPage.prototype.dismiss = function () {
        this.view.dismiss();
    };
    /**
     * Render and shows a toast message
     */
    SellerAwardModalPage.prototype.showToast = function (message) {
        var toast = ionic_angular_1.Toast.create({
            message: message,
            duration: 3000
        });
        // render in the template
        this.nav.present(toast);
    };
    /**
     * Validates and submit the award to be given to the customer.
     */
    SellerAwardModalPage.prototype.submitAwardCustomer = function (awardCustomerForm) {
        var self = this;
        if (!awardCustomerForm.valid) {
        }
        // initialize the loader
        var loading = ionic_angular_1.Loading.create({
            content: 'Sending award to the customer...'
        });
        // render
        self.nav.present(loading);
        // set the headers
        var headers = new http_1.Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        var param = self.award;
        param.username = self.shopper.name;
        param.image = self.shopper.image;
        param.store = self.user.name;
        self.http
            .post(self.apiEndpoint + 'history', param, { headers: headers })
            .map(function (response) { return response.json(); })
            .subscribe(function (data) {
            if (!data.ok) {
                return;
            }
            loading.dismiss().then(function () {
                // close the modal
                self.dismiss();
            })
                .then(function () {
                // delay it for a second
                setTimeout(function () {
                    // show a toast
                    self.showToast('You have successfully gave the customer an award.');
                }, 600);
            });
        }, function (error) {
            console.log(error);
        });
    };
    SellerAwardModalPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/seller-award-modal/seller-award-modal.html',
            providers: [http_1.HTTP_PROVIDERS, local_storage_provider_1.LocalStorageProvider]
        }),
        __param(5, core_1.Inject('CouchDBEndpoint')),
        __param(6, core_1.Inject('APIEndpoint')), 
        __metadata('design:paramtypes', [local_storage_provider_1.LocalStorageProvider, ionic_angular_1.NavController, ionic_angular_1.NavParams, http_1.Http, ionic_angular_1.ViewController, String, String])
    ], SellerAwardModalPage);
    return SellerAwardModalPage;
}());
exports.SellerAwardModalPage = SellerAwardModalPage;
