import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';
import { PagesFooterComponent } from './pages-footer/pages-footer.component';
import { HeaderMenuComponent } from './header-menu/header-menu.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        SharedModule
    ],
    providers: [
    ],
    declarations: [
        PagesFooterComponent,
        HeaderMenuComponent
    ],
    exports: [
        PagesFooterComponent,
        HeaderMenuComponent
    ]
})
export class LayoutModule { }
