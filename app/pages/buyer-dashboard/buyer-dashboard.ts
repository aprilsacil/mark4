import { Component, Inject } from '@angular/core';
import { Alert, Events, Loading, NavController } from 'ionic-angular';
import { Modal, ViewController } from 'ionic-angular';
import { BuyerUpdateProfilePage } from '../buyer-update-profile/buyer-update-profile';
import { BuyerLookingforModalPage } from '../buyer-lookingfor-modal/buyer-lookingfor-modal';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

/*
  Generated class for the BuyerDashboardPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/buyer-dashboard/buyer-dashboard.html',
    providers: [LocalStorageProvider]
})
export class BuyerDashboardPage {
    private db;
    user: Object = {};
    sellers = [];
    associate = {
        username: <string> null,
        roles: <string> null
    }

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string
    ) {
        // couch db integration
        this.db = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        var local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));

        this.localStorage.getFromLocal('user').then((data) => {
            this.user = JSON.parse(data);
        });

        // listens for buyers that sends out an emote
        this.events.subscribe('peripheral:emoteFound', (eventData) => {
            var seller = {
                name: <string> null
            };

            console.log('ev', eventData);

            // convert the encoded data to object
            // split by ampersand
            var encodedData = eventData[0].split('&');

            // loop
            encodedData.forEach((data) => {
                // split by equal sign
                data = data.split('=');

                seller[data[0]] = decodeURIComponent(data[1] || '');
            });

            // check if the seller already exists in the object
            if (this.sellers) {
                var existing = this.sellers.some((element) => {
                    return element.name === seller.name;
                });

                // if it doesn't exists, push it
                if (!existing) {
                    this.sellers.push(seller);
                }

                // if it exists, update the current data
                if (existing) {
                    var index;

                    // get the index of the seller by looping all the sellers
                    for (var s in this.sellers) {
                        if (this.sellers[s].name == seller.name) {
                            index = 0;
                            break;
                        }
                    }

                    // update
                    this.sellers[index] = seller;
                }
            }

            // no sellers, just push it
            if (!this.sellers) {
                this.sellers.push(seller);
            }
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

                    this.db.getSession((errSession, responseSession) => {
                        if (errSession) {
                            // network error
                        } else if (!responseSession.userCtx.name) {
                            // nobody's logged in
                        } else {
                            // response.userCtx.name is the current user
                            // get user info
                            self.db.getUser(responseSession.userCtx.name, (errUser, responseUser) => {
                                if (errUser) {
                                    if (errUser.name === 'not_found') {
                                      // typo, or you don't have the privileges to see this user
                                    } else {
                                      // some other error
                                    }
                                } else {
                                    // response is the user object
                                    self.db.putUser(responseSession.userCtx.name, {
                                        metadata : { roles: ['seller'], store_name: 'Store Name' }
                                    }, function (errUser, responseUser) {
                                        if (errUser) {
                                            if (errUser.name === 'not_found') {
                                              // typo, or you don't have the privileges to see this user
                                            } else {
                                              // some other error
                                            }
                                        } else {
                                            // if no error redirect to seller dashboard now
                                            loading.dismiss();

                                            return self.nav.setRoot(SellerDashboardPage);
                                        }
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
     * Redirects to the update profile page
     */
    goToUpdateProfilePage() {
        this.nav.push(BuyerUpdateProfilePage);
    }

    rejectInvitation() {
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
                    // TODO: remove the selected invitation
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
