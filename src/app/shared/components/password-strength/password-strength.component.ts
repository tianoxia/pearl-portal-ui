import { Component, Input, OnChanges, SimpleChange } from '@angular/core';


@Component({
  selector: 'app-password-strength',
  templateUrl: './password-strength.component.html',
  styleUrls: ['./password-strength.component.scss']
})
export class PasswordStrengthComponent implements OnChanges {
  bar0: string;
  bar1: string;
  bar2: string;
  bar3: string;
  color: string;
  passwordStrengthText: string;

  @Input() public password: string;

  colors = ['#ff0000', '#ffa500', '#1e90ff', '#008000'];

  constructor() { }

  ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
    const password = changes.password.currentValue;
    this.setBarColors(4, '#DDD');
    this.passwordStrengthText = '';
    if (password) {
      const c = this.getColor(this.checkStrength(password));
      this.color = c.color;
      this.setBarColors(c.index, c.color);
    }
  }


  private getColor(strength) {
    let index = 0;
    switch (strength) {
      case 0:
        index = 0;
        this.passwordStrengthText = 'Weak';
        break;
      case 1:
        index = 1;
        this.passwordStrengthText = 'Fair';
        break;
      case 2:
        index = 2;
        this.passwordStrengthText = 'Good';
        break;
      case 3:
        index = 3;
        this.passwordStrengthText = 'Strong';
        break;
    }

    return {
      index: index + 1,
      color: this.colors[index]
    };
  }

  private setBarColors(count, col) {
    for (let n = 0; n < count; n++) {
      this['bar' + n] = col;
    }
  }

  checkStrength(password) {
    // 1
    let strength = 0;

    // 2
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(password);
    const mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{7,})/.test(password);
    const fairRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{5,})/.test(password);

    // 3
    return strength = strongRegex ? 3 : mediumRegex ? 2 : fairRegex ? 1 : 0;
  }

}
