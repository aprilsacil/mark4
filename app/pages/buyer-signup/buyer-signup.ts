import { Component, Inject } from '@angular/core';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
import { Alert, Loading, NavController } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { SellerSignupPage } from '../seller-signup/seller-signup';
import { BuyerDashboardPage } from '../buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

/*
  Generated class for the BuyerSignupPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/buyer-signup/buyer-signup.html'
})
export class BuyerSignupPage {
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
    ) {}

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

        // set request header
        var headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        // set the role and the level
        this.buyer.roles = 'buyer';
        this.buyer.level = 0;

        // perform request
        this.http
            .post(this.apiEndpoint + 'register', this.buyer, { headers: headers })
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
            },
            (error) => {
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
    }
}
