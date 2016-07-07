import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { SellerSignupPage } from '../seller-signup/seller-signup';

/*
  Generated class for the BuyerSignupPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/buyer-signup/buyer-signup.html',
})
export class BuyerSignupPage {
    buyer: Object = {};

    constructor(private nav: NavController) {}

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
     * Validates and submits the buyer data.
     */
    submitSignupForm(buyerSignupForm) {
        // check if the form is not valid
        // process the signup thing
        // validate
    }
}
