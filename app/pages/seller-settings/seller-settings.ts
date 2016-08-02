import { Component } from '@angular/core';
import { NavController, Tabs, Alert, Events } from 'ionic-angular';

import { SellerUpdateSettingsPage } from '../seller-update-settings/seller-update-settings';
import { SellerAccountSettingsPage } from '../seller-account-settings/seller-account-settings';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { LoginPage } from '../login/login';


/*
  Generated class for the SellerSettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-settings/seller-settings.html',
})

export class SellerSettingsPage {

	updateSettingsTab: any;
	accountSettingsTab: any;

	constructor(
		private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController
    ) {
		this.updateSettingsTab = SellerUpdateSettingsPage;
		this.accountSettingsTab = SellerAccountSettingsPage;
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
