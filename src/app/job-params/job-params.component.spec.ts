import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobParamsComponent } from './job-params.component';

describe('JobParamsComponent', () => {
  let component: JobParamsComponent;
  let fixture: ComponentFixture<JobParamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobParamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
