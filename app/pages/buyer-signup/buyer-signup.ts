import { Component } from '@angular/core';
import { Alert, Loading, NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { SellerSignupPage } from '../seller-signup/seller-signup';
import { PouchService } from '../../providers/pouch-service/pouch-service';

/*
  Generated class for the BuyerSignupPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/buyer-signup/buyer-signup.html',
    providers: [PouchService]
})
export class BuyerSignupPage {
    buyer: Object = {};

    constructor(
        private nav: NavController,
        private pouch: PouchService
    ) {}

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
        if (!buyerSignupForm.valid) {
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

        // process the signup thing
        // validate

        this.pouch.add(this.buyer).then((res) => {
            console.log(res);
        });
    }
}
