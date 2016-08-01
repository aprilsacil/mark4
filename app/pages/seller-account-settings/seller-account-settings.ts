import { Component, Inject } from '@angular/core';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
import { Alert, Events, Loading, NavController, Toast } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { LoginPage } from '../login/login';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { Seller } from '../../models/seller';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

/*
  Generated class for the SellerAccountSettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-account-settings/seller-account-settings.html',
  providers: [LocalStorageProvider]
})
export class SellerAccountSettingsPage {

	pouchDb: any;
    localDb: any;
    user = new Seller({});

    // set the headers
    headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
    });

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private http: Http,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {
        var self = this;
        // couch db integration
        this.pouchDb = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        this.localDb = new PouchDB('cheers');

        // this will sync locally
        this.pouchDb.sync(this.localDb, {live: true, retry: true}).on('error', console.log.bind(console));

        this.localStorage.getFromLocal('user').then((data) => {
            this.user = new Seller(JSON.parse(data));
            this.user.password = null;
            this.user.confirm = null;
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
        var alert = Alert.create({
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
                        self.localStorage.removeFromLocal('timestamp');
                        self.localStorage.removeFromLocal('emote_message');

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
    saveStoreSettings(accountSettingsForm) {
        var self = this;

        if (!accountSettingsForm.valid) {
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
        var param = this.user;
        param.roles = this.user.roles[0];

        // perform request to the api
        self.http
            .post(
                self.apiEndpoint + 'update?user=' + self.user.name + '&token=' + self.user.auth,
                param, { headers: self.headers })
            .map(response => response.json())
            .subscribe((data) => {
                if(data.ok) {
                	// assign the roles to an array
                	delete self.user ['roles'];
		            self.user.roles = ['seller'];

                    // update user data to the local storage
                    self.localStorage.setToLocal('user', JSON.stringify(self.user));

                    // broadcast that we have update the user details
                    self.events.publish('user:update_details');

                    // if no error remove the preloader now
                    loading.dismiss()
                    .then(() => {
                        // show a toast
                        self.showToast('You have successfully updated your profile.');
                    });

                    return;
                }

                if(data.message) {
                    var message = data.message;
                }

                if(data.errors) {
                    var message = data.errors[0];
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
            }, (error) => {
                console.log(error);
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
     * Unsubscribes all central events
     */
    unsubscribeEvents() {
        // first, stop the scanning
        this.events.publish('central:stop_scan');

        // unsubscribe all events
        this.events.unsubscribe('central:start', () => {});
        this.events.unsubscribe('central:start_scan', () => {});
        this.events.unsubscribe('central:stop_scan', () => {});
        this.events.unsubscribe('central:write', () => {});
        this.events.unsubscribe('central:buyers_nearby', () => {});

        // user events
        this.events.unsubscribe('user:update_details', () => {});
    }

}
