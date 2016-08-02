import { Component, Inject, NgZone } from '@angular/core';
import { Alert, Events, Loading, NavController } from 'ionic-angular';
import { Modal, ViewController } from 'ionic-angular';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';

import { BuyerUpdateProfilePage } from '../buyer-update-profile/buyer-update-profile';
import { BuyerLookingforModalPage } from '../buyer-lookingfor-modal/buyer-lookingfor-modal';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { CheersAvatar } from '../../components/cheers-avatar/cheers-avatar';

import { SortBy } from '../../pipes/sort-by';
import { TimeAgo } from '../../pipes/time-ago';

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
    pipes: [SortBy, TimeAgo],
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

    // set the headers
    headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
    });

    invitation = {
        store_name : <string> null,
        store_image : <string> null,
        store_uuid : <string> null
    };

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
        this.getUser();

        // listens for buyers that sends out an emote
        this.events.subscribe('peripheral:buyers_nearby',
            (eventData) => this.handleEmotes(eventData[0]));

        // listens for changes in the user details
        this.events.subscribe('user:update_details', () => this.getUser());
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

                    // set the data needed by the api
                    var param = this.user;
                    var invi = {
                        store_name : this.invitation.store_name,
                        store_image : this.invitation.store_image,
                        store_uuid: this.invitation.store_uuid,
                        invitation: true
                    };

                    param.roles = 'seller';
                    param.store = invi;

                    // perform request to the api
                    self.http
                        .post(
                            self.apiEndpoint + 'update?user=' + self.user.name + '&token=' + self.user.auth,
                            param, { headers: self.headers })
                        .map(response => response.json())
                        .subscribe((data) => {
                            // save user data to the local storage
                            delete param.store.invitation;
                            self.localStorage.setToLocal('user', JSON.stringify(param));

                            // if no error redirect to seller dashboard now
                            loading.dismiss();

                            return self.nav.setRoot(SellerDashboardPage);
                        }, (error) => {
                            // show an alert
                            setTimeout(() => {
                                var alert = Alert.create({
                                    title: 'Error!',
                                    subTitle: 'It seems we cannot process your request. Make sure you are connected to the internet to proceed.',
                                    buttons: ['OK']
                                });

                                // render in the template
                                self.nav.present(alert);
                            }, 300);
                        });
                }
            }]
        });

        // render it
        this.nav.present(alert);
    }

    /**
     * Get user Invitation
     */
    getInvitation() {
        var self = this;

        // set the data needed by the api
        var param = {
            type: 'per_user',
            search: self.user.name
        };

        // perform request to the api
        self.http
            .get(
                self.apiEndpoint + 'invitation?user=' + param.search + '&token=' + self.user.auth + 
                '&type=' + param.type + '&search=' + param.search, { headers: self.headers })
            .map(response => response.json())
            .subscribe((data) => {
                if(data.rows.length) {
                    this.invitation = data.rows[0].value;
                }
            }, (error) => {
                console.log('getInvitation error:', error);
            });
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

                // get invitation
                this.getInvitation();

                // start long polling
                this.historyPolling();
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
                // check if there's a response or something
                if (!data || !data.total_rows) {
                    return;
                }

                // clear history
                self.history = [];

                // loop
                for (var r in data.rows) {
                    self.history.push(data.rows[r].value);
                }
            }, (error) => {
                console.log(error);
            });
    }

    /**
     * Handles the emote being sent by the central device.
     */
    handleEmotes(emotes) {
        var self     = this,
            exists   = false,
            seller   = JSON.parse(emotes);

        if (!seller) {
            return;
        }

        seller = new Seller(seller);

        // check if there are lists of sellers
        if (self.sellers || self.sellers.length !== 0) {
            // check if the incoming seller data already exists in the seller lists
            for (var s in self.sellers) {
                // check if the ids are the same
                if (self.sellers[s]._id == seller._id) {
                    // update the object
                    self.zone.run(() => {
                        self.sellers[s] = seller;
                    });

                    // flag that the seller already exists
                    exists = true;
                    break;
                }
            }
        }

        // no shoppers or the incoming seller data is new, just push it
        if (!self.sellers.length || !exists) {
            self.zone.run(() => {
                self.sellers.push(seller);

                // notify
                self.events.publish('app:local_notifications', {
                    title: 'There is a seller nearby!',
                    text: seller.store_name + ' says: ' + seller.emote_message
                });
            });
        }
    }

    /**
     * User History Long Polling
     */
    historyPolling() {
        // TODO: check if the user is connected

        setInterval(() => {
            console.log('fetching...');
            this.getUserHistory();

            // get invitation
            this.getInvitation();
        }, 30000);
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
