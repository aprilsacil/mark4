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
var buyer_1 = require('../../models/buyer');
/*
  Generated class for the BuyerLookingforModalPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var BuyerLookingforModalPage = (function () {
    function BuyerLookingforModalPage(events, localStorage, nav, view) {
        var _this = this;
        this.events = events;
        this.localStorage = localStorage;
        this.nav = nav;
        this.view = view;
        this.lookingFor = {
            product: null
        };
        this.user = new buyer_1.Buyer({});
        // fetch user details from the local storage
        this.localStorage.getFromLocal('user').then(function (data) {
            var user = JSON.parse(data);
            _this.user = new buyer_1.Buyer(user);
        });
    }
    /**
     * Closes the modal
     */
    BuyerLookingforModalPage.prototype.dismiss = function () {
        this.view.dismiss();
    };
    /**
     * Render and shows a toast message
     */
    BuyerLookingforModalPage.prototype.showToast = function (message) {
        var toast = ionic_angular_1.Toast.create({
            message: message,
            duration: 3000
        });
        // render in the template
        this.nav.present(toast);
    };
    /**
     * Sends out the looking for to nearby sellers.
     */
    BuyerLookingforModalPage.prototype.submitLookingFor = function (lookingForForm) {
        var _this = this;
        if (!lookingForForm.valid) {
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
            content: 'Sending...'
        });
        // render in the template
        this.nav.present(loading);
        // prepare the data
        var advertiseData = {
            _id: this.user._id,
            fullname: this.user.fullname,
            name: this.user.name,
            job_description: this.user.job_description,
            company_name: this.user.company_name,
            level: this.user.level,
            looking_for: this.lookingFor.product
        };
        // set data to be sent via ble
        this.events.publish('peripheral:set_buyer_data', advertiseData);
        // TODO: add thingy here
        setTimeout(function () {
            // dismiss the loader
            loading.dismiss().then(function () {
                // close the modal
                _this.dismiss();
            })
                .then(function () {
                // delay it for a second
                setTimeout(function () {
                    // show a toast
                    _this.showToast('Success!');
                }, 600);
            });
        }, 3000);
    };
    BuyerLookingforModalPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/buyer-lookingfor-modal/buyer-lookingfor-modal.html',
            providers: [local_storage_provider_1.LocalStorageProvider]
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.Events, local_storage_provider_1.LocalStorageProvider, ionic_angular_1.NavController, ionic_angular_1.ViewController])
    ], BuyerLookingforModalPage);
    return BuyerLookingforModalPage;
}());
exports.BuyerLookingforModalPage = BuyerLookingforModalPage;
