import { Component, provide, ViewChild } from '@angular/core';
import { Alert, Events, Platform, ionicBootstrap } from 'ionic-angular';
import { Geolocation, Network, StatusBar, LocalNotifications } from 'ionic-native';

import { BuyerSignupPage } from './pages/buyer-signup/buyer-signup';
import { BuyerDashboardPage } from './pages/buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from './pages/seller-dashboard/seller-dashboard';
import { ReloginPage } from './pages/relogin/relogin';

import { CentralBle } from './providers/bluetooth/central-ble';
import { PeripheralBle } from './providers/bluetooth/peripheral-ble';
import { LocalStorageProvider } from './providers/storage/local-storage-provider';

@Component({
    template: '<ion-nav [root]="rootPage"></ion-nav>',
    providers: [CentralBle, LocalStorageProvider, PeripheralBle]
})
export class MyApp {
    private location:any;
    private rootPage:any;

    constructor(
        private centralBle: CentralBle,
        private events: Events,
        private localStorage: LocalStorageProvider,
        private peripheralBle: PeripheralBle,
        private platform:Platform
    ) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();

            // start some authentication events
            this.authenticationEvents();
        });

        // run events when the application is in background mode
        this.backgroundEvents();
    }

    /**
     * Listens for events like logout, login, and change of role.
     */
    authenticationEvents() {
        var currentTimestamp = Math.round(new Date().getTime() / 1000);

        // check if there are logged in users
        this.localStorage.getFromLocal('user').then((data) => {
            if (data) {
                this.localStorage.getFromLocal('timestamp').then((timestamp) => {
                    // get the difference between the current and saved timestamp
                    var difference = currentTimestamp - timestamp;

                    // check it's almost 10 minutes
                    if (difference >= 600) {
                        // if it's almost 10 minutes, set the root page to the relog page
                        this.rootPage = ReloginPage;
                        return;
                    }

                    // get the user
                    var user = JSON.parse(data);

                    // get the role
                    var role = user.roles[0];

                    // update timestamp
                    this.localStorage.setToLocal('timestamp', currentTimestamp);

                    // set the page based on the given role
                    if (role == 'buyer') {
                        // start the peripheral device events
                        this.buyerEvents();

                        // set the data to be advertised
                        var advertiseData = {
                            _id : user._id,
                            fullname: user.fullname,
                            name: user.name,
                            job_description: user.job_description,
                            company_name: user.company_name,
                            level: user.level,
                            coordinates: this.location
                        }

                        // set data
                        this.events.publish('peripheral:set_buyer_data', advertiseData);

                        // set the dashboard
                        this.rootPage = BuyerDashboardPage;
                        return;
                    }

                    if (role == 'seller') {
                        // start the central device events
                        this.sellerEvents();

                        // set the dashboard
                        this.rootPage = SellerDashboardPage;
                        return;
                    }
                });
            }
        });

        // set the default root page
        this.rootPage = BuyerSignupPage;

        // register some event listeners here
        // central
        this.events.subscribe('central:start', (eventData) => {
            // initialize the central ble events
            this.sellerEvents();
        });

        // peripheral
        this.events.subscribe('peripheral:start', (eventData) => {
            // initialize the peripheral ble events
            this.buyerEvents();
        });
    }

    /**
     * Background events
     */
    backgroundEvents() {
        var self = this;
        console.log('background events running...');

        self.platform.pause.subscribe(() => {
            console.log('background mode...');

            // listen to some existing events
            self.events.subscribe('app:local_notifications', (eventData) => {
                var notification = eventData[0];

                if (!notification) {
                    return;
                }

                // notify
                LocalNotifications.schedule({
                    title: notification.title,
                    text: notification.text,
                    // at: new Date(new Date().getTime() + 5 * 1000),
                    sound: null
                });
            });
        });

        // if the app is focused or opened from background
        self.platform.resume.subscribe(() => {
            // unsubscribe
            self.events.unsubscribe('app:local_notifications', () => {
                console.log('cancelled');
            });
        });
    }

    /**
     * Seller event listeners
     */
    sellerEvents() {
        var self = this;

        // initialize this
        self.centralBle.init();

        this.events.subscribe('central:start_scan', (eventData) => {
            console.log('event: start scan');

            // check if the bluetooth is enabled or not
            self.centralBle.status().then(result => {
                if (!result) {
                    console.log('Bluetooth not enabled');
                    return;
                }

                // check if location services is enabled
            });

            // start scanning
            self.centralBle.scan();
        });

        this.events.subscribe('central:stop_scan', (eventData) => {
            console.log('event: stop scan');
            // stop scanning
            self.centralBle.stop();
        });
    }

    /**
     * Buyer event listeners
     */
    buyerEvents() {
        var self = this;

        // initialize the peripheral ble
        self.peripheralBle.init();

        self.events.subscribe('peripheral:stop', () => {
            self.peripheralBle.stop();
        });

        // do some cleanup by removing the looking for product data
        self.localStorage.removeFromLocal('looking_for');
    }
}

ionicBootstrap(MyApp, [
    provide('CouchDBEndpoint', {useValue: 'http://192.168.1.46:5984/'}),
    provide('APIEndpoint', {useValue: 'http://192.168.1.46/'})]);
