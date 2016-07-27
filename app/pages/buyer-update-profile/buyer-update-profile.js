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
var buyer_1 = require('../../models/buyer');
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
/*
  Generated class for the BuyerUpdateProfilePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var BuyerUpdateProfilePage = (function () {
    function BuyerUpdateProfilePage(events, localStorage, nav, couchDbEndpoint) {
        var _this = this;
        this.events = events;
        this.localStorage = localStorage;
        this.nav = nav;
        this.couchDbEndpoint = couchDbEndpoint;
        this.user = new buyer_1.Buyer({});
        // couch db integration
        this.pouchDb = new PouchDB(this.couchDbEndpoint + 'cheers', { skipSetup: true });
        // local integration
        this.localDb = new PouchDB('cheers');
        // this will sync locally
        this.localDb.sync(this.pouchDb, { live: true, retry: true })
            .on('error', console.log.bind(console));
        this.localStorage.getFromLocal('user').then(function (data) {
            var user = JSON.parse(data);
            // set the data
            _this.user = new buyer_1.Buyer(user);
        });
    }
    /**
     * Redirects to the login page
     */
    BuyerUpdateProfilePage.prototype.goToLoginPage = function () {
        this.nav.push(login_1.LoginPage);
    };
    /**
     * User logs out
     */
    BuyerUpdateProfilePage.prototype.logout = function () {
        var _this = this;
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
                        // unsubscribe events
                        _this.unsubscribeEvents();
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
    BuyerUpdateProfilePage.prototype.openTheCamera = function () {
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
            _this.user.image = imgdata;
        }, function (error) {
            // bring out a toast error message
        });
    };
    /**
     * Saves the provided data in the form.
     */
    BuyerUpdateProfilePage.prototype.saveProfileDetails = function (updateProfileForm) {
        var self = this;
        if (!updateProfileForm.valid) {
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
        this.pouchDb.putUser(this.user.name, {
            metadata: {
                fullname: this.user.fullname,
                job_description: this.user.job_description,
                company_name: this.user.company_name,
                image: this.user.image
            }
        }, function (err, response) {
            if (err) {
                var message;
                // determine the error
                switch (err.name) {
                    case 'not_found':
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
            self.pouchDb.getUser(self.user.name, function (err, response) {
                // delete the password and salt
                delete response.password_scheme;
                delete response.salt;
                var user = JSON.stringify(new buyer_1.Buyer(response));
                // update user data to the local storage
                self.localStorage.setToLocal('user', user);
                // broadcast that we have update the user details
                self.events.publish('user:update_details');
                // if no error remove the preloader now
                loading.dismiss()
                    .then(function () {
                    // show a toast
                    self.showToast('You have successfully updated your profile.');
                });
            });
        });
    };
    /**
     * Render and shows a toast message
     */
    BuyerUpdateProfilePage.prototype.showToast = function (message) {
        var toast = ionic_angular_1.Toast.create({
            message: message,
            duration: 3000
        });
        // render in the template
        this.nav.present(toast);
    };
    /**
     * Unsubscribe to all peripheral events
     */
    BuyerUpdateProfilePage.prototype.unsubscribeEvents = function () {
        // TODO: stop advertising
        this.events.publish('peripheral:stop');
        this.events.unsubscribe('peripheral:start', function () { });
        this.events.unsubscribe('peripheral:emoteFound', function () { });
    };
    BuyerUpdateProfilePage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/buyer-update-profile/buyer-update-profile.html',
        }),
        __param(3, core_1.Inject('CouchDBEndpoint')), 
        __metadata('design:paramtypes', [ionic_angular_1.Events, local_storage_provider_1.LocalStorageProvider, ionic_angular_1.NavController, String])
    ], BuyerUpdateProfilePage);
    return BuyerUpdateProfilePage;
}());
exports.BuyerUpdateProfilePage = BuyerUpdateProfilePage;
