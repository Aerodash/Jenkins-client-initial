import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class JenkinsRemoteService {

  rooturl: string = "http://localhost:3000/jenkinsapi";
  constructor(private http: Http) { }

  getJobs(): Observable<Response> {
    return this.http.get(this.rooturl + "/jobs");
  }

  runFlow(flow: any) {
    return this.http.post(this.rooturl + '/runFlow', flow);
  }

  saveFlow(name: string, flow: any) {
    return this.http.post(this.rooturl + '/saveFlow?name=' + name, flow);
  }

  getFlows() {
    return this.http.get(this.rooturl + '/flows');
  }

  flowExists(name: string) {
    return this.http.get(this.rooturl + '/flowExists?name=' + name);
  }

  getJobParams(name: string) {
    return this.http.get(this.rooturl + '/jobParams?name=' + name);
  }
}
