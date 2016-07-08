import { Component } from '@angular/core';
import { Alert, Loading, NavController, Toast } from 'ionic-angular';
import { Camera } from 'ionic-native';

/*
  Generated class for the SellerUpdateSettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-update-settings/seller-update-settings.html',
})
export class SellerUpdateSettingsPage {
    seller = {
        image: <string> null
    };

    constructor(private nav: NavController) {}

    /**
     * Opens up the camera and waits for the image to be fetched.
     */
    openTheCamera() {
        let options = {
            destinationType: 0,
            sourceType: 1,
            encodingType: 0,
            quality:100,
            allowEdit: false,
            saveToPhotoAlbum: false
        };

        // once the user accepted the taken photo to be used
        Camera.getPicture(options).then((data) => {
            let imgdata = "data:image/jpeg;base64," + data;

            // assign the image to the user object
            this.seller.image = imgdata;
        }, (error) => {
            // bring out a toast error message
        });
    }

    /**
     * Saves the provided data in the form.
     */
    saveStoreSettings(updateSettingsForm) {
        if (!updateSettingsForm.valid) {
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

        // initialize the loader
        let loading = Loading.create({
            content: 'Saving...'
        });

        // render in the template
        this.nav.present(loading);

        // TODO: add the couch integration here
        setTimeout(() => {
            // dismiss the loader
            loading.dismiss()
                .then(() => {
                    // show a toast
                    this.showToast('You have successfully updated your profile.');
                });
        }, 3000);
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
}
