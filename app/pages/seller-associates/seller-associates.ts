import { Component, Inject } from '@angular/core';
import { NavController, Toast } from 'ionic-angular';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));

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
	private db;
	user = {
		name: <string> null,
		image: <string> null };
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
		this.db = new PouchDB(this.couchDbEndpoint + 'cheers', {skipSetup: true});

        // local integration
        let local = new PouchDB('cheers');

        // this will sync locally
        local.sync(this.db, {live: true, retry: true}).on('error', console.log.bind(console));

        this.localStorage.getFromLocal('user').then((data) => {
            this.user = JSON.parse(data);

            let headers = new Headers({
	    		'Content-Type': 'application/x-www-form-urlencoded'});

	    	var param = {
	    		type:'seller_store',
	    		search:this.user.name
	    	};

			this.http
				.post('http://cheers.dev/users', param, {headers: headers})
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
        });
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

	fetchUsers(keyword) {
		if (!keyword) {
			this.searching = false;
			return;
		}

		this.searching = true;
		let headers = new Headers({
    		'Content-Type': 'application/x-www-form-urlencoded'});

    	var param = {
    		type:'invite',
    		search:keyword
    	};

		this.http
			.post(this.apiEndpoint + 'users', param, {headers: headers})
			.map(response => response.json())
			.subscribe((data) => {
				data = data.rows;
				for ( var i in data ) {
					this.results.push({
						username: data[i].key,
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
     *
     */
    invite(username) {
    	console.log(username);
    	let headers = new Headers({
    		'Content-Type': 'application/x-www-form-urlencoded'});

    	var param = {
    		username:username,
    		store:this.user.name
    	};

		this.http
			.post('http://cheers.dev/invite', param, {headers: headers})
			.map(response => response.json())
			.subscribe((data) => {
				this.showToast('You have successfully gave the customer an award.');
				this.searching = false;

			}, (error) => {
				console.log(error);
			});
    }
}
