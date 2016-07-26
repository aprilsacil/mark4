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
var seller_associates_1 = require('../seller-associates/seller-associates');
var seller_emote_modal_1 = require('../seller-emote-modal/seller-emote-modal');
var seller_shopper_view_1 = require('../seller-shopper-view/seller-shopper-view');
var seller_update_settings_1 = require('../seller-update-settings/seller-update-settings');
var local_storage_provider_1 = require('../../providers/storage/local-storage-provider');
var cheers_avatar_1 = require('../../components/cheers-avatar/cheers-avatar');
var buyer_1 = require('../../models/buyer');
var seller_1 = require('../../models/seller');
/*
  Generated class for the SellerDashboardPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var SellerDashboardPage = (function () {
    function SellerDashboardPage(events, localStorage, nav, view, zone, couchDbEndpoint) {
        var _this = this;
        this.events = events;
        this.localStorage = localStorage;
        this.nav = nav;
        this.view = view;
        this.zone = zone;
        this.couchDbEndpoint = couchDbEndpoint;
        this.shoppers = [];
        this.scanning = false;
        this.scanning = false;
        // get user details
        this.getUser();
        // listens for changes in the user details
        this.events.subscribe('user:update_details', function () {
            // get user details again from the local storage
            _this.getUser();
        });
    }
    /**
     * Listens to an event triggered by the central ble library to get nearby
     * peripheral devices details and render it to the app.
     */
    SellerDashboardPage.prototype.getNearbyShopperDevices = function () {
        var _this = this;
        // initialize the event to listen
        this.events.subscribe('central:buyers_nearby', function (eventData) {
            var buyer = JSON.parse(eventData[0]);
            console.log('event data', buyer);
            // check if there's really a data
            if (!buyer) {
                return;
            }
            buyer = new buyer_1.Buyer(buyer);
            var exists = false;
            // check if the buyer already exists in the object
            if (_this.shoppers || _this.shoppers.length !== 0) {
                // check if the shopper already exists
                for (var s in _this.shoppers) {
                    // check if the ids are the same
                    if (_this.shoppers[s]._id == buyer._id) {
                        // update the object
                        _this.zone.run(function () {
                            _this.shoppers[s] = buyer;
                        });
                        exists = true;
                        break;
                    }
                }
            }
            console.log('npa', buyer);
            // no shoppers, just push it
            if (!_this.shoppers.length || !exists) {
                _this.zone.run(function () {
                    _this.shoppers.push(buyer);
                });
            }
            console.log(_this.shoppers);
        });
    };
    /**
     * Get user data from the local storage
     */
    SellerDashboardPage.prototype.getUser = function () {
        var _this = this;
        this.localStorage.getFromLocal('user').then(function (data) {
            _this.user = new seller_1.Seller(JSON.parse(data));
        });
    };
    /**
     * Goes to the associates page
     */
    SellerDashboardPage.prototype.goToAssociatesPage = function () {
        this.nav.push(seller_associates_1.SellerAssociatesPage);
    };
    /**
     * Views the details of the shopper
     */
    SellerDashboardPage.prototype.goToShopperDetails = function (shopper) {
        this.nav.push(seller_shopper_view_1.SellerShopperViewPage, { shopper: shopper });
    };
    /**
     * Goes to update settings page
     */
    SellerDashboardPage.prototype.goToUpdateSettingsPage = function () {
        this.nav.push(seller_update_settings_1.SellerUpdateSettingsPage);
    };
    /**
     * Show the Emote modal
     */
    SellerDashboardPage.prototype.showEmoteModal = function () {
        // initialize the modal
        var modal = ionic_angular_1.Modal.create(seller_emote_modal_1.SellerEmoteModalPage);
        // render
        this.nav.present(modal);
    };
    /**
     * Will start or stop the scanning of devices nearby the user.
     */
    SellerDashboardPage.prototype.toggleScan = function () {
        var self = this;
        // check if we're scanning
        if (self.scanning) {
            // currently scanning, so we're going to stop it
            // flag that we're stopped scanning
            this.scanning = false;
            // empty out the shoppers
            this.shoppers = [];
            // stop the scan
            this.events.publish('central:stopScan');
            // unsubscribe event
            this.events.unsubscribe('central:buyers_nearby', function () { });
            return;
        }
        // flag that we're scanning
        this.scanning = true;
        // scan
        this.events.publish('central:startScan');
        // get the list of shoppers detected
        this.getNearbyShopperDevices();
        return;
    };
    SellerDashboardPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/seller-dashboard/seller-dashboard.html',
            directives: [cheers_avatar_1.CheersAvatar],
            providers: [local_storage_provider_1.LocalStorageProvider]
        }),
        __param(5, core_1.Inject('CouchDBEndpoint')), 
        __metadata('design:paramtypes', [ionic_angular_1.Events, local_storage_provider_1.LocalStorageProvider, ionic_angular_1.NavController, ionic_angular_1.ViewController, core_1.NgZone, String])
    ], SellerDashboardPage);
    return SellerDashboardPage;
}());
exports.SellerDashboardPage = SellerDashboardPage;
