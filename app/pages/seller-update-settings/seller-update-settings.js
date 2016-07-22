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
var ionic_native_1 = require('ionic-native');
var login_1 = require('../login/login');
var local_storage_provider_1 = require('../../providers/storage/local-storage-provider');
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
/*
  Generated class for the SellerUpdateSettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var SellerUpdateSettingsPage = (function () {
    function SellerUpdateSettingsPage(events, localStorage, nav, couchDbEndpoint) {
        var _this = this;
        this.events = events;
        this.localStorage = localStorage;
        this.nav = nav;
        this.couchDbEndpoint = couchDbEndpoint;
        this.seller = {
            image: null,
            fullname: null,
            store_name: null,
            name: null
        };
        var self = this;
        // couch db integration
        this.db = new PouchDB(this.couchDbEndpoint + 'cheers', { skipSetup: true });
        // local integration
        this.dbLocal = new PouchDB('cheers');
        // this will sync locally
        this.db.sync(this.dbLocal, { live: true, retry: true }).on('error', console.log.bind(console));
        this.localStorage.getFromLocal('user').then(function (data) {
            _this.seller = JSON.parse(data);
        });
    }
    /**
     * Redirects to the login page
     */
    SellerUpdateSettingsPage.prototype.goToLoginPage = function () {
        this.nav.push(login_1.LoginPage);
    };
    /**
     * User logs out
     */
    SellerUpdateSettingsPage.prototype.logout = function () {
        var self = this;
        // initialize the Alert component
        var alert = ionic_angular_1.Alert.create({
            title: 'Log out',
            message: 'Are you sure you want to log out of Cheers?',
            buttons: [{
                    text: 'Cancel',
                    handler: function (data) {
                        // do something?
                    }
                },
                {
                    text: 'Yes',
                    handler: function (data) {
                        // unsubscribe all seller events
                        self.unsubscribeEvents();
                        // remove data of the user from the storage
                        // redirect to login page
                        setTimeout(function () {
                            // remove from the local storage
                            self.localStorage.removeFromLocal('user');
                            // set to login page
                            self.nav.setRoot(login_1.LoginPage);
                        }, 1000);
                    }
                }]
        });
        // render it
        this.nav.present(alert);
    };
    /**
     * Opens up the camera and waits for the image to be fetched.
     */
    SellerUpdateSettingsPage.prototype.openTheCamera = function () {
        var _this = this;
        var options = {
            destinationType: 0,
            sourceType: 1,
            encodingType: 0,
            quality: 25,
            allowEdit: false,
            saveToPhotoAlbum: false
        };
        // once the user accepted the taken photo to be used
        ionic_native_1.Camera.getPicture(options).then(function (data) {
            var imgdata = "data:image/jpeg;base64," + data;
            // assign the image to the user object
            _this.seller.image = imgdata;
        }, function (error) {
            // bring out a toast error message
        });
    };
    /**
     * Saves the provided data in the form.
     */
    SellerUpdateSettingsPage.prototype.saveStoreSettings = function (updateSettingsForm) {
        var self = this;
        if (!updateSettingsForm.valid) {
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
            content: 'Saving...'
        });
        // render in the template
        this.nav.present(loading);
        this.db.putUser(this.seller.name, {
            metadata: {
                store_name: this.seller.store_name,
                fullname: this.seller.fullname,
                image: this.seller.image
            }
        }, function (err, response) {
            if (err) {
                var message;
                // determine the error
                switch (err.name) {
                    case 'not_found':
                        message = 'Something went wrong while processing your request. Please try again later.';
                        break;
                    default:
                        message = 'Something went wrong while processing your request. Please try again later.';
                        break;
                }
                // render the error
                loading.dismiss().then(function () {
                    var alert = ionic_angular_1.Alert.create({
                        title: 'Ooops...',
                        subTitle: message,
                        buttons: ['OK']
                    });
                    // render in the template
                    self.nav.present(alert);
                    return;
                });
                return;
            }
            // get user details
            self.db.getUser(self.seller.name, function (err, response) {
                // delete the password and salt
                delete response.password_scheme;
                delete response.salt;
                var user = JSON.stringify(response);
                // update user data to the local storage
                self.localStorage.setToLocal('user', user);
                // TODO: broadcast that we have update the user details
                // if no error remove the preloader now
                loading.dismiss()
                    .then(function () {
                    // show a toast
                    self.showToast('You have successfully updated your profile.');
                });
            });
            return;
        });
    };
    /**
     * Render and shows a toast message
     */
    SellerUpdateSettingsPage.prototype.showToast = function (message) {
        var toast = ionic_angular_1.Toast.create({
            message: message,
            duration: 3000
        });
        // render in the template
        this.nav.present(toast);
    };
    /**
     * Unsubscribes all central events
     */
    SellerUpdateSettingsPage.prototype.unsubscribeEvents = function () {
        // first, stop the scanning
        // this.events.publish('central:stopScan');
        // unsubscribe all events
        this.events.unsubscribe('central:start', function () { });
        this.events.unsubscribe('central:startScan', function () { });
        this.events.unsubscribe('central:stopScan', function () { });
        this.events.unsubscribe('central:write', function () { });
        this.events.unsubscribe('central:buyersNearby', function () { });
    };
    SellerUpdateSettingsPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/seller-update-settings/seller-update-settings.html',
            providers: [local_storage_provider_1.LocalStorageProvider]
        }),
        __param(3, core_1.Inject('CouchDBEndpoint')), 
        __metadata('design:paramtypes', [ionic_angular_1.Events, local_storage_provider_1.LocalStorageProvider, ionic_angular_1.NavController, String])
    ], SellerUpdateSettingsPage);
    return SellerUpdateSettingsPage;
}());
exports.SellerUpdateSettingsPage = SellerUpdateSettingsPage;
