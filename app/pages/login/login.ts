import { Component } from '@angular/core';
import { Alert, Loading, NavController } from 'ionic-angular';
import { BuyerSignupPage } from '../buyer-signup/buyer-signup';
import { BuyerDashboardPage } from '../buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

/*
  Generated class for the LoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/login/login.html',
})
export class LoginPage {
    private db;
    login = { username: <string> null, password: <string> null };

    constructor(private nav: NavController) {
        var self = this;
        this.db = new PouchDB('http://localhost:5984/cheers', {skipSetup: true});

        // local integration
        let local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));

        this.db.getSession(function (err, response) {
            if (err) {
                // network error
            }

            if (response.userCtx.name) {
                // if seller redirect to seller dashboard
                if(response.userCtx.roles[0] == 'seller') {
                    self.goToSellerDashboardPage();
                }

                // if buyer redirect to buyer dashboard
                if(response.userCtx.roles[0] == 'buyer') {
                    self.goToBuyerDashboardPage();
                }
            }
        });

    }

    /**
     * Redirects to the buyer dashboard
     */
    goToBuyerDashboardPage() {
        this.nav.push(BuyerDashboardPage);
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
        this.nav.push(SellerDashboardPage);
    }

    /**
     * Validates and submits the buyer data.
     */
    submitLogin(loginForm) {
        var self = this;
        // check if the form is not valid
        /**if (!loginForm.valid) {
            // prompt that something is wrong in the form
            let alert = Alert.create({
                title: 'Ooops...',
                subTitle: 'Something is wrong. Make sure the form fields are properly filled in.',
                buttons: ['OK']
            });

            // render in the template
            this.nav.present(alert);
            return;
        }*/

        this.db.login(this.login.username, this.login.password, function (err, response) {
            if(!err) {
                self.goToBuyerDashboardPage();
            } else {
                console.log(err);
                // prompt that something is wrong in the form
                let alert = Alert.create({
                    subTitle: err.message
                });

                // render in the template
                self.nav.present(alert);
                return;
            }
        });

        // process the signup thing
        // validate
    }
}
