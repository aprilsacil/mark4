import { Component } from '@angular/core';
import { Alert, Loading, NavController } from 'ionic-angular';
import { BuyerUpdateProfilePage } from '../buyer-update-profile/buyer-update-profile';
import { SellerDashboardPage } from '../seller-dashboard/seller-dashboard';

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
     * Prompts to accept the invitation and will process the whole thing by
     * upgrading the user to be a seller.
     */
    acceptInvitation() {
        // initialize the Alert component
        let alert = Alert.create({
            title: 'Be an associate?',
            message: 'Are you sure you want to be an associate which means you\'ll become a seller?',
            buttons: [{
                text: 'Cancel',
                handler: data => {}
            },
            {
                text: 'Agree',
                handler: data => {
                    // show a loader and re-login the user showing the buyer dashboard
                    let loading = Loading.create({
                        content: "Working on it..."
                    });

                    // show the loader
                    this.nav.present(loading);

                    // redirect
                    setTimeout(() => {
                        loading.dismiss();

                        this.nav.setRoot(SellerDashboardPage);
                    }, 5000);
                }
            }]
        });

        // render it
        this.nav.present(alert);
    }

    /**
     * Redirects to the update profile page
     */
    goToUpdateProfilePage() {
        this.nav.push(BuyerUpdateProfilePage);
    }

    rejectInvitation() {
        // show a confirmation alert
        let confirm = Alert.create({
            title: 'Are you sure?',
            message: 'This will be gone forever if you remove this',
            buttons: [{
                text: 'Cancel',
                handler: () => {}
            },
            {
                text: 'Remove',
                handler: () => {
                    // TODO: remove the selected invitation
                }
            }]
        });

        // render
        this.nav.present(confirm);
    }
}
