import { Component } from '@angular/core';
import { Alert, Events, Loading, NavController, Toast, ViewController } from 'ionic-angular';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

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
    user: Object = {};

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
        let toast = Toast.create({
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

        // check if there are peripherals
        if (!this.peripherals) {
             // prompt that something is wrong in the form
            var alert = Alert.create({
                title: 'Ooops...',
                subTitle: 'There are no buyers nearby. You cannot send this.',
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
                store_name: user.store_name,
                emote: this.emote.message
            }

            // var serialize = (data) => {
            //     var str = [];

            //     for(var p in data) {
            //         if (data.hasOwnProperty(p)) {
            //             str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
            //         }
            //     }

            //     return str.join("&");
            // }

            // publish event
            this.events.publish('central:write', data);

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
