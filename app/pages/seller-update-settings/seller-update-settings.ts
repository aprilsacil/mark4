import { Component } from '@angular/core';
import { Alert, Loading, NavController, Toast } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { LoginPage } from '../login/login';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

/*
  Generated class for the SellerUpdateSettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-update-settings/seller-update-settings.html',
})
export class SellerUpdateSettingsPage {
    private db;
    seller = {
        image: <string> null,
        fullname: <string> null,
        store_name: <string> null,
        name: <string> null
    };

    constructor(private nav: NavController) {
        var self = this;
        // couch db integration
        this.db = new PouchDB('http://localhost:5984/cheers', {skipSetup: true});

        // local integration
        let local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));

        this.db.getSession(function (err, response) {
            if (err) {
                // network error
                console.log(err);
                return;
            } else if (!response.userCtx.name) {
               self.goToLoginPage();
            } else {
                self.db.getUser(response.userCtx.name, function (err, response) {
                    if (err) {
                        if (err.name === 'not_found') {
                            // typo, or you don't have the privileges to see this user
                        } else {
                            // some other error
                        }
                    } else {
                        self.seller = response;
                    }
                });
            }
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
        var self = this;

        this.db.putUser(this.seller.name, {
            metadata : { store_name: 'Store Name', fullname: this.seller.fullname }
        }, function (err, response) {
            if (err) {
                if (err.name === 'not_found') {
                  // typo, or you don't have the privileges to see this user
                } else {
                  // some other error
                }
            } else {
                // if no error redirect to seller dashboard now
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
