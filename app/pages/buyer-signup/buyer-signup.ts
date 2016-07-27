import { Component, Inject } from '@angular/core';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
import { Alert, Loading, NavController } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { SellerSignupPage } from '../seller-signup/seller-signup';
import { BuyerDashboardPage } from '../buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

/*
  Generated class for the BuyerSignupPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/buyer-signup/buyer-signup.html'
})
export class BuyerSignupPage {
    localDb: any;
    pouchDb: any;
    buyer = {
        username: <string> null,
        password: <string> null,
        name: <string> null,
        roles: null,
        level: null
    };

    constructor(
        private nav: NavController,
        private http: Http,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {
        // couch db integration
        this.pouchDb = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        this.localDb = new PouchDB('cheers');

        // this will sync locally
        this.localDb.sync(this.pouchDb, {live: true, retry: true})
            .on('error', console.log.bind(console));
    }

    /**
     * Redirects to the login page
     */
    goToLoginPage() {
        this.nav.push(LoginPage, { go_back: true });
    }

    /**
     * Redirects to the seller signup page
     */
    goToStoreSignupPage() {
        this.nav.push(SellerSignupPage);
    }

    /**
     * Redirects to the seller dashboard
     */
    goToSellerDashboardPage() {
        this.nav.push(SellerDashboardPage);
    }

    /**
     * Redirects to the buyer dashboard
     */
    goToBuyerDashboardPage() {
        this.nav.push(BuyerDashboardPage);
    }

    /**
     * Validates and submits the buyer data.
     */
    submitSignupForm(buyerSignupForm) {
        var self = this;

        // check if the form is not valid
        if (!buyerSignupForm.valid) {
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

        // initialize the loader
        var loading = Loading.create({
            content: 'Processing...'
        });

        // render loader
        self.nav.present(loading);

        var headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        this.buyer.roles = 'buyer';
        this.buyer.level = 0;

        this.http
            .post(this.apiEndpoint + 'register', this.buyer, {headers: headers})
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

                loading.dismiss().then(() => {
                    self.goToLoginPage();
                });
            });
    }
}
