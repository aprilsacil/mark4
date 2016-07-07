import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BuyerSignupPage } from '../buyer-signup/buyer-signup';

/*
  Generated class for the LoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/login/login.html',
})
export class LoginPage {
    login: Object = {};

    constructor(private nav: NavController) {}

    /**
     * Redirects to the buyer signup page
     */
    goToBuyerSignupPage() {
        this.nav.push(BuyerSignupPage);
    }
}
