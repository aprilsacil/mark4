import { Component } from '@angular/core';
import { Alert, Loading, NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { SellerSignupPage } from '../seller-signup/seller-signup';
import { BuyerDashboardPage } from '../buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';
// import { PouchService } from '../../providers/pouch-service/pouch-service';

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
    private db;
    buyer = {
        username: <string> null,
        password: <string> null,
        name: <string> null
    };

    constructor( private nav: NavController ) {
        // couch db integration
        this.db = new PouchDB('http://localhost:5984/cheers', {skipSetup: true});

        // local integration
        var local = new PouchDB('cheers');

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

        this.db.signup(this.buyer.username, this.buyer.password, {
            metadata : {
                fullname : this.buyer.name,
                roles : ['buyer']
            }
        }, (err, response) => {
            console.log('signup response: ', response);

            if(!err) {
                // no error, go to login page
                // TODO: put a toast or something to tell the user that he/she is
                // logged in.
                self.goToLoginPage();
                return;
            }

            // there's an error, handle it

            var message;

            switch (err.name) {
                case 'conflict':
                    message = 'Username already exists.';
                    break;
                case 'forbidden':
                    message = 'Something went wrong. Please try again later.';
                    break;
            }

            var alert = Alert.create({
                title: 'Error!',
                subTitle: message,
                buttons: ['OK']
            });

            // render in the template
            self.nav.present(alert);
            return;
        });
    }
}
