import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPhone'
})
export class FormatPhonePipe implements PipeTransform {

  transform(value: string): string {
    if (value.length > 0) {
      const match = value.replace(/\D+/g, '').replace(/^1/, '')
        .match(/([^\d]*\d[^\d]*){1,10}$/)[0];
      const part1 = match.length > 3 ? `(${match.substring(0, 3)})` : match;
      const part2 = match.length > 3 ? ` ${match.substring(3, 6)}` : '';
      const part3 = match.length > 6 ? `-${match.substring(6, 10)}` : '';
      return `${part1}${part2}${part3}`;
    }
    return '';
  }

  untransform(value: string): string {
    if (value.length > 0) {
      return value.replace(/\D+/g, '').replace(/^1/, '')
        .match(/([^\d]*\d[^\d]*){1,10}$/)[0];
    }
    return '';
  }
}
