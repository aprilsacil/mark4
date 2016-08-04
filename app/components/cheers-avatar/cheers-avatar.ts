import { Component, Directive, Inject, Input } from '@angular/core';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
import { LocalStorageProvider } from '../../providers/storage/local-storage-provider';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

/*
  Generated class for the CheersAvatar component.

  See https://angular.io/docs/ts/latest/api/core/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Directive({
    selector: 'img[default]',
    host: {
        '(error)':'updateAvatar()',
        '[src]':'src'
    }
})
@Component({
    selector: 'cheers-avatar',
    templateUrl: 'build/components/cheers-avatar/cheers-avatar.html',
    providers: [LocalStorageProvider]
})
export class CheersAvatar {
    @Input() user: any;
    seller = { name: <string> null, auth: <string> null };
    fetching = true;

    constructor(
        private http: Http,
        private localStorage: LocalStorageProvider,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {}

    /**
     * Will run once the component was initialized
     */
    ngOnInit() {
        this.localStorage.getFromLocal('user').then((data) => {
            this.seller = JSON.parse(data);

            // get the user details
            if (!this.user.image) {
                this.getUserDetails();
            }

            this.fetching = false;
        });
    }

    /**
     * Fetches the user details from the API.
     */
    getUserDetails() {
        // set the header
        var headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        // set the parameters
        var param = {
            type:'all_full',
            search: this.user.name
        };

        // send request
        this.http
            .post(this.apiEndpoint + 'users?user=' + this.seller.name +
            '&token=' + this.seller.auth, param, {headers: headers})
            .map(response => response.json())
            .subscribe((data) => {
                data = data.rows;
                for ( var i in data ) {
                    if (this.user._id == data[i].id) {
                        this.user = data[i].value;

                        // save image data to cache if there's an image provided
                        if (this.user.image) {
                            // remove first
                            this.localStorage.removeFromLocal('chimg_' + this.user._id);
                            // set
                            this.localStorage.setToLocal('chimg_' + this.user._id, this.user.image);
                        }
                        continue;
                    }
                }
            }, (error) => {
                // most likely no internet connection
                // check cache
                this.localStorage.getFromLocal('chimg_' + this.user._id).then((data) => {
                    if (data) {
                        this.user.image = data;
                    }
                })
            });
    }
}
