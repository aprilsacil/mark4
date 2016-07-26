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
var seller_1 = require('../../models/seller');
require('rxjs/add/operator/toPromise');
require('rxjs/add/operator/map');
/*
  Generated class for the SellerAssociatesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var SellerAssociatesPage = (function () {
    function SellerAssociatesPage(localStorage, nav, http, couchDbEndpoint, apiEndpoint) {
        var _this = this;
        this.localStorage = localStorage;
        this.nav = nav;
        this.http = http;
        this.couchDbEndpoint = couchDbEndpoint;
        this.apiEndpoint = apiEndpoint;
        this.user = new seller_1.Seller({});
        this.associates = [];
        this.results = [];
        this.searching = false;
        // get user details from local storage
        this.localStorage.getFromLocal('user')
            .then(function (result) { return _this.getUserAssociates(result); });
    }
    /**
     * Render and shows a toast message
     */
    SellerAssociatesPage.prototype.showToast = function (message) {
        var toast = ionic_angular_1.Toast.create({
            message: message,
            duration: 3000
        });
        // render in the template
        this.nav.present(toast);
    };
    /**
     * Fetch users from the API.
     */
    SellerAssociatesPage.prototype.fetchUsers = function (keyword) {
        var _this = this;
        if (!keyword) {
            this.searching = false;
            return;
        }
        this.searching = true;
        var headers = new http_1.Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        var param = {
            type: 'invite',
            search: keyword
        };
        this.http
            .post(this.apiEndpoint + 'users', param, { headers: headers })
            .map(function (response) { return response.json(); })
            .subscribe(function (data) {
            data = data.rows;
            console.log(data);
            for (var i in data) {
                _this.results.push({
                    username: data[i].key,
                    fullname: data[i].value[0],
                    image: data[i].value[1]
                });
            }
        }, function (error) {
            console.log(error);
        });
    };
    /**
     * Fetches the list of associates of the user.
     */
    SellerAssociatesPage.prototype.getUserAssociates = function (user) {
        var _this = this;
        this.user = new seller_1.Seller(JSON.parse(user));
        // set the headers
        var headers = new http_1.Headers({
            'Content-Type': 'application/x-www-form-urlencoded' });
        // set the parameters
        var param = {
            type: 'seller_store',
            search: this.user.name
        };
        // perform request
        this.http
            .post(this.apiEndpoint + 'users', param, { headers: headers })
            .map(function (response) { return response.json(); })
            .subscribe(function (data) {
            data = data.rows;
            for (var i in data) {
                if (_this.user.name == data[i].value[0]) {
                    continue;
                }
                _this.associates.push({
                    fullname: data[i].value[0],
                    image: data[i].value[1]
                });
            }
        }, function (error) {
            console.log(error);
        });
    };
    /**
     * Invites this person
     */
    SellerAssociatesPage.prototype.invite = function (username) {
        var _this = this;
        console.log(username);
        var headers = new http_1.Headers({
            'Content-Type': 'application/x-www-form-urlencoded' });
        var param = {
            username: username,
            store: this.user.name
        };
        this.http
            .post('http://cheers.dev/invite', param, { headers: headers })
            .map(function (response) { return response.json(); })
            .subscribe(function (data) {
            _this.showToast('You have successfully gave the customer an award.');
            _this.searching = false;
        }, function (error) {
            console.log(error);
        });
    };
    SellerAssociatesPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/seller-associates/seller-associates.html',
            providers: [http_1.HTTP_PROVIDERS, local_storage_provider_1.LocalStorageProvider]
        }),
        __param(3, core_1.Inject('CouchDBEndpoint')),
        __param(4, core_1.Inject('APIEndpoint')), 
        __metadata('design:paramtypes', [local_storage_provider_1.LocalStorageProvider, ionic_angular_1.NavController, http_1.Http, String, String])
    ], SellerAssociatesPage);
    return SellerAssociatesPage;
}());
exports.SellerAssociatesPage = SellerAssociatesPage;
