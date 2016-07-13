import { Component } from '@angular/core';
import { Platform, ionicBootstrap } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { BuyerSignupPage } from './pages/buyer-signup/buyer-signup';
import { BuyerDashboardPage } from './pages/buyer-dashboard/buyer-dashboard';
import { SellerDashboardPage } from './pages/seller-dashboard/seller-dashboard';
import { ReloginPage } from './pages/relogin/relogin';

var CentralBLE = require('../bluetooth/central');

@Component({
    template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MyApp {

    private rootPage:any;

    constructor(private platform:Platform) {
        this.rootPage = BuyerSignupPage;

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
        });


    }
}

ionicBootstrap(MyApp)
