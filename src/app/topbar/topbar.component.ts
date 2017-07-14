import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { JenkinsRemoteService } from '../jenkins-remote.service';
import { FlowComponent } from '../flow/flow.component';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  @Input() flow: FlowComponent;
  savePopupShown: boolean = false;
  newPopupShown: boolean = false;
  allFlows: any[] = [];
  flowFilter: any = { name: '' }
  flowToOpen: any;
  
  constructor(private J: JenkinsRemoteService, public toastr: ToastsManager, vcr: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    
  }

  showOpenModal() {
    this.J.getFlows().subscribe((response) => {
      this.allFlows = response.json();
    });
  }

  closeModal() {
      this.flowToOpen = null;
      this.flowFilter = { name: '' };
  }

  openFlow() {
    if (this.flow.currentFlowName === this.flowToOpen.name) return;
    this.J.flowExists(this.flow.currentFlowName).subscribe((response) => {
      const flowExists = response.json().exists;
      if (flowExists) {
        this.saveFlow(true);
        this.toastr.info('Current flow saved !');
      }
      this.flow.open(this.flowToOpen);
      setTimeout(() => {
        this.flowToOpen = null;
        this.flowFilter = { name: '' };
      }, 50);
    })
  }

  selectFlow(flow) {
    for (let i = 0; i < this.allFlows.length; i++) {
        if (this.allFlows[i].name === flow.name) {
            this.allFlows[i].selected = true;
            this.flowToOpen = this.allFlows[i];
        } else this.allFlows[i].selected = false;
    }
  }

  saveProgress(){
    // Save your current flow ?
    // YES
    this.showSavePopup();
    this.hideNewPopup();
  }

  createNewFlow() {
    // Save your current flow ?
    // NO
    this.flow.reset();
    this.hideNewPopup();
  }

  showNewPopup() {
    this.newPopupShown = true;
    this.hideSavePopup();
  }

  hideNewPopup() {
    this.newPopupShown = false;
  }

  newFlow() {
    if (this.newPopupShown) {
      this.newPopupShown = false;
      return;
    }
    this.J.flowExists(this.flow.currentFlowName).subscribe((response) => {
      const flowExists = response.json().exists;
      if (flowExists) {
        // Save current flow before creating new
        this.saveFlow(true);
        this.toastr.info('Current flow saved !');
        this.flow.reset();
      } else {
        // Prompt user to save current unsaved flow
        this.showNewPopup();
      }      
    });
  }

  saveFlow(saveWithoutChecking: boolean = false) { 
    if (saveWithoutChecking) {
      this.J.saveFlow(this.flow.currentFlowName, this.flow.jobs).subscribe((response) => {
        if (response.json().timestamp) this.toastr.info('Flow saved successfully !');
      });
      this.hideSavePopup();
      return;
    }
    this.J.flowExists(this.flow.currentFlowName).subscribe((response) => {
      const flowExists = response.json().exists;
      if (flowExists) {
        this.toastr.error('Flow "' + this.flow.currentFlowName + '" already exist', 'Error');
        return;
      }
      
      this.J.saveFlow(this.flow.currentFlowName, this.flow.jobs).subscribe((response) => {
        if (response.json().timestamp) this.toastr.info('Flow saved successfully');
      });
      this.hideSavePopup();
    });
  }

  toggleSavePopup() {
    this.J.flowExists(this.flow.currentFlowName).subscribe((response) => {
      const flowExists = response.json().exists;
      if (flowExists) this.saveFlow(true);
      else {
        this.savePopupShown = !this.savePopupShown;
        if (this.savePopupShown) this.hideNewPopup();
      }
    });
  }

  hideSavePopup() {
    this.savePopupShown = false;
  }

  showSavePopup() {
    this.savePopupShown = true;
    this.hideNewPopup();
  }

  runFlow() {
    this.J.runFlow(this.flow.jobs).subscribe((response) => console.log(response.json()));
  }

}
