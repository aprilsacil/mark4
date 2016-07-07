import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the SellerSignupPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-signup/seller-signup.html',
})
export class SellerSignupPage {
    seller: Object = {};

    constructor(private nav: NavController) {}

    /**
     * It will just redirects back
     */
    goToBuyerSignupPage() {
        this.nav.pop();
    }

    /**
     * Validates and submits the data of the seller.
     */
    submitSellerForm(sellerForm) {

    }
}
