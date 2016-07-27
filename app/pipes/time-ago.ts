import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the TimeAgo pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
name: 'time-ago'
})
@Injectable()
export class TimeAgo {
    /**
     * Transform the given value to a time ago format.
     */
    transform(value: any, args: any[]) {
        value = new Date(value);

        var secs = ((new Date()).getTime() / 1000) - value.getTime() / 1000;
        Math.floor(secs);

        var minutes = secs / 60;
        secs = Math.floor(secs % 60);
        if (minutes < 1) {
            return secs + (secs > 1 ? 's' : 's');
        }

        var hours = minutes / 60;
        minutes = Math.floor(minutes % 60);
        if (hours < 1) {
            return minutes + (minutes > 1 ? 'm' : 'm');
        }

        var days = hours / 24;
        hours = Math.floor(hours % 24);
        if (days < 1) {
            return hours + (hours > 1 ? 'h' : 'h');
        }
        var weeks = days / 7;
        days = Math.floor(days % 7);
        if (weeks < 1) {
            return days + (days > 1 ? 'd' : 'd');
        }

        var months = weeks / 4.35;
        weeks = Math.floor(weeks % 4.35);
        if (months < 1) {
            return weeks + (weeks > 1 ? 'w' : 'w');
        }

        var years = months / 12;
        months = Math.floor(months % 12);
        if (years < 1) {
            return months + (months > 1 ? 'M' : 'M');
        }

        years = Math.floor(years);
        return years + (years > 1 ? 'Y' : 'Y');
    }
}
