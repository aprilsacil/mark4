import { Component } from '@angular/core';
import { Events, Platform, ionicBootstrap } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { BuyerSignupPage } from './pages/buyer-signup/buyer-signup';
import { BuyerDashboardPage } from './pages/buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from './pages/seller-dashboard/seller-dashboard';
import { ReloginPage } from './pages/relogin/relogin';
import { CentralBle } from './providers/bluetooth/central-ble';
import { PeripheralBle } from './providers/bluetooth/peripheral-ble';

@Component({
    template: '<ion-nav [root]="rootPage"></ion-nav>',
    providers: [CentralBle, PeripheralBle]
})
export class MyApp {
    private rootPage:any;

    constructor(
        private centralBle: CentralBle,
        private events: Events,
        private peripheralBle: PeripheralBle,
        private platform:Platform
    ) {
        this.rootPage = ReloginPage;

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();

            // trigger a buyer event
            this.buyerEvents();
        });
    }

    /**
     * Buyer event listeners
     */
    buyerEvents() {
        var self = this;

        // initialize this
        self.centralBle.init();

        this.events.subscribe('central:startScan', (eventData) => {
            // start scanning
        });

        // write event
        this.events.subscribe('central:write', (eventData) => {
            console.log('writing...');
            self.centralBle.write(eventData[0]);
        });
    }

    /**
     * Seller event listeners
     */
    sellerEvents() {

    }
}

ionicBootstrap(MyApp)
