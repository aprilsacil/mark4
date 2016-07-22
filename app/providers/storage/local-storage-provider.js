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
var core_1 = require('@angular/core');
var ionic_angular_1 = require('ionic-angular');
/*
  Generated class for the LocalStorageProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
var LocalStorageProvider = (function () {
    function LocalStorageProvider() {
        this.local = new ionic_angular_1.Storage(ionic_angular_1.LocalStorage);
    }
    LocalStorageProvider.prototype.getFromLocal = function (key) {
        return this.local.get(key).then(function (value) {
            return value;
        });
    };
    LocalStorageProvider.prototype.removeFromLocal = function (key) {
        this.local.remove(key);
    };
    LocalStorageProvider.prototype.setToLocal = function (key, value) {
        this.local.set(key, value);
    };
    LocalStorageProvider = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], LocalStorageProvider);
    return LocalStorageProvider;
}());
exports.LocalStorageProvider = LocalStorageProvider;
