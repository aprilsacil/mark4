import { Component, Inject } from '@angular/core';
import { Alert, Events, Loading, NavController } from 'ionic-angular';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';
import { BuyerDashboardPage } from '../buyer-dashboard/buyer-dashboard';
import { LoginPage } from '../login/login';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

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
    private db;
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
        this.db = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        var local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));

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
                    Authorization: 'Basic ' + window.btoa(this.user.name + ':' + this.relogin.password)
                }
            }
        };

        // login the user
        this.db.login(this.user.name, this.relogin.password, ajaxOpts, (err, response) => {
            console.log(err);
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
                            this.nav.setRoot(SellerDashboardPage);
                        });
                    }

                    // if buyer redirect to buyer dashboard
                    if(response.roles[0] === 'buyer') {
                        // broadcast event to start some event listeners
                        this.events.publish('peripheral:start');

                        // set the data to be advertised
                        var advertiseData = {
                            _id : response._id,
                            fullname: response.fullname,
                            name: response.name,
                            job_description: response.job_description,
                            company_name: response.company_name,
                            level: response.level
                        }

                        this.events.publish('peripheral:setData', advertiseData);

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
