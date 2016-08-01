import { Component, Inject } from '@angular/core';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
import { Alert, Events, Loading, NavController } from 'ionic-angular';

import { BuyerDashboardPage } from '../buyer-dashboard/buyer-dashboard';
import { LoginPage } from '../login/login';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { Buyer } from '../../models/buyer';
import { Seller } from '../../models/seller';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

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
    user = {
        name: <string> null,
        image: <string> null
    };

    relogin = {
        password: <string> null
    }

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private http: Http,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {
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

        var headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        var param = {
            username: this.user.name,
            password: this.relogin.password
        };

        this.http
            .post(this.apiEndpoint + 'authenticate', param, {headers: headers})
            .map(response => response.json())
            .subscribe((data) => {
                if(data.error) {
                    // remove the loader
                    loading.dismiss().then(() => {
                        // show an alert
                        setTimeout(() => {
                            var alert = Alert.create({
                                title: 'Error!',
                                subTitle: data.errors[0],
                                buttons: ['OK']
                            });

                            // render in the template
                            self.nav.present(alert);
                        }, 300);
                    });

                    return;
                }

                var user = data.user;

                // set the timestamp
                self.localStorage.setToLocal('timestamp', Math.round(new Date().getTime()/1000));

                // if seller redirect to seller dashboard
                if(user.roles[0] === 'seller') {
                    /// save user data to the local storage
                    self.localStorage.setToLocal('user', JSON.stringify(new Seller(user)));

                    // broadcast event to start some event listeners
                    this.events.publish('central:start', JSON.stringify(new Seller(user)));

                    // remove loader and set the root page
                    loading.dismiss().then(() => {
                        this.nav.setRoot(SellerDashboardPage);
                    });
                }

                // if buyer redirect to buyer dashboard
                if(user.roles[0] === 'buyer') {
                    var buyer = new Buyer(user);

                    // save user data to the local storage
                    self.localStorage.setToLocal('user', JSON.stringify(buyer));

                    // broadcast event to start some event listeners
                    this.events.publish('peripheral:start');

                    // set the data to be advertised
                    var advertiseData = {
                        _id : buyer._id,
                        fullname: buyer.fullname,
                        name: buyer.name,
                        job_description: buyer.job_description,
                        company_name: buyer.company_name,
                        level: buyer.level
                    }

                    // let's advertise
                    this.events.publish('peripheral:set_buyer_data', advertiseData);

                    // remove loader and set the root page
                    loading.dismiss().then(() => {
                        this.nav.setRoot(BuyerDashboardPage);
                    });
                }
            });
    }

    /**
     * Unsubscribe to all central and peripheral events
     */
    unsubscribeEvents() {
        // central
        this.events.unsubscribe('central:start', () => {});
        this.events.unsubscribe('central:start_scan', () => {});
        this.events.unsubscribe('central:stop_scan', () => {});
        this.events.unsubscribe('central:write', () => {});
        this.events.unsubscribe('central:buyers_nearby', () => {});

        // peripheral
        this.events.unsubscribe('peripheral:start', () => {});
        this.events.unsubscribe('peripheral:buyers_nearby', () => {});

        // user events
        this.events.unsubscribe('user:update_details', () => {});
    }
}
