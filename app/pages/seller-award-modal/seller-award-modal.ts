import { Component, Inject } from '@angular/core';
import { Alert, Loading, NavController, NavParams, Toast, ViewController } from 'ionic-angular';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

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
        image: <string> null
    };

    shopper = {
        name: <string> null,
        image: <string> null
    };

    constructor(
        private localStorage: LocalStorageProvider,
        private nav: NavController,
        private params: NavParams,
        private http: Http,
        private view: ViewController,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {
        // get the shopper details from the NavParams
        this.shopper = this.params.get('shopper');
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

        // initialize the loader
        var loading = Loading.create({
            content: 'Sending award to the customer...'
        });

        // render
        self.nav.present(loading);

        self.localStorage.getFromLocal('user').then((data) => {
            var user = JSON.parse(data);

            // set the headers
            var headers = new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            });

            var param = self.award;

            param.username = self.shopper.name;
            param.image = self.shopper.image;
            param.store = user.name;

            self.http
                .post(self.apiEndpoint + 'history', param, {headers: headers})
                .map(response => response.json())
                .subscribe((data) => {
                    if(data.ok) {
                        loading.dismiss().then(() => {
                            // close the modal
                            self.dismiss();
                        })
                        .then(() => {
                            // delay it for a second
                            setTimeout(() => {
                                // show a toast
                                self.showToast('You have successfully gave the customer an award.');
                            }, 400);
                        });
                    }
                }, (error) => {
                    console.log(error);
                });
        });
    }
}
