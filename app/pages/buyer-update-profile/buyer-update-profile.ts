import { Component, Inject } from '@angular/core';
import { Alert, Events, Loading, NavController, Toast } from 'ionic-angular';
import { Camera } from 'ionic-native';

import { LoginPage } from '../login/login';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { Buyer } from '../../models/buyer';

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
    pouchDb: any;
    localDb: any;
    user = new Buyer({});

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string
    ) {
        // couch db integration
        this.pouchDb = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        this.localDb = new PouchDB('cheers');

        // this will sync locally
        this.localDb.sync(this.pouchDb, {live: true, retry: true})
            .on('error', console.log.bind(console));

        this.localStorage.getFromLocal('user').then((data) => {
            var user = JSON.parse(data);

            // set the data
            this.user = new Buyer(user);
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
                    // unsubscribe events
                    this.unsubscribeEvents();

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
        var options = {
            destinationType: 0,
            sourceType: 1,
            encodingType: 0,
            quality:25,
            allowEdit: false,
            saveToPhotoAlbum: false
        };

        // once the user accepted the taken photo to be used
        Camera.getPicture(options).then((data) => {
            var imgdata = "data:image/jpeg;base64," + data;

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
        var self = this;

        if (!updateProfileForm.valid) {
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
            content: 'Saving...'
        });

        // render in the template
        this.nav.present(loading);

        this.pouchDb.putUser(this.user.name, {
            metadata : {
                fullname: this.user.fullname,
                job_description: this.user.job_description,
                company_name: this.user.company_name,
                image: this.user.image
            }
        }, (err, response) => {
            if (err) {
                var message;

                // determine the error
                switch (err.name) {
                    case 'not_found':
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
            self.pouchDb.getUser(self.user.name, (err, response) => {
                // delete the password and salt
                delete response.password_scheme;
                delete response.salt

                var user = JSON.stringify(new Buyer(response));

                // update user data to the local storage
                self.localStorage.setToLocal('user', user);

                // broadcast that we have update the user details
                self.events.publish('user:update_details');

                // if no error remove the preloader now
                loading.dismiss()
                    .then(() => {
                        // show a toast
                        self.showToast('You have successfully updated your profile.');
                    });
            });
        });
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
     * Unsubscribe to all peripheral events
     */
    unsubscribeEvents() {
        // TODO: stop advertising
        this.events.publish('peripheral:stop');

        this.events.unsubscribe('peripheral:start', () => {});
        this.events.unsubscribe('peripheral:emoteFound', () => {});
    }
}
