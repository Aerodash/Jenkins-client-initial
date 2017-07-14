import { Component, OnInit, Input } from '@angular/core';
import { FlowComponent } from '../flow/flow.component';

@Component({
  selector: 'app-job-params',
  templateUrl: './job-params.component.html',
  styleUrls: ['./job-params.component.css']
})
export class JobParamsComponent implements OnInit {

  @Input() flow: FlowComponent;
  constructor() { }

  ngOnInit() {
  }

}
