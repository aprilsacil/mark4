import { Component } from '@angular/core';
import { Alert, Events, Loading, NavController, Toast, ViewController } from 'ionic-angular';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { Buyer } from '../../models/buyer';

/*
  Generated class for the BuyerLookingforModalPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/buyer-lookingfor-modal/buyer-lookingfor-modal.html',
    providers: [LocalStorageProvider]
})
export class BuyerLookingforModalPage {
    lookingFor = {
        product: <string> null
    };
    user = new Buyer({});

	constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
		private nav: NavController,
		private view: ViewController
	) {
        // fetch user details from the local storage
        this.localStorage.getFromLocal('user').then((data) => {
            var user = JSON.parse(data);

            this.user = new Buyer(user);
        });
    }

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
        var toast = Toast.create({
            message: message,
            duration: 3000
        });

        // render in the template
        this.nav.present(toast);
    }

    /**
     * Sends out the looking for to nearby sellers.
     */
    submitLookingFor(lookingForForm) {
        if (!lookingForForm.valid) {
            // prompt that something is wrong in the form
            var alert = Alert.create({
                title: 'Ooops...',
                subTitle: 'Something is wrong. Make sure the form fields are properly filled in.',
                buttons: ['OK']
            });

            // render in the template
            this.nav.present(alert);
            return;
        }

        // initialize the loader
        var loading = Loading.create({
            content: 'Sending...'
        });

        // render in the template
        this.nav.present(loading);

        // prepare the data
        var advertiseData = {
            _id              : this.user._id,
            fullname         : this.user.fullname,
            name             : this.user.name,
            job_description  : this.user.job_description,
            company_name     : this.user.company_name,
            level            : this.user.level,
            looking_for      : this.lookingFor.product
        }

        // set data to be sent via ble
        this.events.publish('peripheral:setData', advertiseData);

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
                    this.showToast('Success!');
                }, 600);
            });
        }, 3000);
    }

}
