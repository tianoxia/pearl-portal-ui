import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLeaderboardReportComponent } from './view-leaderboard-report.component';

describe('ViewLeaderboardReportComponent', () => {
  let component: ViewLeaderboardReportComponent;
  let fixture: ComponentFixture<ViewLeaderboardReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewLeaderboardReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLeaderboardReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
