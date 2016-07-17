import { Component } from '@angular/core';
import { Events, Platform, ionicBootstrap } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { BuyerSignupPage } from './pages/buyer-signup/buyer-signup';
import { BuyerDashboardPage } from './pages/buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from './pages/seller-dashboard/seller-dashboard';
import { ReloginPage } from './pages/relogin/relogin';
import { LocalStorageProvider } from './providers/storage/local-storage-provider';

@Component({
    template: '<ion-nav [root]="rootPage"></ion-nav>',
    providers : [LocalStorageProvider]
})
export class MyApp {

    private rootPage:any;

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private platform:Platform
    ) {
        this.rootPage = BuyerSignupPage;

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
        });

        this.authEvents();
    }

    /**
     * Listens for events like logout, login, and change of role.
     */
    authEvents() {
        // check if there are logged in users
        this.localStorage.getFromLocal('user').then((data) => {
            if (data) {
                var user = JSON.parse(data);

                // get the role
                var role = user.roles[0];

                // set the page based on the given role
                if (role == 'buyer') {
                    // start the peripheral device events
                    // set the dashboard
                    this.rootPage = BuyerDashboardPage;
                    return;
                }

                if (role == 'seller') {
                    // start the central device events
                    // set the dashboard
                    this.rootPage = SellerDashboardPage;
                    return;
                }
            }
        });

        // register some event listeners here
        // central
        this.events.subscribe('central:start', (eventData) => {
            // initialize the central ble events
        });

        // peripheral
        this.events.subscribe('peripheral:start', (eventData) => {
            // initialize the peripheral ble events
        });
    }
}

ionicBootstrap(MyApp)
