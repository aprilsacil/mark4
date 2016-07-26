import { Component, Inject, NgZone } from '@angular/core';
import { Alert, Events, Loading, NavController } from 'ionic-angular';
import { Modal, ViewController } from 'ionic-angular';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';

import { BuyerUpdateProfilePage } from '../buyer-update-profile/buyer-update-profile';
import { BuyerLookingforModalPage } from '../buyer-lookingfor-modal/buyer-lookingfor-modal';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { CheersAvatar } from '../../components/cheers-avatar/cheers-avatar';

import { Buyer } from '../../models/buyer';
import { Seller } from '../../models/seller';

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
    user = new Buyer({});

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
        private zone: NgZone,
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
        this.getUser()

        // listens for buyers that sends out an emote
        this.events.subscribe('peripheral:emoteFound',
            (eventData) => this.handleEmotes(eventData[0]));

        // listens for changes in the user details
        this.events.subscribe('user:update_details', () => {
            // get user details again from the local storage
            this.getUser();
        });
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
                                metadata : {
                                    roles: ['seller']
                                }
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
     * Get user data from the local storage
     */
    getUser() {
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
                    self.history.push(data.rows[i].value);
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
                self.zone.run(() => {
                    self.sellers[index] = seller;
                });
            }
        }

        // no sellers, just push it
        if (!self.sellers) {
            self.zone.run(() => {
                self.sellers.push(seller);
            });
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
}
