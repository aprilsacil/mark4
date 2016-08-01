import { Component } from '@angular/core';
import { NavController, Tabs } from 'ionic-angular';

import { SellerUpdateSettingsPage } from '../seller-update-settings/seller-update-settings';
import { SellerAccountSettingsPage } from '../seller-account-settings/seller-account-settings';

/*
  Generated class for the SellerSettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-settings/seller-settings.html',
})

export class SellerSettingsPage {
	updateSettingsTab = SellerUpdateSettingsPage;
	accountSettingsTab = SellerAccountSettingsPage;
}
