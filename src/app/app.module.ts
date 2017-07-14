import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { Ng2FilterPipeModule } from 'ng2-filter-pipe';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { TopbarComponent } from './topbar/topbar.component';
import { MainViewComponent } from './main-view/main-view.component';
import { FlowComponent } from './flow/flow.component';

import { JenkinsService } from './jenkins.service';
import { JenkinsRemoteService } from './jenkins-remote.service';
import { JobParamsComponent } from './job-params/job-params.component';

@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    MainViewComponent,
    FlowComponent,
    JobParamsComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    Ng2FilterPipeModule,
    FormsModule,
    ToastModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [JenkinsService, JenkinsRemoteService],
  bootstrap: [AppComponent]
})
export class AppModule { }
