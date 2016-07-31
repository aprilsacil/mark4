import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

import { SellerUpdateSettingsPage } from '../seller-update-settings/seller-update-settings';
import { SellerAccountSettingsPage } from '../seller-account-settings/seller-account-settings';

/*
  Generated class for the SellerPopoverPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-popover/seller-popover.html',
})
export class SellerPopoverPage {

  constructor(
  	private nav: NavController,
  	private view: ViewController) {}

  	/**
     * Goto seller update settings page
     */
	goToUpdateSettingsPage() {
		this.nav.push(SellerUpdateSettingsPage);
	}

	/**
     * Goto seller account settings page
     */
	goToAccountSettingsPage() {
		this.nav.push(SellerAccountSettingsPage);
	}
}
