import { Component } from '@angular/core';
import { Alert, Loading, NavController, Toast } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { LoginPage } from '../login/login';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

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
        image: <string> null,
        name: <string> null,
        fullname: <string> null,
        job_description: <string> null,
        company_name: <string> null
    };

    constructor(
        private localStorage: LocalStorageProvider,
        private nav: NavController
    ) {
        // couch db integration
        this.db = new PouchDB('http://localhost:5984/cheers', {skipSetup: true});

        // local integration
        let local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));

        this.localStorage.getFromLocal('user').then((data) => {
            var user = JSON.parse(data);

            // set some data
            this.user.name = user.name;
            this.user.fullname = user.fullname;
        });
    }

    /**
     * Redirects to the login page
     */
    goToLoginPage() {
        this.nav.push(LoginPage);
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
                        self.db.logout((err, response) => {
                            if (err) {
                                var alert = Alert.create({
                                    title: 'Server Error',
                                    buttons : ['OK']
                                });

                                // render in the template
                                self.nav.present(alert);
                                return;
                            }

                            // remove from the local storage
                            self.localStorage.removeFromLocal('user');

                            // set to login page
                            self.nav.setRoot(LoginPage);
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

        var self = this;
        this.db.putUser(this.user.name, {
            metadata : {
                fullname: this.user.fullname,
                job_description: this.user.job_description,
                company_name: this.user.company_name,
            }
        }, function (err, response) {
            if (err) {
                if (err.name === 'not_found') {
                  // typo, or you don't have the privileges to see this user
                } else {
                  // some other error
                }
            } else {
                // if no error remove the preloader now
                loading.dismiss()
                .then(() => {
                    // show a toast
                    self.showToast('You have successfully updated your profile.');
                });

            }
        });
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
