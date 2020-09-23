import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripParamFromUrl'
})
export class StripParamFromUrlPipe implements PipeTransform {

  transform(value: string): string {
    if (value.length > 0) {
      return value.split(/[?#]/)[0];
    }
    return '';
  }
}
