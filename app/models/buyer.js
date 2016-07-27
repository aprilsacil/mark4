"use strict";
var Buyer = (function () {
    function Buyer(userInfo) {
        this.job_description = null;
        this.company_name = null;
        this.image = null;
        this.level = 0;
        this.looking_for = null;
        console.log('buyer model', userInfo);
        // assign things
        this._id = userInfo._id;
        this.name = userInfo.name;
        this.fullname = userInfo.fullname;
        // optional properties
        // job description
        if (userInfo.job_description) {
            this.job_description = userInfo.job_description;
        }
        // company name
        if (userInfo.company_name) {
            this.company_name = userInfo.company_name;
        }
        // image
        if (userInfo.image) {
            this.image = userInfo.image;
        }
        // level
        if (userInfo.level) {
            this.level = userInfo.level;
        }
        // roles
        if (userInfo.roles) {
            this.roles = userInfo.roles;
        }
        // looking for message
        if (userInfo.looking_for) {
            this.looking_for = userInfo.looking_for;
        }
    }
    return Buyer;
}());
exports.Buyer = Buyer;
