"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
require('rxjs/add/operator/toPromise');
require('rxjs/add/operator/map');
/*
  Generated class for the CheersAvatar component.

  See https://angular.io/docs/ts/latest/api/core/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
var CheersAvatar = (function () {
    function CheersAvatar(http, apiEndpoint) {
        this.http = http;
        this.apiEndpoint = apiEndpoint;
        this.fetching = true;
    }
    /**
     * Will run once the component was initialized
     */
    CheersAvatar.prototype.ngOnInit = function () {
        // get the user details
        if (!this.user.image) {
            this.getUserDetails();
        }
        this.fetching = false;
    };
    /**
     * Fetches the user details from the API.
     */
    CheersAvatar.prototype.getUserDetails = function () {
        var _this = this;
        // set the header
        var headers = new http_1.Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        // set the parameters
        var param = {
            type: 'all_full',
            search: this.user.name
        };
        // send request
        this.http
            .post(this.apiEndpoint + 'users', param, { headers: headers })
            .map(function (response) { return response.json(); })
            .subscribe(function (data) {
            data = data.rows;
            for (var i in data) {
                if (_this.user.name == data[i].value[0]) {
                    _this.user = data[i].value;
                    continue;
                }
            }
        }, function (error) {
            console.log(error);
        });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], CheersAvatar.prototype, "user", void 0);
    CheersAvatar = __decorate([
        core_1.Directive({
            selector: 'img[default]',
            host: {
                '(error)': 'updateAvatar()',
                '[src]': 'src'
            }
        }),
        core_1.Component({
            selector: 'cheers-avatar',
            templateUrl: 'build/components/cheers-avatar/cheers-avatar.html'
        }),
        __param(1, core_1.Inject('APIEndpoint')), 
        __metadata('design:paramtypes', [http_1.Http, String])
    ], CheersAvatar);
    return CheersAvatar;
}());
exports.CheersAvatar = CheersAvatar;
