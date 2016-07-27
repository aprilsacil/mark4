import { Component, provide } from '@angular/core';
import { Events, Platform, ionicBootstrap } from 'ionic-angular';
import { StatusBar, LocalNotifications } from 'ionic-native';

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

            this.authenticationEvents();
        });

        // when the app is on background
        platform.pause.subscribe(() => {

        });
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

                    // check it's almost 30 minutes
                    if (difference >= 1800) {
                        // if it's almost 30 minutes, set the root page to the relog page
                        this.rootPage = ReloginPage;
                        return;
                    }

                    // get the user
                    var user = JSON.parse(data);

                    // get the role
                    var role = user.roles[0];

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
                            level: user.level
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
     * Seller event listeners
     */
    sellerEvents() {
        var self = this;

        // initialize this
        //self.centralBle.init();

        this.events.subscribe('central:startScan', (eventData) => {
            console.log('event: start scan');

            // check if the bluetooth is enabled or not
            self.centralBle.status().then(result => {
                if (!result) {
                    // prompt that the bluetooth is not enabled
                    return;
                }

                // check if location services is enabled
            });

            // start scanning
            self.centralBle.scan();
        });

        this.events.subscribe('central:stopScan', (eventData) => {
            console.log('event: stop scan');
            // stop scanning
            self.centralBle.stop();
        });

        // write event
        // this.events.subscribe('central:write', (eventData) => {
        //     console.log('event: write', eventData[0]);
        //     self.centralBle.write(JSON.stringify(eventData[0]));
        // });
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
    provide('CouchDBEndpoint', {useValue: 'http://208.113.130.196:5984/'}),
    provide('APIEndpoint', {useValue: 'http://208.113.130.196/'})])

