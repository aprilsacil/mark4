import { Component, Directive, Input } from '@angular/core';

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
    @Input() user = {
        _id: <string> null,
        name: <string> null,
        fullname: <string> null,
        store_name: <string> null,
        company_name: <string> null,
        job_description: <string> null,
        image: <string> null
    }
    errorImage = false;

    constructor() {}

    /**
     * Get the user details
     */
    updateAvatar() {
        this.errorImage = true;
    }
}
