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
        store: <string> null
    };

    shopper = {
        name: <string> null
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
        // couch db integration
        this.db = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        var local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));

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
        let toast = Toast.create({
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
        if (!awardCustomerForm.valid) {
            // tell something that form is not valid
        }

        // initialize the loader
        let loading = Loading.create({
            content: 'Sending award to the customer...'
        });

        // render
        this.nav.present(loading);

        this.localStorage.getFromLocal('user').then((data) => {
            var user = JSON.parse(data);

            let headers = new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'});

            var param = this.award;
            //TODO :: make it dynamic
            param.username = this.shopper.name;
            param.store = user.name;

            this.http
                .post(this.apiEndpoint + 'history', param, {headers: headers})
                .map(response => response.json())
                .subscribe((data) => {
                    if(data.ok) {
                        loading.dismiss().then(() => {
                            // close the modal
                            this.dismiss();
                        })
                        .then(() => {
                            // delay it for a second
                            setTimeout(() => {
                                // show a toast
                                this.showToast('You have successfully gave the customer an award.');
                            }, 400);
                        });
                    }
                }, (error) => {
                    console.log(error);
                });
        });
    }
}
