import { Component} from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pages-footer',
  templateUrl: './pages-footer.component.html',
  styleUrls: ['./pages-footer.component.scss'],
})

export class PagesFooterComponent {
  currentYear: number = new Date().getFullYear();
  currentApplicationVersion = environment.appVersion;
}
