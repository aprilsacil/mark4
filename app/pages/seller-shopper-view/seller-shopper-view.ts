import { Component, Inject } from '@angular/core';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
import { Modal, NavController, NavParams } from 'ionic-angular';

import { SellerAwardModalPage } from '../seller-award-modal/seller-award-modal';
import { CheersAvatar } from '../../components/cheers-avatar/cheers-avatar';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

/*
  Generated class for the SellerShopperViewPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    templateUrl: 'build/pages/seller-shopper-view/seller-shopper-view.html',
    directives: [CheersAvatar],
    providers: [HTTP_PROVIDERS, LocalStorageProvider]
})
export class SellerShopperViewPage {
    shopper = { _id: <string> null, image: <string> null };
    history = [];

    constructor(
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private params: NavParams,
        private http: Http,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {
        // get the shopper details given by the previous page
        this.shopper = this.params.get('shopper');

        this.localStorage.getFromLocal('user').then((data) => {
            var user = JSON.parse(data);

            var headers = new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            });

            var param = {
                type: 'per_user_store',
                search: user.name + '-' + this.shopper._id.replace('org.couchdb.user:', '')
            };

            this.http
                .get(this.apiEndpoint + 'history?type=' + param.type +
                    '&search=' + param.search, {headers: headers})
                .map(response => response.json())
                .subscribe((data) => {
                    for ( var i in data.rows ) {
                        this.history.push(data.rows[i].value);
                    }
                }, (error) => {
                  console.log(error);
                });
        });
    }

    /**
     * Shows the award customer modal
     */
    showAwardModal() {
        // initialize the modal
        var modal = Modal.create(SellerAwardModalPage, { shopper: this.shopper });

        // render it
        this.nav.present(modal);
    }
}
