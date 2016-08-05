import { Component } from '@angular/core';
import { Alert, Events, Loading, NavController, Toast, ViewController } from 'ionic-angular';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { Seller } from '../../models/seller';

/*
  Generated class for the SellerEmoteModalPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-emote-modal/seller-emote-modal.html',
  providers: [LocalStorageProvider]
})
export class SellerEmoteModalPage {
    maxCharacterLimit = 140;
    remainingCharacters = 140;
    emote = {
        message: <string> null
    };
    peripherals: boolean = false;
    user: Object = new Seller({});

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private view: ViewController
    ) {
        this.localStorage.getFromLocal('user').then((data) => {
            this.user = JSON.parse(data);
        });

        // trigger an event
        this.events.subscribe('central:getPeripherals', (eventData) => {
            this.peripherals = !(JSON.stringify(eventData[0]) === '{}');
        });
    }

    /**
     * Computes the remaining characters allowed to be sent.
     */
    characterCounter(value) {
        if (!value || value.length === 0 ) {
            this.remainingCharacters = this.maxCharacterLimit;
        }

        // compute
        this.remainingCharacters = this.maxCharacterLimit - value.length;
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
     * Sends out the emote to nearby shoppers.
     */
    submitEmote(emoteForm) {
        if (!emoteForm.valid) {
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
            content: 'Sending out your emote...'
        });

        // render in the template
        this.nav.present(loading);

        // TODO: add thingy here
        setTimeout(() => {
            var user = <any> this.user;

            // prepare the data to be sent
            var data = {
                _id : user._id,
                fullname: user.fullname,
                store: { store_name: user.store.store_name},
                emote: this.emote.message
            }

            // save emote message in the local storage and let central-ble to
            // send the emote message to all
            this.localStorage.setToLocal('emote_message', this.emote.message);

            // dismiss the loader
            loading.dismiss().then(() => {
                // close the modal
                this.view.dismiss();
            })
            .then(() => {
                // delay it for a second
                setTimeout(() => {
                    // show a toast
                    this.showToast('You have successfully sent out your emote.');
                }, 600);
            });
        }, 3000);
    }
}
