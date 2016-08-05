import { Component, Inject } from '@angular/core';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
import { Events, Modal, NavController, NavParams, Alert, Toast } from 'ionic-angular';

import { SellerAwardModalPage } from '../seller-award-modal/seller-award-modal';

import { SortBy } from '../../pipes/sort-by';
import { TimeAgo } from '../../pipes/time-ago';

import { CheersAvatar } from '../../components/cheers-avatar/cheers-avatar';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { Seller } from '../../models/seller';

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
    pipes: [SortBy, TimeAgo],
    providers: [HTTP_PROVIDERS, LocalStorageProvider]
})
export class SellerShopperViewPage {
    seller = new Seller({});
    shopper = { 
        _id: <string> null,
        name: <string> null, 
        image: <string> null,
        purchase: <number> 0,
        conversion: <number> 0
    };
    history = [];

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private params: NavParams,
        private http: Http,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {
        // get the shopper details given by the previous page
        this.shopper = this.params.get('shopper');

        // get user details
        this.localStorage.getFromLocal('user').then((data) => {
            var user = JSON.parse(data);

            this.seller = new Seller(user);

            // fetch products bought/awards
            this.getShopperHistoryPerShop();
        });

        // register an event to listen if we need to pull the list of awards/products
        // from the API.
        this.events.subscribe('user:pull_awards', () => {
            // clear history
            this.history = [];

            this.getShopperHistoryPerShop();
        });
    }

    /**
     * Render and shows a toast message
     */
    showToast(message) {
        var toast = Toast.create({
            message: message,
            duration: 3000
        });

        // render in the template
        this.nav.present(toast);
    }

    /**
     * Fetches the list of awards/products given/bought by the user based on
     * the current store viewing.
     */
    getShopperHistoryPerShop() {
        var self = this;

        var headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        var param = {
            type: 'per_user_store',
            search: this.seller.name + '-' + this.shopper._id.replace('org.couchdb.user:', '')
        };

        this.http
            .get(this.apiEndpoint + 'history?user='+this.seller.name+
                    '&token='+this.seller.auth+'&type=' + param.type +
                '&search=' + param.search, {headers: headers})
            .map(response => response.json())
            .subscribe((data) => {
                for ( var i in data.rows ) {
                    this.history.push(data.rows[i].value);
                }

                this.shopper.purchase = data.total_rows;

                this.http
                .get(this.apiEndpoint + 'connection?user='+this.seller.name+
                    '&token='+this.seller.auth+'&search='+this.shopper.name+
                    '&store='+this.seller.name, {headers: headers})
                .map(response => response.json())
                .subscribe((connection) => {
                    this.shopper.conversion = Math.round((this.shopper.purchase / connection) * 100);
                });
            }, (error) => {
                setTimeout(() => {
                    // show the message
                    self.showToast('Something went wrong while fetching customer data.');
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
