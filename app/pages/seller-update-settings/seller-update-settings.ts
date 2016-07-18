import { Component, Inject } from '@angular/core';
import { Alert, Events, Loading, NavController, Toast } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { LoginPage } from '../login/login';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

/*
  Generated class for the SellerUpdateSettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/seller-update-settings/seller-update-settings.html',
    providers: [LocalStorageProvider]
})
export class SellerUpdateSettingsPage {
    private db;
    private dbLocal;
    seller = {
        image: <string> null,
        fullname: <string> null,
        store_name: <string> null,
        name: <string> null
    };

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string
    ) {
        var self = this;
        // couch db integration
        this.db = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        this.dbLocal = new PouchDB('cheers');

        // this will sync locally
        this.db.sync(this.dbLocal, {live: true, retry: true}).on('error', console.log.bind(console));

        this.localStorage.getFromLocal('user').then((data) => {
            this.seller = JSON.parse(data);
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
                    // unsubscribe all seller events
                    self.unsubscribeEvents();

                    // remove data of the user from the storage
                    // redirect to login page
                    setTimeout(() => {
                        // remove from the local storage
                        self.localStorage.removeFromLocal('user');

                        // set to login page
                        self.nav.setRoot(LoginPage);
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
        var self = this;

        if (!updateSettingsForm.valid) {
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
        let loading = Loading.create({
            content: 'Saving...'
        });

        // render in the template
        this.nav.present(loading);

        this.db.putUser(this.seller.name, {
            metadata : {
                store_name: this.seller.store_name,
                fullname: this.seller.fullname,
                image: this.seller.image
            }
        }, function (err, response) {
            if (err) {
                var message;

                // determine the error
                switch (err.name) {
                    case 'not_found':
                        message = 'Something went wrong while processing your request. Please try again later.';
                        break;
                    default:
                        message = 'Something went wrong while processing your request. Please try again later.';
                        break;
                }

                // render the error
                loading.dismiss().then(() => {
                    var alert = Alert.create({
                        title: 'Ooops...',
                        subTitle: message,
                        buttons: ['OK']
                    });

                    // render in the template
                    self.nav.present(alert);
                    return;
                });

                return;
            }

            // get user details
            self.db.getUser(self.seller.name, (err, response) => {
                // delete the password and salt
                delete response.password_scheme;
                delete response.salt

                var user = JSON.stringify(response);

                // update user data to the local storage
                self.localStorage.setToLocal('user', user);

                // TODO: broadcast that we have update the user details


                // if no error remove the preloader now
                loading.dismiss()
                .then(() => {
                    // show a toast
                    self.showToast('You have successfully updated your profile.');
                });
            });

            return;
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

    /**
     * Unsubscribes all central events
     */
    unsubscribeEvents() {
        // first, stop the scanning
        // this.events.publish('central:stopScan');

        // unsubscribe all events
        this.events.unsubscribe('central:start', () => {});
        this.events.unsubscribe('central:startScan', () => {});
        this.events.unsubscribe('central:stopScan', () => {});
        this.events.unsubscribe('central:write', () => {});
        this.events.unsubscribe('central:buyersNearby', () => {});
    }
}
