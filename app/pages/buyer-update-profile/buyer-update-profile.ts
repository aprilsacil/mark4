import { Component } from '@angular/core';
import { Alert, Loading, NavController, Toast } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { LoginPage } from '../login/login';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

/*
  Generated class for the BuyerUpdateProfilePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/buyer-update-profile/buyer-update-profile.html',
})
export class BuyerUpdateProfilePage {
    private db;
    user = {
        image: <string> null
    };

    constructor(private nav: NavController) {
        // couch db integration
        this.db = new PouchDB('http://localhost:5984/cheers', {skipSetup: true});

        // local integration
        let local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));
    }

    /**
     * User logs out
     */
    logout() {
        var self = this;
        // initialize the Alert component
        let alert = Alert.create({
            title: 'Log out',
            message : 'Are you sure you want to log out of Cheers?',
            buttons: [{
                text: 'Cancel',
                handler: data => {
                    // do something?
                }
            },
            {
                text: 'Yes',
                handler: data => {
                    // remove data of the user from the storage
                    // redirect to login page
                    setTimeout(() => {
                        self.db.logout(function (err, response) {
                            if (err) {
                                let alert = Alert.create({
                                    subTitle: 'Server Error'
                                });

                                // render in the template
                                self.nav.present(alert);
                                return;
                            } else {
                                self.nav.setRoot(LoginPage);
                            }
                        });
                    }, 1000);
                }
            }]
        });

        // render it
        this.nav.present(alert);
    }

    /**
     * Opens up the camera and waits for the image to be fetched.
     */
    openTheCamera() {
        let options = {
            destinationType: 0,
            sourceType: 1,
            encodingType: 0,
            quality:25,
            allowEdit: false,
            saveToPhotoAlbum: false
        };

        // once the user accepted the taken photo to be used
        Camera.getPicture(options).then((data) => {
            let imgdata = "data:image/jpeg;base64," + data;

            // assign the image to the user object
            this.user.image = imgdata;
        }, (error) => {
            // bring out a toast error message
        });
    }

    /**
     * Saves the provided data in the form.
     */
    saveProfileDetails(updateProfileForm) {
        if (!updateProfileForm.valid) {
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
