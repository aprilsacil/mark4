import { Component, Inject } from '@angular/core';
import { Alert, Loading, NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { BuyerSignupPage } from '../buyer-signup/buyer-signup';
import { BuyerDashboardPage } from '../buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

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
    private db;
    seller = {
        username: <string> null,
        password: <string> null,
        name: <string> null,
        store_name: <string> null
    };

    constructor(
        private nav: NavController,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string
    ) {
        var self = this;
        // couch db integration
        this.db = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        let local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));
    }

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

        this.db.signup(this.seller.username, this.seller.password, {
            metadata : {
                store_name: this.seller.store_name,
                fullname : this.seller.name,
                level: 0,
                roles : ['seller'],
            }
        }, (err, response) => {
            if(!err) {
                // TODO: add a success thingy here
                loading.dismiss().then(() => {
                    self.goToLoginPage();
                });

                return;
            }

            // there's an error
            var message;

            // check what type of error has occurred
            switch (err.name) {
                case 'conflict':
                    message = 'Username already exists.';
                    break;
                case 'forbidden':
                default:
                    message = 'Something went wrong. Please try again later.';
                    break;
            }

            var alert = Alert.create({
                title: 'Error!',
                subTitle: message,
                buttons: ['OK']
            });

            loading.dismiss().then(() => {
                // render alert once the loader dismisses
                self.nav.present(alert);
            });

            return;
        });
    }
}
