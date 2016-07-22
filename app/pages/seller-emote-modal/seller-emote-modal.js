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
var local_storage_provider_1 = require('../../providers/storage/local-storage-provider');
/*
  Generated class for the SellerEmoteModalPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var SellerEmoteModalPage = (function () {
    function SellerEmoteModalPage(events, localStorage, nav, view) {
        var _this = this;
        this.events = events;
        this.localStorage = localStorage;
        this.nav = nav;
        this.view = view;
        this.maxCharacterLimit = 140;
        this.remainingCharacters = 140;
        this.emote = {
            message: null
        };
        this.peripherals = false;
        this.user = {};
        this.localStorage.getFromLocal('user').then(function (data) {
            _this.user = JSON.parse(data);
        });
        // trigger an event
        this.events.subscribe('central:getPeripherals', function (eventData) {
            _this.peripherals = !(JSON.stringify(eventData[0]) === '{}');
        });
    }
    /**
     * Computes the remaining characters allowed to be sent.
     */
    SellerEmoteModalPage.prototype.characterCounter = function (value) {
        if (!value || value.length === 0) {
            this.remainingCharacters = this.maxCharacterLimit;
        }
        // compute
        this.remainingCharacters = this.maxCharacterLimit - value.length;
    };
    /**
     * Closes the modal
     */
    SellerEmoteModalPage.prototype.dismiss = function () {
        this.view.dismiss();
    };
    /**
     * Render and shows a toast message
     */
    SellerEmoteModalPage.prototype.showToast = function (message) {
        var toast = ionic_angular_1.Toast.create({
            message: message,
            duration: 3000
        });
        // render in the template
        this.nav.present(toast);
    };
    /**
     * Sends out the emote to nearby shoppers.
     */
    SellerEmoteModalPage.prototype.submitEmote = function (emoteForm) {
        var _this = this;
        if (!emoteForm.valid) {
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
        // check if there are peripherals
        if (!this.peripherals) {
            // prompt that something is wrong in the form
            var alert = ionic_angular_1.Alert.create({
                title: 'Ooops...',
                subTitle: 'There are no buyers nearby. You cannot send this.',
                buttons: ['OK']
            });
            // render in the template
            this.nav.present(alert);
            return;
        }
        // initialize the loader
        var loading = ionic_angular_1.Loading.create({
            content: 'Sending out your emote...'
        });
        // render in the template
        this.nav.present(loading);
        // TODO: add thingy here
        setTimeout(function () {
            var user = _this.user;
            // prepare the data to be sent
            var data = {
                _id: user._id,
                fullname: user.fullname,
                store_name: user.store_name,
                emote: _this.emote.message
            };
            // publish event
            _this.events.publish('central:write', data);
            // dismiss the loader
            loading.dismiss().then(function () {
                // close the modal
                _this.view.dismiss();
            })
                .then(function () {
                // delay it for a second
                setTimeout(function () {
                    // show a toast
                    _this.showToast('You have successfully sent out your emote.');
                }, 600);
            });
        }, 3000);
    };
    SellerEmoteModalPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/seller-emote-modal/seller-emote-modal.html',
            providers: [local_storage_provider_1.LocalStorageProvider]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.Events, local_storage_provider_1.LocalStorageProvider, ionic_angular_1.NavController, ionic_angular_1.ViewController])
    ], SellerEmoteModalPage);
    return SellerEmoteModalPage;
}());
exports.SellerEmoteModalPage = SellerEmoteModalPage;
