import { Component, Inject } from '@angular/core';
import { Alert, Events, Loading, NavController } from 'ionic-angular';
import { Modal, ViewController } from 'ionic-angular';
import { BuyerUpdateProfilePage } from '../buyer-update-profile/buyer-update-profile';
import { BuyerLookingforModalPage } from '../buyer-lookingfor-modal/buyer-lookingfor-modal';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
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
    providers: [LocalStorageProvider]
})
export class BuyerDashboardPage {
    private db;
    private history = [];
    user = { name: <string> null };
    sellers = [];
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
        this.db = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        var local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));

        this.localStorage.getFromLocal('user').then((data) => {
            this.user = JSON.parse(data);

            let headers = new Headers({
              'Content-Type': 'application/x-www-form-urlencoded'});

            var param = {
              type:'per_user',
              search:this.user.name
            };

            this.http
                .get(this.apiEndpoint + 'history?type=' + param.type +
                    '&search=' + param.search, {headers: headers})
                .map(response => response.json())
                .subscribe((data) => {
                    for ( var i in data.rows ) {
                        var item = data.rows[i].value;
                        item.date = this.timeAgoFromEpochTime(new Date(data.rows[i].value.date));

                        this.history.push(item);
                    }

                    console.log(this.history);

                }, (error) => {
                  console.log(error);
                });
        });

        // listens for buyers that sends out an emote
        this.events.subscribe('peripheral:emoteFound', (eventData) => {
            // var seller = {
            //     _id: <string> null
            // };

            console.log('ev', eventData);

            var seller = JSON.parse(eventData[0]);

            // check if the seller already exists in the object
            if (this.sellers) {
                var existing = this.sellers.some((element) => {
                    return element._id === seller._id;
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
                        if (this.sellers[s]._id == seller._id) {
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

                    self.db.getUser(this.user.name, (errUser, responseUser) => {
                        if (errUser) {
                            if (errUser.name === 'not_found') {
                              // typo, or you don't have the privileges to see this user
                            } else {
                              // some other error
                            }
                        } else {
                            // response is the user object
                            self.db.putUser(this.user.name, {
                                metadata : { roles: ['seller'] }
                            }, function (errUser, responseUser) {
                                if (errUser) {
                                    if (errUser.name === 'not_found') {
                                      // typo, or you don't have the privileges to see this user
                                    } else {
                                      // some other error
                                    }
                                } else {
                                    self.db.getUser(self.user.name, (err, response) => {
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
     * Redirects to the update profile page
     */
    goToUpdateProfilePage() {
        this.nav.push(BuyerUpdateProfilePage);
    }

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
                    self.db.putUser(this.user.name, {
                        metadata : { store_uuid: '', store_name: '' }
                    }, function (errUser, responseUser) {
                        if (errUser) {
                            if (errUser.name === 'not_found') {
                              // typo, or you don't have the privileges to see this user
                            } else {
                              // some other error
                            }
                        }

                        self.db.getUser(self.user.name, (err, response) => {
                            // delete the password and salt
                            delete response.password_scheme;
                            delete response.salt

                            var newuser = JSON.stringify(response);

                            // save user data to the local storage
                            self.localStorage.setToLocal('user', newuser);
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
