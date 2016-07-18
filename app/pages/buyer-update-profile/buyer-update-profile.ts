import { Component, Inject } from '@angular/core';
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
        private nav: NavController,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string
    ) {
        // couch db integration
        this.db = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        let local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));

        this.localStorage.getFromLocal('user').then((data) => {
            var user = JSON.parse(data);

            // set some data
            this.user.name = user.name;
            this.user.fullname = user.fullname;
            this.user.job_description = user.job_description;
            this.user.company_name = user.company_name;
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

        this.db.putUser(this.user.name, {
            metadata : {
                fullname: this.user.fullname,
                job_description: this.user.job_description,
                company_name: this.user.company_name,
            }
        }, function (err, response) {
            console.log(response);

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
            self.db.getUser(self.user.name, (err, response) => {
                console.log(response);
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
