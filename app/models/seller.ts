export class Seller {
    _id: string;
    name: string;
    fullname: string;
    store_uuid: string;
    image: string = null;
    roles: any [];
    emote_message: string = null;
    store: any = {};
    auth: string;
    password: string = null;
    confirm: string = null;

    constructor(userInfo: any) {
        // assign things
        this._id      = userInfo._id;
        this.name     = userInfo.name;
        this.fullname = userInfo.fullname;
        this.auth = userInfo.auth;

        // optional properties
        // store details
        if (userInfo.store) {
            this.store = userInfo.store;
        }

        // image
        if (userInfo.image) {
            this.image = userInfo.image;
        }

        // store_uuid
        if (userInfo.store_uuid) {
            this.store_uuid = userInfo.store_uuid;
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
