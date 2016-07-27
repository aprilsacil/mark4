import { Component, Inject } from '@angular/core';
import { Alert, Events, Loading, NavController } from 'ionic-angular';

import { BuyerDashboardPage } from '../buyer-dashboard/buyer-dashboard';
import { LoginPage } from '../login/login';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { Buyer } from '../../models/buyer';
import { Seller } from '../../models/seller';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

/*
  Generated class for the ReloginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/relogin/relogin.html',
    providers: [LocalStorageProvider]
})
export class ReloginPage {
    localDb: any;
    pouchDb: any;
    user = {
        name: <string> null
    };

    relogin = {
        password: <string> null
    }

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string
    ) {
        this.pouchDb = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        this.localDb = new PouchDB('cheers');

        // this will sync locally
        this.localDb.sync(this.pouchDb, {live: true, retry: true})
            .on('error', console.log.bind(console));

        // get user
        this.localStorage.getFromLocal('user').then((data) => {
            this.user = JSON.parse(data);
        });
    }

    /**
     * "Logs out" the current user and redirects to the login page
     */
    changeUser() {
        var self = this;

        // unsubscribe events
        self.unsubscribeEvents();

        // remove from the local storage
        self.localStorage.removeFromLocal('user');

        // set to login page
        self.nav.setRoot(LoginPage);
    }

    /**
     * Validates and autheticate the data provided.
     */
    verifyRelogin(reloginForm) {
        var self = this;

        // check if the form is not valid
        if (!reloginForm.valid) {
            // prompt that something is wrong in the form
            var alert = Alert.create({
                title: 'Ooops...',
                subTitle: 'Something is wrong. Make sure the form fields are properly filled in.',
                buttons: ['OK']
            });

            // render in the template
            this.nav.present(alert);
            return;
        }

        // show a loader
        var loading = Loading.create({
            content: 'Logging in...'
        });

        // render in the template
        this.nav.present(loading);

        // provide some ajax headers for authorization
        var ajaxOpts = {
            ajax: {
                headers: {
                    Authorization: 'Basic ' + window.btoa(this.user.name + ':' + this.relogin.password)
                }
            }
        };

        // login the user
        this.pouchDb.login(this.user.name, this.relogin.password, ajaxOpts, (err, response) => {
            console.log(err);
            console.log('login response', response);

            var loginResponse = response;

            if(!err) {
                // get user details
                this.pouchDb.getUser(loginResponse.name, (err, response) => {
                    console.log('get user response', response);

                    // delete the password and salt
                    delete response.password_scheme;
                    delete response.salt

                    var user = response;

                     // set the timestamp
                    self.localStorage.setToLocal('timestamp', Math.round(new Date().getTime()/1000));

                    // if seller redirect to seller dashboard
                    if(response.roles[0] === 'seller') {
                        // save user data to the local storage
                        self.localStorage.setToLocal('user', JSON.stringify(new Seller(user)));

                        // broadcast event to start some event listeners
                        this.events.publish('central:start', JSON.stringify(new Seller(user)));

                        // remove loader and set the root page
                        loading.dismiss().then(() => {
                            this.nav.setRoot(SellerDashboardPage);
                        });
                    }

                    // if buyer redirect to buyer dashboard
                    if(response.roles[0] === 'buyer') {
                        // save user data to the local storage
                        self.localStorage.setToLocal('user', JSON.stringify(new Buyer(user)));

                        // broadcast event to start some event listeners
                        this.events.publish('peripheral:start');

                        // let's advertise
                        this.events.publish('peripheral:setData', JSON.stringify(new Buyer(user)));

                        // remove loader and set the root page
                        loading.dismiss().then(() => {
                            this.nav.setRoot(BuyerDashboardPage);
                        });
                    }
                });

                return;
            }

            // remove the loader
            loading.dismiss().then(() => {
                var message;

                // check the error message
                switch (err.message) {
                    case 'ETIMEDOUT':
                        message = 'Can\'t connect to the server. Please try again.';
                        break;
                    default:
                        message = err.message;
                        break;
                }

                // check status number
                if (err.status == 500) {
                    message = 'Something is wrong while processing your request. Please try again later.';
                }

                // show an alert
                setTimeout(() => {
                    var alert = Alert.create({
                        title: 'Error!',
                        subTitle: message,
                        buttons: ['OK']
                    });

                    // render in the template
                    self.nav.present(alert);
                }, 300);
            });


            return;
        });
    }

    /**
     * Unsubscribe to all central and peripheral events
     */
    unsubscribeEvents() {
        // central
        this.events.unsubscribe('central:start', () => {});
        this.events.unsubscribe('central:startScan', () => {});
        this.events.unsubscribe('central:stopScan', () => {});
        this.events.unsubscribe('central:write', () => {});
        this.events.unsubscribe('central:buyersNearby', () => {});

        // peripheral
        this.events.unsubscribe('peripheral:start', () => {});
        this.events.unsubscribe('peripheral:emoteFound', () => {});
    }
}
