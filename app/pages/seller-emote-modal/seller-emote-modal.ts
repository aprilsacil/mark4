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
    user = {};

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private view: ViewController
    ) {
        this.localStorage.getFromLocal('user').then((data) => {
            this.user = JSON.parse(data);
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

        // initialize the loader
        var loading = Loading.create({
            content: 'Sending out your emote...'
        });

        // render in the template
        this.nav.present(loading);

        // TODO: add thingy here
        setTimeout(() => {
            // prepare the data to be sent
            var data: any;

            // set the user data
            data = this.user;

            // delete somethings
            delete data._rev;
            delete data.derived_key;
            delete data.iterations;
            delete data.image;
            delete data.type;
            delete data.roles;

            // append the emote data
            data.emote = this.emote.message;

            var serialize = (data) => {
                var str = [];

                for(var p in data) {
                    if (data.hasOwnProperty(p)) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
                    }
                }

                return str.join("&");
            }

            // publish event
            this.events.publish('central:write', serialize(data));

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
