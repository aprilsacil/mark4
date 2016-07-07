import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SellerShopperViewPage } from '../seller-shopper-view/seller-shopper-view';

/*
  Generated class for the SellerDashboardPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-dashboard/seller-dashboard.html',
})
export class SellerDashboardPage {
    shoppers: Object = {};
    constructor(private nav: NavController) {}

    goToShopperDetails() {
        this.nav.push(SellerShopperViewPage);
    }
}
