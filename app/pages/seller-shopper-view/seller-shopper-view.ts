import { Component, Inject } from '@angular/core';
import { Modal, NavController, NavParams } from 'ionic-angular';
import { SellerAwardModalPage } from '../seller-award-modal/seller-award-modal';
import { CheersAvatar } from '../../components/cheers-avatar/cheers-avatar';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
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
    //private shopper: Object = {};
    private shopper = { _id: <string> null };
    private history = [];
    constructor(
         private localStorage: LocalStorageProvider,
        private nav: NavController,
        private params: NavParams,
        private http: Http,
        @Inject('CouchDBEndpoint') private couchDbEndpoint: string,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {
        this.shopper = this.params.get('shopper');

        this.localStorage.getFromLocal('user').then((data) => {
            var user = JSON.parse(data);
 
            let headers = new Headers({
              'Content-Type': 'application/x-www-form-urlencoded'});

            var param = {
              type:'per_user_store',
              search:user.name + '-' + this.shopper._id.replace('org.couchdb.user:', '')
            };

            this.http
                .get(this.apiEndpoint + 'history?type=' + param.type +
                    '&search=' + param.search, {headers: headers})
                .map(response => response.json())
                .subscribe((data) => {
                    for ( var i in data.rows ) {
                        var item = data.rows[i].value;
                        item.date = this.timeAgoFromEpochTime(new Date(data.rows[i].value.date));

                        this.history.push(item);
                    }

                    console.log(this.history);

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

    timeAgoFromEpochTime(epoch) {
        var secs = ((new Date()).getTime() / 1000) - epoch.getTime() / 1000;
        Math.floor(secs);
        var minutes = secs / 60;
        secs = Math.floor(secs % 60);
        if (minutes < 1) {
            return secs + (secs > 1 ? 's' : 's');
        }
        var hours = minutes / 60;
        minutes = Math.floor(minutes % 60);
        if (hours < 1) {
            return minutes + (minutes > 1 ? 'm' : 'm');
        }
        var days = hours / 24;
        hours = Math.floor(hours % 24);
        if (days < 1) {
            return hours + (hours > 1 ? 'h' : 'h');
        }
        var weeks = days / 7;
        days = Math.floor(days % 7);
        if (weeks < 1) {
            return days + (days > 1 ? 'd' : 'd');
        }
        var months = weeks / 4.35;
        weeks = Math.floor(weeks % 4.35);
        if (months < 1) {
            return weeks + (weeks > 1 ? 'w' : 'w');
        }
        var years = months / 12;
        months = Math.floor(months % 12);
        if (years < 1) {
            return months + (months > 1 ? 'M' : 'M');
        }
        years = Math.floor(years);
        return years + (years > 1 ? 'Y' : 'Y');
    }
}
