"use strict";
var Seller = (function () {
    function Seller(userInfo) {
        this.image = null;
        this.emote = null;
        // assign things
        this._id = userInfo._id;
        this.name = userInfo.name;
        this.fullname = userInfo.fullname;
        // optional properties
        // store name
        if (userInfo.store_name) {
            this.store_name = userInfo.store_name;
        }
        // image
        if (userInfo.image) {
            this.image = userInfo.image;
        }
        // roles
        if (userInfo.roles) {
            this.roles = userInfo.roles;
        }
        // emote
        if (userInfo.emote) {
            this.emote = userInfo.emote;
        }
    }
    return Seller;
}());
exports.Seller = Seller;
