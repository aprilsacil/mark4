import { Component, Inject } from '@angular/core';
import { Alert, Events, Loading, NavController } from 'ionic-angular';
import { Modal, ViewController } from 'ionic-angular';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';

import { BuyerUpdateProfilePage } from '../buyer-update-profile/buyer-update-profile';
import { BuyerLookingforModalPage } from '../buyer-lookingfor-modal/buyer-lookingfor-modal';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { CheersAvatar } from '../../components/cheers-avatar/cheers-avatar';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

/*
  Generated class for the BuyerDashboardPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/buyer-dashboard/buyer-dashboard.html',
    directives: [CheersAvatar],
    providers: [LocalStorageProvider]
})
export class BuyerDashboardPage {
    localDb: any;
    pouchDb: any;
    user = {
        _id: <string> null,
        name: <string> null,
        fullname: <string> null,
        store_name: <string> null,
        job_description: <string> null,
        company_name: <string> null,
        image: <string> null,
        level: <number> 0,
        roles: <any> []
    };

    history: any[] = [];
    sellers: any[] = [];
    associate = {
        username: <string> null,
        roles: <string> null
    }

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private http: Http,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {
        // couch db integration
        this.pouchDb = new PouchDB(this.couchDbEndpoint + 'cheers', { skipSetup: true });

        // local integration
        this.localDb = new PouchDB('cheers');

        // this will sync locally
        this.localDb.sync(this.pouchDb, {live: true, retry: true})
            .on('error', console.log.bind(console));

        // get user details that is saved in the local storage then get the
        // user history
        this.localStorage.getFromLocal('user')
            .then((response) => {
                // assign response to the class variable
                this.user = JSON.parse(response);

                // check if there's an image property in the user object
                if (!this.user.image) {
                    this.user.image = null;
                }

                // get history
                this.getUserHistory();
            });

        // listens for buyers that sends out an emote
        this.events.subscribe('peripheral:emoteFound',
            (eventData) => this.handleEmotes(eventData[0]));
    }

    /**
     * Prompts to accept the invitation and will process the whole thing by
     * upgrading the user to be a seller.
     */
    acceptInvitation() {
        var self = this;

        // initialize the Alert component
        var alert = Alert.create({
            title: 'Be an associate?',
            message: 'Are you sure you want to be an associate which means you\'ll become a seller?',
            buttons: [{
                text: 'Cancel',
                handler: data => {}
            },
            {
                text: 'Agree',
                handler: data => {
                    // show a loader and re-login the user showing the buyer dashboard
                    var loading = Loading.create({
                        content: "Working on it..."
                    });

                    // show the loader
                    this.nav.present(loading);

                    self.pouchDb.getUser(this.user.name, (errUser, responseUser) => {
                        if (errUser) {
                            if (errUser.name === 'not_found') {
                              // typo, or you don't have the privileges to see this user
                            } else {
                              // some other error
                            }
                        } else {
                            // response is the user object
                            self.pouchDb.putUser(this.user.name, {
                                metadata : { roles: ['seller'] }
                            }, (errUser, responseUser) => {
                                if (errUser) {
                                    if (errUser.name === 'not_found') {
                                      // typo, or you don't have the privileges to see this user
                                    } else {
                                      // some other error
                                    }
                                } else {
                                    self.pouchDb.getUser(self.user.name, (err, response) => {
                                    console.log(err, response);
                                        // delete the password and salt
                                        delete response.password_scheme;
                                        delete response.salt

                                        var newuser = JSON.stringify(response);

                                        // save user data to the local storage
                                        self.localStorage.setToLocal('user', newuser);

                                        // if no error redirect to seller dashboard now
                                        loading.dismiss();

                                        return self.nav.setRoot(SellerDashboardPage);
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
    }

    /**
     * Fetches the history of the user
     */
    getUserHistory() {
        var self = this;
        var user = self.user;

        // set the headers
        var headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        // set the data needed by the api
        var param = {
            type: 'per_user',
            search: self.user.name
        };

        // perform request to the api
        self.http
            .get(
                self.apiEndpoint + 'history?type=' + param.type + '&search=' + param.search, {
                    headers: headers
                })
            .map(response => response.json())
            .subscribe((data) => {
                // loop the response
                for ( var i in data.rows ) {
                    var item = data.rows[i].value;
                    item.date = self.timeAgoFromEpochTime(new Date(data.rows[i].value.date));

                    self.history.push(item);
                }
            }, (error) => {
                console.log(error);
            });
    }

    /**
     * Handles the emote being sent by the central device.
     */
    handleEmotes(emotes) {
        var self     = this;
        var seller   = JSON.parse(emotes);

        // check if the seller already exists in the object
        if (self.sellers) {
            var existing = self.sellers.some((element) => {
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
                self.sellers[index] = seller;
            }
        }

        // no sellers, just push it
        if (!self.sellers) {
            self.sellers.push(seller);
        }
    }

    /**
     * Redirects to the update profile page
     */
    goToUpdateProfilePage() {
        this.nav.push(BuyerUpdateProfilePage);
    }

    /**
     * Rejects the associate invitation
     */
    rejectInvitation() {
        var self = this;

        // show a confirmation alert
        var confirm = Alert.create({
            title: 'Are you sure?',
            message: 'This will be gone forever if you remove this',
            buttons: [{
                text: 'Cancel',
                handler: () => {}
            },
            {
                text: 'Remove',
                handler: () => {
                    self.pouchDb.putUser(this.user.name, {
                        metadata : { store_uuid: '', store_name: '' }
                    }, (errUser, responseUser) => {
                        if (errUser) {
                            if (errUser.name === 'not_found') {
                              // typo, or you don't have the privileges to see this user
                            } else {
                              // some other error
                            }
                        }

                        self.pouchDb.getUser(self.user.name, (err, response) => {
                            // delete the password and salt
                            delete response.password_scheme;
                            delete response.salt

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
    }

    /**
     * Show the Lookingfor modal
     */
    showLookingforModal() {
        // initialize the modal
        var modal = Modal.create(BuyerLookingforModalPage);

        // render
        this.nav.present(modal);
    }

    timeAgoFromEpochTime(epoch) {
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
    }
}
