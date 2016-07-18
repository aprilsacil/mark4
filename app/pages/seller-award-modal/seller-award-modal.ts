import { Component, Inject } from '@angular/core';
import { Alert, Loading, NavController, Toast, ViewController } from 'ionic-angular';

/*
  Generated class for the SellerAwardModalPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-award-modal/seller-award-modal.html',
})
export class SellerAwardModalPage {
    award: Object = {};

    constructor(
        private nav: NavController,
        private view: ViewController
    ) {}

    /**
     * Closes the modal
     */
    dismiss() {
        this.view.dismiss();
    }

    /**
     * Render and shows a toast message
     */
    showToast(message) {
        let toast = Toast.create({
            message: message,
            duration: 3000
        });

        // render in the template
        this.nav.present(toast);
    }

    /**
     * Validates and submit the award to be given to the customer.
     */
    submitAwardCustomer(awardCustomerForm) {
        if (!awardCustomerForm.valid) {
            // tell something that form is not valid
        }

        // initialize the loader
        let loading = Loading.create({
            content: 'Sending award to the customer...'
        });

        // render
        this.nav.present(loading);

        // TODO: add thingy here
        setTimeout(() => {
            // dismiss the loader
            loading.dismiss().then(() => {
                // close the modal
                this.dismiss();
            })
            .then(() => {
                // delay it for a second
                setTimeout(() => {
                    // show a toast
                    this.showToast('You have successfully gave the customer an award.');
                }, 400);
            });
        }, 3000);
    }
}
