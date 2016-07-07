import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BuyerUpdateProfilePage } from '../buyer-update-profile/buyer-update-profile';

/*
  Generated class for the BuyerDashboardPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/buyer-dashboard/buyer-dashboard.html',
})
export class BuyerDashboardPage {
    constructor(private nav: NavController) {}

    /**
     * Redirects to the update profile page
     */
    goToUpdateProfilePage() {
        this.nav.push(BuyerUpdateProfilePage);
    }
}
