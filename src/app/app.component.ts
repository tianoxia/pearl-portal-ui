import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationCancel, NavigationEnd } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

declare let $: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [
        Location, {
            provide: LocationStrategy,
            useClass: PathLocationStrategy
        }
    ]
})

export class AppComponent implements OnInit, OnDestroy {
    title = 'Pearl Portal';
    location: any;
    routerSubscription: any;
    isShown: boolean;
    constructor(private router: Router,
                private spinner: NgxSpinnerService) {
    }

    ngOnInit() {
        this.isShown = true;
        this.recallJsFuntions();
    }

    recallJsFuntions() {
        this.routerSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel))
            .subscribe(event => {
                $.getScript('../pearl/assets/js/custom.js');
                this.isShown = false;
                this.location = this.router.url;
            });
    }

    ngOnDestroy() {
        if (this.routerSubscription) {
            this.routerSubscription.unsubscribe();
        }
    }
}
