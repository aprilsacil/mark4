import { Component } from '@angular/core';
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

    constructor(private nav: NavController) {
        var self = this;
        // couch db integration
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
            let alert = Alert.create({
                title: 'Ooops...',
                subTitle: 'Something is wrong. Make sure the form fields are properly filled in.',
                buttons: ['OK']
            });

            // render in the template
            this.nav.present(alert);
            return;
        }

        this.db.signup(this.seller.username, this.seller.password, {
            metadata : {
                store_name: this.seller.store_name,
                fullname : this.seller.name, 
                roles : ['seller'],
            }
        }, function (err, response) {
            if(!err) {
                self.goToLoginPage();
            } else {
                if(err.name === 'conflict') {
                    var message = 'username already exists';
                } else {
                    console.log(err);
                }

                let alert = Alert.create({
                    subTitle: message
                });

                // render in the template
                self.nav.present(alert);
                return;
            }
        });
    }
}
