import { Component, Directive, Inject, Input } from '@angular/core';
import { HTTP_PROVIDERS, Http, Headers } from '@angular/http';
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
    templateUrl: 'build/components/cheers-avatar/cheers-avatar.html'
})
export class CheersAvatar {
    @Input() user: any;
    fetching = true;

    constructor(
        private http: Http,
        @Inject('APIEndpoint') private apiEndpoint: string
    ) {}

    ngOnInit() {
        console.log('user', this.user);

        // get the user details
        if (!this.user.image) {
            this.getUserDetails();
        }

        this.fetching = false;
    }

    /**
     * Get the user details
     */
    updateAvatar() {
        // this.errorImage = true;
    }

    getUserDetails() {
        var headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });

        var param = {
            type:'buyer_full',
            search: this.user.name
        };

        this.http
            .post(this.apiEndpoint + 'users', param, {headers: headers})
            .map(response => response.json())
            .subscribe((data) => {
                data = data.rows;
                for ( var i in data ) {
                    if (this.user.name == data[i].value[0]) {
                        this.user = data[i].value;
                        continue;
                    }
                }
            }, (error) => {
                console.log(error);
            });
    }
}
