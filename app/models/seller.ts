export class Seller {
    _id: string;
    name: string;
    fullname: string;
    store_name: string;
    image: string = null;
    roles: any [];
    emote_message: string = null;

    constructor(userInfo: any) {
        // assign things
        this._id      = userInfo._id;
        this.name     = userInfo.name;
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
        if (userInfo.emote_message) {
            this.emote_message = userInfo.emote_message;
        }
    }
}
