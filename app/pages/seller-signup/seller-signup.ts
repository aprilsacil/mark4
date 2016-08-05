import { Component, Inject } from '@angular/core';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
import { Alert, Loading, NavController } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { BuyerSignupPage } from '../buyer-signup/buyer-signup';
import { BuyerDashboardPage } from '../buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

/*
  Generated class for the SellerSignupPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-signup/seller-signup.html'
})
export class SellerSignupPage {
    localDb: any;
    pouchDb: any;
    seller = {
        username: <string> null,
        password: <string> null,
        name: <string> null,
        store_name: <string> null,
        roles: null,
        level: null,
        registration_id: null
    };

    constructor(
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private http: Http,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {}

    /**
     * Redirects to the login page
     */
    goToLoginPage() {
        this.nav.push(LoginPage);
    }

    /**
     * Redirects to the buyer
     */
    goToBuyerSignupPage() {
        this.nav.push(BuyerSignupPage);
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
     * Validates and submits the data of the seller.
     */
    submitSellerForm(sellerForm) {
        var self = this;

        // check if the form is not valid
        if (!sellerForm.valid) {
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

        // get registration id
        this.localStorage.getFromLocal('registration_id').then((id) => {
            this.seller.registration_id = id || '';
        
            this.seller.roles = 'seller';
            this.seller.level = 0;
        
            this.http
                .post(this.apiEndpoint + 'register', this.seller, {headers: headers})
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

                    return;
                }, (error) => {
                   loading.dismiss().then(() => {
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
               });
            });
    }
}
