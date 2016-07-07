import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the BuyerUpdateProfilePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/buyer-update-profile/buyer-update-profile.html',
})
export class BuyerUpdateProfilePage {
    user: Object = {};
    constructor(private nav: NavController) {}

    /**
     * User logs out
     */
    logout() {

    }

    /**
     * Saves the provided data in the form.
     */
    saveProfileDetails(updateProfileForm) {

    }
}
