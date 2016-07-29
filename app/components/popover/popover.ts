import { Component } from '@angular/core';

/*
  Generated class for the Popover component.

  See https://angular.io/docs/ts/latest/api/core/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'popover',
  templateUrl: 'build/components/popover/popover.html'
})
export class Popover {

  text: string;

  constructor() {
    this.text = 'Hello World';
  }
}
