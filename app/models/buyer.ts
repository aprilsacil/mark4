export class Buyer {
    _id: string;
    name: string;
    fullname: string;
    job_description: string = null;
    company_name: string = null;
    image: string = null;
    level: number = 0;
    roles: any [];
    looking_for: string = null;

    constructor(userInfo: any) {
        // assign things
        this._id      = userInfo._id;
        this.name     = userInfo.name;
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
}
