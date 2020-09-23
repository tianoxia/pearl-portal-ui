import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatZipCode'
})
export class FormatZipCodePipe implements PipeTransform {

  transform(value: string): string {
    if (value.length > 0) {
      const match = value.replace('-', '');
      const part1 = match.length > 4  ? `${match.substring(0, 5)}` : match;
      const part2 = match.length > 5 ? `-${match.substring(5, match.length)}` : '';
      return `${part1}${part2}`;
    }
    return '';
  }

}
