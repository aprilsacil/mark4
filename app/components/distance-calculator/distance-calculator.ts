import { Component, Input } from '@angular/core';

/*
  Generated class for the DistanceCalculator component.

  See https://angular.io/docs/ts/latest/api/core/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'distance-calculator',
  templateUrl: 'build/components/distance-calculator/distance-calculator.html'
})
export class DistanceCalculator {
    @Input() coordinates: any;
    @Input() currentUserCoordinates: any;
    distance: any;

    ngOnInit() {
        this.computeDistance();
    }

    computeDistance() {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(this.coordinates.latitude - this.currentUserCoordinates.latitude);
        var dLon = this.deg2rad(this.coordinates.longitude - this.currentUserCoordinates.longitude);

        var a = Math.sin(dLat/2) *
            Math.sin(dLat/2) +
            Math.cos(this.deg2rad(this.currentUserCoordinates.latitude)) *
            Math.cos(this.deg2rad(this.coordinates.latitude)) *
            Math.sin(dLon/2) *
            Math.sin(dLon/2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        var m = d * 100; // Distance in m

        this.distance = m.toFixed(2);
    }

    deg2rad(deg) {
        return deg * (Math.PI/180)
    }
}
