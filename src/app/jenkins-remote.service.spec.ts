import { TestBed, inject } from '@angular/core/testing';

import { JenkinsRemoteService } from './jenkins-remote.service';

describe('JenkinsRemoteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JenkinsRemoteService]
    });
  });

  it('should be created', inject([JenkinsRemoteService], (service: JenkinsRemoteService) => {
    expect(service).toBeTruthy();
  }));
});
