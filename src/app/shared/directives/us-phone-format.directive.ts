import { Directive, OnInit, HostListener } from '@angular/core';
import { FormatPhonePipe } from '../pipes/format-phone.pipe';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[UsPhoneFormat]'
})
export class UsPhoneFormatDirective implements OnInit {

  constructor(
    private control: NgControl,
    private formatPhonePipe: FormatPhonePipe) {

  }
  ngOnInit(): void {
    this.control.control.setValue(this.formatPhonePipe.transform(this.control.control.value));
  }

  @HostListener('input', ['$event'])
  onInput(value) {
    this.control.control.setValue(this.formatPhonePipe.transform(this.control.control.value));
  }

}
