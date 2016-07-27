import { Component, Inject } from '@angular/core';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
import { Alert, Events, Loading, NavController, NavParams } from 'ionic-angular';

import { BuyerSignupPage } from '../buyer-signup/buyer-signup';
import { BuyerDashboardPage } from '../buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { Buyer } from '../../models/buyer';
import { Seller } from '../../models/seller';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

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
    localDb: any;
    pouchDb: any;
    login = {
        username: <string> null,
        password: <string> null
    };
    goBack = false;

    constructor(
        private events: Events,
        private nav: NavController,
        private params: NavParams,
        private localStorage: LocalStorageProvider,
        private http: Http,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {
        this.pouchDb = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        this.localDb = new PouchDB('cheers');

        // this will sync locally
        this.localDb.sync(this.pouchDb, {live: true, retry: true})
            .on('error', console.log.bind(console));

        this.goBack = this.params.get('go_back') || false;
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
        console.log(this.goBack);

        if (this.goBack) {
            return this.nav.pop();
        }

        return this.nav.push(BuyerSignupPage);
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

        this.http
            .post(this.apiEndpoint + 'authenticate', this.login, {headers: headers})
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
                    // save user data to the local storage
                    self.localStorage.setToLocal('user', JSON.stringify(new Seller(user)));

                    // broadcast event to start some event listeners
                    this.events.publish('central:start', JSON.stringify(new Seller(user)));

                    // remove loader and set the root page
                    loading.dismiss().then(() => {
                        return self.goToSellerDashboardPage();
                    });
                }

                // if buyer redirect to buyer dashboard
                if(user.roles[0] === 'buyer') {
                    var buyer = new Buyer(user);

                    // save user data to the local storage
                    self.localStorage.setToLocal('user', JSON.stringify(buyer));

                    // broadcast event to start some event listeners
                    this.events.publish('peripheral:start');

                    // set data to advertise
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
                        return self.goToBuyerDashboardPage();
                    });
                }
            });
    }
}
