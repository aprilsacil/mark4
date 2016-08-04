import { Component, Inject } from '@angular/core';
import { Alert, Events, Loading, NavController, NavParams, Toast, ViewController } from 'ionic-angular';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { Buyer } from '../../models/buyer';
import { Seller } from '../../models/seller';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

/*
  Generated class for the SellerAwardModalPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-award-modal/seller-award-modal.html',
  providers: [HTTP_PROVIDERS, LocalStorageProvider]
})
export class SellerAwardModalPage {
    private db;
    award = {
        purchasedItem: <string>  null,
        price: <string> null,
        message: <string> null,
        username: <string> null,
        store: <string> null,
        seller: <string> null,
        image: <string> null,
        store_image: <string> null
    };
    shopper: any;
    user = new Seller({});

    constructor(
        private events: Events,
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private params: NavParams,
        private http: Http,
        private view: ViewController,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {
        // get the shopper details from the NavParams
        this.shopper = new Buyer(this.params.get('shopper'));

        // get logged in user details
        this.localStorage.getFromLocal('user').then((data) => {
            this.user = new Seller(JSON.parse(data));
        });
    }

    /**
     * Closes the modal
     */
    dismiss() {
        this.view.dismiss();
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
     * Validates and submit the award to be given to the customer.
     */
    submitAwardCustomer(awardCustomerForm) {
        var self = this;

        if (!awardCustomerForm.valid) {
            // tell something that form is not valid
        }

        // TODO: check if the user has an internet connection

        // initialize the loader
        var loading = Loading.create({
            content: 'Sending award to the customer...'
        });

        // render
        self.nav.present(loading);

        // set the headers
        var headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        var param = self.award;

        param.username      = self.shopper.name;
        param.image         = self.user.image;
        param.seller        = self.user.name;
        param.store         = self.user.store_uuid;
        param.store_image   =  self.user.store.store_image;

        self.http
            .post(self.apiEndpoint + 'history?user=' + self.user.name +
            '&token=' + self.user.auth, param, {headers: headers})
            .map(response => response.json())
            .subscribe((data) => {
                if (!data.ok) {
                    return;
                }

                loading.dismiss().then(() => {
                    // close the modal
                    self.dismiss();
                })
                .then(() => {
                    // trigger an event
                    self.events.publish('user:pull_awards');

                    // delay it for a second
                    setTimeout(() => {
                        // show a toast
                        self.showToast('You have successfully gave the customer an award.');
                    }, 600);
                });
            }, (error) => {
                // there's an error, just show a message
                loading.dismiss().then(() => {
                    setTimeout(() => {
                        // show the message
                        self.showToast('Something went wrong. Please try again later.');
                    });
                });
            });
    }
}
