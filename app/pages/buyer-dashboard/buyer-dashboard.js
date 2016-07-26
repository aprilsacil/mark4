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
var ionic_angular_2 = require('ionic-angular');
var http_1 = require('@angular/http');
var buyer_update_profile_1 = require('../buyer-update-profile/buyer-update-profile');
var buyer_lookingfor_modal_1 = require('../buyer-lookingfor-modal/buyer-lookingfor-modal');
var seller_dashboard_1 = require('../seller-dashboard/seller-dashboard');
var local_storage_provider_1 = require('../../providers/storage/local-storage-provider');
var cheers_avatar_1 = require('../../components/cheers-avatar/cheers-avatar');
var buyer_1 = require('../../models/buyer');
require('rxjs/add/operator/toPromise');
require('rxjs/add/operator/map');
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
/*
  Generated class for the BuyerDashboardPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var BuyerDashboardPage = (function () {
    function BuyerDashboardPage(events, localStorage, nav, http, zone, couchDbEndpoint, apiEndpoint) {
        var _this = this;
        this.events = events;
        this.localStorage = localStorage;
        this.nav = nav;
        this.http = http;
        this.zone = zone;
        this.couchDbEndpoint = couchDbEndpoint;
        this.apiEndpoint = apiEndpoint;
        this.user = new buyer_1.Buyer({});
        this.history = [];
        this.sellers = [];
        this.associate = {
            username: null,
            roles: null
        };
        // couch db integration
        this.pouchDb = new PouchDB(this.couchDbEndpoint + 'cheers', { skipSetup: true });
        // local integration
        this.localDb = new PouchDB('cheers');
        // this will sync locally
        this.localDb.sync(this.pouchDb, { live: true, retry: true })
            .on('error', console.log.bind(console));
        // get user details that is saved in the local storage then get the
        // user history
        this.getUser();
        // listens for buyers that sends out an emote
        this.events.subscribe('peripheral:emoteFound', function (eventData) { return _this.handleEmotes(eventData[0]); });
        // listens for changes in the user details
        this.events.subscribe('user:update_details', function () {
            // get user details again from the local storage
            _this.getUser();
        });
    }
    /**
     * Prompts to accept the invitation and will process the whole thing by
     * upgrading the user to be a seller.
     */
    BuyerDashboardPage.prototype.acceptInvitation = function () {
        var _this = this;
        var self = this;
        // initialize the Alert component
        var alert = ionic_angular_1.Alert.create({
            title: 'Be an associate?',
            message: 'Are you sure you want to be an associate which means you\'ll become a seller?',
            buttons: [{
                    text: 'Cancel',
                    handler: function (data) { }
                },
                {
                    text: 'Agree',
                    handler: function (data) {
                        // show a loader and re-login the user showing the buyer dashboard
                        var loading = ionic_angular_1.Loading.create({
                            content: "Working on it..."
                        });
                        // show the loader
                        _this.nav.present(loading);
                        self.pouchDb.getUser(_this.user.name, function (errUser, responseUser) {
                            if (errUser) {
                                if (errUser.name === 'not_found') {
                                }
                                else {
                                }
                            }
                            else {
                                // response is the user object
                                self.pouchDb.putUser(_this.user.name, {
                                    metadata: {
                                        roles: ['seller']
                                    }
                                }, function (errUser, responseUser) {
                                    if (errUser) {
                                        if (errUser.name === 'not_found') {
                                        }
                                        else {
                                        }
                                    }
                                    else {
                                        self.pouchDb.getUser(self.user.name, function (err, response) {
                                            console.log(err, response);
                                            // delete the password and salt
                                            delete response.password_scheme;
                                            delete response.salt;
                                            var newuser = JSON.stringify(response);
                                            // save user data to the local storage
                                            self.localStorage.setToLocal('user', newuser);
                                            // if no error redirect to seller dashboard now
                                            loading.dismiss();
                                            return self.nav.setRoot(seller_dashboard_1.SellerDashboardPage);
                                        });
                                    }
                                });
                            }
                        });
                    }
                }]
        });
        // render it
        this.nav.present(alert);
    };
    /**
     * Get user data from the local storage
     */
    BuyerDashboardPage.prototype.getUser = function () {
        var _this = this;
        this.localStorage.getFromLocal('user')
            .then(function (response) {
            // assign response to the class variable
            _this.user = JSON.parse(response);
            // check if there's an image property in the user object
            if (!_this.user.image) {
                _this.user.image = null;
            }
            // get history
            _this.getUserHistory();
        });
    };
    /**
     * Fetches the history of the user
     */
    BuyerDashboardPage.prototype.getUserHistory = function () {
        var self = this;
        var user = self.user;
        // set the headers
        var headers = new http_1.Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        // set the data needed by the api
        var param = {
            type: 'per_user',
            search: self.user.name
        };
        // perform request to the api
        self.http
            .get(self.apiEndpoint + 'history?type=' + param.type + '&search=' + param.search, {
            headers: headers
        })
            .map(function (response) { return response.json(); })
            .subscribe(function (data) {
            // loop the response
            for (var i in data.rows) {
                var item = data.rows[i].value;
                item.date = self.timeAgoFromEpochTime(new Date(data.rows[i].value.date));
                self.history.push(item);
            }
        }, function (error) {
            console.log(error);
        });
    };
    /**
     * Handles the emote being sent by the central device.
     */
    BuyerDashboardPage.prototype.handleEmotes = function (emotes) {
        var self = this;
        var seller = JSON.parse(emotes);
        // check if the seller already exists in the object
        if (self.sellers) {
            var existing = self.sellers.some(function (element) {
                return element._id === seller._id;
            });
            // if it doesn't exists, push it
            if (!existing) {
                self.sellers.push(seller);
            }
            // if it exists, update the current data
            if (existing) {
                var index;
                // get the index of the seller by looping all the sellers
                for (var s in self.sellers) {
                    if (self.sellers[s]._id == seller._id) {
                        index = s;
                        break;
                    }
                }
                // update
                self.zone.run(function () {
                    self.sellers[index] = seller;
                });
            }
        }
        // no sellers, just push it
        if (!self.sellers) {
            self.zone.run(function () {
                self.sellers.push(seller);
            });
        }
    };
    /**
     * Redirects to the update profile page
     */
    BuyerDashboardPage.prototype.goToUpdateProfilePage = function () {
        this.nav.push(buyer_update_profile_1.BuyerUpdateProfilePage);
    };
    /**
     * Rejects the associate invitation
     */
    BuyerDashboardPage.prototype.rejectInvitation = function () {
        var _this = this;
        var self = this;
        // show a confirmation alert
        var confirm = ionic_angular_1.Alert.create({
            title: 'Are you sure?',
            message: 'This will be gone forever if you remove this',
            buttons: [{
                    text: 'Cancel',
                    handler: function () { }
                },
                {
                    text: 'Remove',
                    handler: function () {
                        self.pouchDb.putUser(_this.user.name, {
                            metadata: { store_uuid: '', store_name: '' }
                        }, function (errUser, responseUser) {
                            if (errUser) {
                                if (errUser.name === 'not_found') {
                                }
                                else {
                                }
                            }
                            self.pouchDb.getUser(self.user.name, function (err, response) {
                                // delete the password and salt
                                delete response.password_scheme;
                                delete response.salt;
                                var newUser = JSON.stringify(response);
                                // save user data to the local storage
                                self.localStorage.setToLocal('user', newUser);
                                return self.nav.setRoot(BuyerDashboardPage);
                            });
                        });
                    }
                }]
        });
        // render
        this.nav.present(confirm);
    };
    /**
     * Show the Lookingfor modal
     */
    BuyerDashboardPage.prototype.showLookingforModal = function () {
        // initialize the modal
        var modal = ionic_angular_2.Modal.create(buyer_lookingfor_modal_1.BuyerLookingforModalPage);
        // render
        this.nav.present(modal);
    };
    BuyerDashboardPage.prototype.timeAgoFromEpochTime = function (epoch) {
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
    BuyerDashboardPage = __decorate([
        core_1.Component({
            templateUrl: 'build/pages/buyer-dashboard/buyer-dashboard.html',
            directives: [cheers_avatar_1.CheersAvatar],
            providers: [local_storage_provider_1.LocalStorageProvider]
        }),
        __param(5, core_1.Inject('CouchDBEndpoint')),
        __param(6, core_1.Inject('APIEndpoint')), 
        __metadata('design:paramtypes', [ionic_angular_1.Events, local_storage_provider_1.LocalStorageProvider, ionic_angular_1.NavController, http_1.Http, core_1.NgZone, String, String])
    ], BuyerDashboardPage);
    return BuyerDashboardPage;
}());
exports.BuyerDashboardPage = BuyerDashboardPage;
