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
var seller_award_modal_1 = require('../seller-award-modal/seller-award-modal');
var cheers_avatar_1 = require('../../components/cheers-avatar/cheers-avatar');
var http_1 = require('@angular/http');
var local_storage_provider_1 = require('../../providers/storage/local-storage-provider');
require('rxjs/add/operator/toPromise');
require('rxjs/add/operator/map');
/*
  Generated class for the SellerShopperViewPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var SellerShopperViewPage = (function () {
    function SellerShopperViewPage(localStorage, nav, params, http, couchDbEndpoint, apiEndpoint) {
        var _this = this;
        this.localStorage = localStorage;
        this.nav = nav;
        this.params = params;
        this.http = http;
        this.couchDbEndpoint = couchDbEndpoint;
        this.apiEndpoint = apiEndpoint;
        //private shopper: Object = {};
        this.shopper = { _id: null, image: null };
        this.history = [];
        this.shopper = this.params.get('shopper');
        this.localStorage.getFromLocal('user').then(function (data) {
            var user = JSON.parse(data);
            var headers = new http_1.Headers({
                'Content-Type': 'application/x-www-form-urlencoded' });
            var param = {
                type: 'per_user_store',
                search: user.name + '-' + _this.shopper._id.replace('org.couchdb.user:', '')
            };
            _this.http
                .get(_this.apiEndpoint + 'history?type=' + param.type +
                '&search=' + param.search, { headers: headers })
                .map(function (response) { return response.json(); })
                .subscribe(function (data) {
                for (var i in data.rows) {
                    var item = data.rows[i].value;
                    item.date = _this.timeAgoFromEpochTime(new Date(data.rows[i].value.date));
                    _this.history.push(item);
                }
                console.log(_this.history);
            }, function (error) {
                console.log(error);
            });
        });
    }
    /**
     * Shows the award customer modal
     */
    SellerShopperViewPage.prototype.showAwardModal = function () {
        // initialize the modal
        var modal = ionic_angular_1.Modal.create(seller_award_modal_1.SellerAwardModalPage, { shopper: this.shopper });
        // render it
        this.nav.present(modal);
    };
    SellerShopperViewPage.prototype.timeAgoFromEpochTime = function (epoch) {
        var secs = ((new Date()).getTime() / 1000) - epoch.getTime() / 1000;
        Math.floor(secs);
        var minutes = secs / 60;
        secs = Math.floor(secs % 60);
        if (minutes < 1) {
            return secs + (secs > 1 ? 's' : 's');
        }
        var hours = minutes / 60;
        minutes = Math.floor(minutes % 60);
        if (hours < 1) {
            return minutes + (minutes > 1 ? 'm' : 'm');
        }
        var days = hours / 24;
        hours = Math.floor(hours % 24);
        if (days < 1) {
            return hours + (hours > 1 ? 'h' : 'h');
        }
        var weeks = days / 7;
        days = Math.floor(days % 7);
        if (weeks < 1) {
            return days + (days > 1 ? 'd' : 'd');
        }
        var months = weeks / 4.35;
        weeks = Math.floor(weeks % 4.35);
        if (months < 1) {
            return weeks + (weeks > 1 ? 'w' : 'w');
        }
        var years = months / 12;
        months = Math.floor(months % 12);
        if (years < 1) {
            return months + (months > 1 ? 'M' : 'M');
        }
        years = Math.floor(years);
        return years + (years > 1 ? 'Y' : 'Y');
    };
    SellerShopperViewPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/seller-shopper-view/seller-shopper-view.html',
            directives: [cheers_avatar_1.CheersAvatar],
            providers: [http_1.HTTP_PROVIDERS, local_storage_provider_1.LocalStorageProvider]
        }),
        __param(4, core_1.Inject('CouchDBEndpoint')),
        __param(5, core_1.Inject('APIEndpoint')), 
        __metadata('design:paramtypes', [local_storage_provider_1.LocalStorageProvider, ionic_angular_1.NavController, ionic_angular_1.NavParams, http_1.Http, String, String])
    ], SellerShopperViewPage);
    return SellerShopperViewPage;
}());
exports.SellerShopperViewPage = SellerShopperViewPage;
