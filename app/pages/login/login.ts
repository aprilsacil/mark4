import { Component, Inject } from '@angular/core';
import { Alert, Events, Loading, NavController } from 'ionic-angular';
import { BuyerSignupPage } from '../buyer-signup/buyer-signup';
import { BuyerDashboardPage } from '../buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

/*
  Generated class for the LoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/login/login.html',
  providers: [LocalStorageProvider]
})
export class LoginPage {
    private db;

    login = {
        username: <string> null,
        password: <string> null
    };

    constructor(
        private events: Events,
        private nav: NavController,
        private localStorage: LocalStorageProvider,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string
    ) {
        var self = this;
        this.db = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        let local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));
    }

    /**
     * Redirects to the buyer dashboard
     */
    goToBuyerDashboardPage() {
        this.nav.setRoot(BuyerDashboardPage);
    }

    /**
     * Redirects to the buyer signup page
     */
    goToBuyerSignupPage() {
        this.nav.push(BuyerSignupPage);
    }

    /**
     * Redirects to the seller dashboard
     */
    goToSellerDashboardPage() {
        this.nav.setRoot(SellerDashboardPage);
    }

    /**
     * Validates and submits the buyer data.
     */
    submitLogin(loginForm) {
        var self = this;

        // check if the form is not valid
        if (!loginForm.valid) {
            // prompt that something is wrong in the form
            let alert = Alert.create({
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
                    Authorization: 'Basic ' + window.btoa(this.login.username + ':' + this.login.password)
                }
            }
        };

        // login the user
        this.db.login(this.login.username, this.login.password, ajaxOpts, (err, response) => {
            console.log('login response', response);

            var loginResponse = response;

            if(!err) {
                // get user details
                this.db.getUser(loginResponse.name, (err, response) => {
                    console.log('get user response', response);

                    // delete the password and salt
                    delete response.password_scheme;
                    delete response.salt

                    var user = JSON.stringify(response);

                    // save user data to the local storage
                    self.localStorage.setToLocal('user', user);
                    self.localStorage.setToLocal('timestamp', Math.round(new Date().getTime()/1000));

                    // if seller redirect to seller dashboard
                    if(response.roles[0] === 'seller') {
                        // broadcast event to start some event listeners
                        this.events.publish('central:start', user);

                        // remove loader and set the root page
                        loading.dismiss().then(() => {
                            return self.goToSellerDashboardPage();
                        });
                    }

                    // if buyer redirect to buyer dashboard
                    if(response.roles[0] === 'buyer') {
                        // broadcast event to start some event listeners
                        this.events.publish('peripheral:start', user);

                        // remove loader and set the root page
                        loading.dismiss().then(() => {
                            return self.goToBuyerDashboardPage();
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
}
