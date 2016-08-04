import { Component, Inject } from '@angular/core';
import { NavController, Toast, Alert } from 'ionic-angular';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';

import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';

import { Seller } from '../../models/seller';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

/*
  Generated class for the SellerAssociatesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/seller-associates/seller-associates.html',
  providers: [HTTP_PROVIDERS, LocalStorageProvider]
})
export class SellerAssociatesPage {
    user = new Seller({});
    associates = [];
    results = [];
    searching = false;

	constructor(
		private localStorage: LocalStorageProvider,
		private nav: NavController,
		private http: Http,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {
        // get user details from local storage
        this.localStorage.getFromLocal('user')
            .then(result => this.getUserAssociates(result));
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
     * Fetch users from the API.
     */
	fetchUsers(keyword) {
		if (!keyword) {
			this.searching = false;
			return;
		}

		this.searching = true;
		var headers = new Headers({
    		'Content-Type': 'application/x-www-form-urlencoded'
        });

    	var param = {
    		type:'invite',
    		search:keyword
    	};

        this.results = [];
        
		this.http
			.post(this.apiEndpoint + 'users?user=' + this.user.name +
            '&token=' + this.user.auth, param, {headers: headers})
			.map(response => response.json())
			.subscribe((data) => {
				data = data.rows;

                console.log(data);
				for ( var i in data ) {
					this.results.push({
						username: data[i].key,
						fullname: data[i].value[0],
						image: data[i].value[1]
					});
				}
			}, (error) => {
                // show an alert
                setTimeout(() => {
                    var alert = Alert.create({
                        title: 'Error!',
                        subTitle: 'It seems we cannot process your request. Make sure you are connected to the internet to proceed.',
                        buttons: ['OK']
                    });

                    // render in the template
                    this.nav.present(alert);
                }, 300);
			});
	}

    /**
     * Fetches the list of associates of the user.
     */
    getUserAssociates(user) {
        this.user = new Seller(JSON.parse(user));

        // set the headers
        var headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'});

        // set the parameters
        var param = {
            type: 'seller_store',
            search: this.user.name
        };

        // perform request
        this.http
            .post(this.apiEndpoint + 'users?user=' + this.user.name +
            '&token=' + this.user.auth, param, {headers: headers})
            .map(response => response.json())
            .subscribe((data) => {
                data = data.rows;
                for ( var i in data ) {
                    if (this.user.name == data[i].value[0]) {
                        continue;
                    }

                    this.associates.push({
                        fullname: data[i].value[0],
                        image: data[i].value[1]
                    });
                }
            }, (error) => {
                console.log(error);
            });
    }

	/**
     * Invites this person
     */
    invite(user) {
    	var headers = new Headers({
    		'Content-Type': 'application/x-www-form-urlencoded'
        });

    	var param = {
    		username:user.username,
    		store:this.user.name
    	};

		this.http
			.post(this.apiEndpoint + 'invite?user=' + this.user.name +
            '&token=' + this.user.auth, param, {headers: headers})
			.map(response => response.json())
			.subscribe((data) => {
				this.showToast('Invitation sent!');

                // remove user
                var index = this.results.indexOf(user);
                this.results.splice(index, 1);

				this.searching = false;
			}, (error) => {
				console.log(error);
			});
    }
}
