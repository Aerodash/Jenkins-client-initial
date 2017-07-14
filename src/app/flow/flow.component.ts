import { Component, OnInit } from '@angular/core';
import { JenkinsRemoteService } from '../jenkins-remote.service';
import { Job } from '../job';
import io from 'socket.io-client';

@Component({
    selector: 'app-flow',
    templateUrl: './flow.component.html',
    styleUrls: ['./flow.component.css']
})
export class FlowComponent implements OnInit {

    allJobs: Job[];
    // flow object
    jobs: any[] = [];
    tableJobs: any[];
    jobFilter: any = { name: '' };
    jobToAdd: Job;
    currentFlowName: string = '';
    selectedJob: Job;
    normalOrParallel: string;
    jobIndex: number;

    constructor(private J: JenkinsRemoteService) {
        /*
        this.jobs = [
            { name: 'Pipeline', status: '' },
            [{ name: 'batchjob', status: '' }, { name: 'Pipeline', status: '' }],
            { name: 'maven-build-pipeline', status: '' }
        ];
        */
    }

    open(flow) {
        this.jobs = flow.flow;
        this.tableJobs = this.displayJobs(this.jobs);
        this.currentFlowName = flow.name;
        this.selectedJob = null;
    }

    reset() {
        this.jobs = [];
        this.tableJobs = this.displayJobs(this.jobs);
        this.currentFlowName = '';
        this.jobFilter = { name: '' }
        this.jobToAdd = null;
        this.selectedJob = null;
    }

    deleteJob(job, i, j){
        if (i > 0) j = j - 1;
        
        if (this.jobs[j] instanceof Array) {
            this.jobs[j].splice(i, 1);
            if (this.jobs[j].length == 1) this.jobs[j] = this.jobs[j][0];
        } else {
            this.jobs.splice(j, 1);
        }
        this.tableJobs = this.displayJobs(this.jobs);
        for (let k = 0; k < this.tableJobs.length; k++) {
            for (let m = 0; m < this.tableJobs[k].length; m++) {
                if (!this.tableJobs[k][m]) continue;
                this.tableJobs[k][m].selected = false;
            }
        }
        
        console.log(JSON.stringify(this.jobs.map((elt) => {
            if (elt instanceof Array) return elt.map((elt2) => elt2.name);
            else return elt.name;
        })));
    }

    selectJob(job) {
        for (let i = 0; i < this.allJobs.length; i++) {
            if (this.allJobs[i].name === job.name) {
                this.allJobs[i].selected = true;
                this.jobToAdd = this.allJobs[i];
            } else this.allJobs[i].selected = false;
        }
    }

    ngOnInit() {
        //this.open({"timestamp":1499861258263,"name":"Working","flow":[{"_class":"org.jenkinsci.plugins.workflow.job.WorkflowJob","name":"Pipeline","url":"http://localhost:8080/job/Pipeline/","selected":true},[{"_class":"org.jenkinsci.plugins.workflow.job.WorkflowJob","name":"batchjob","url":"http://localhost:8080/job/batchjob/","selected":true},{"_class":"org.jenkinsci.plugins.workflow.job.WorkflowJob","name":"Pipeline","url":"http://localhost:8080/job/Pipeline/","selected":true},{"_class":"hudson.model.FreeStyleProject","name":"maven-build","url":"http://localhost:8080/job/maven-build/","selected":true}],{"_class":"org.jenkinsci.plugins.workflow.job.WorkflowJob","name":"maven-build-pipeline","url":"http://localhost:8080/job/maven-build-pipeline/","selected":true},{"_class":"org.jenkinsci.plugins.workflow.job.WorkflowJob","name":"batchjob","url":"http://localhost:8080/job/batchjob/","selected":true}]});
        this.tableJobs = this.displayJobs(this.jobs);
        
        var socket = io("http://localhost:3000");

        socket.on('flow-update', (flowStatus) => {
            console.log(flowStatus);
            switch(flowStatus.type) {
                case "JOB_START":
                    this.jobs[flowStatus.data.index].status = "PROGRESS";
                break;
                case "JOB_END":
                    this.jobs[flowStatus.data.index].status = flowStatus.status;
                break;
                case "PARALLEL_JOB_START":
                    this.jobs[flowStatus.data.index][flowStatus.data.j].status = "PROGRESS";
                break;
                case "PARALLEL_JOB_END":
                    this.jobs[flowStatus.data.index][flowStatus.data.j].status = flowStatus.status;
                break;
            }
            this.tableJobs = this.displayJobs(this.jobs);
        });
    }

    showModal(type, index) {
        this.J.getJobs().subscribe((response) => {
            this.allJobs = response.json();
            for (let i = 0; i < this.allJobs.length; i++) {
                this.J.getJobParams(this.allJobs[i].name).subscribe((params) => {
                    const jobParams = params.json();
                    this.allJobs[i].params = jobParams;
                })
            }
        });
        this.normalOrParallel = type;
        this.jobIndex = index;
    }

    closeModal() {
        this.jobToAdd = null;
        this.jobFilter = { name: '' };
    }

    addJob() {
        if (this.normalOrParallel === 'N') {
            this.jobs.push(this.jobToAdd);
        } else if (this.normalOrParallel === 'P') {
            if (this.jobs[this.jobIndex] instanceof Array) {
                this.jobs[this.jobIndex].push(this.jobToAdd);
            } else {
                this.jobs[this.jobIndex] = [... [this.jobs[this.jobIndex], this.jobToAdd]];
            }
        }

        this.tableJobs = this.displayJobs(this.jobs);
        this.selectedJob = null;
        
        setTimeout(() => {
            this.jobToAdd = null;
            this.jobFilter = { name: '' };
        }, 50);
    }

    showJobParams(job, i, j) {  
        for (let i = 0; i < this.tableJobs.length; i++) {
            for (let j = 0; j < this.tableJobs[i].length; j++) {
                if (!this.tableJobs[i][j]) continue;
                this.tableJobs[i][j].selected = false;
            }
        }
        this.tableJobs[i][j].selected = true;

        if (i > 0) j = j - 1;
        
        if (this.jobs[j] instanceof Array) {
            this.selectedJob = this.jobs[j][i];
            if (this.jobs[j].length == 1) this.jobs[j] = this.jobs[j][0];
        } else {
            this.selectedJob = this.jobs[j];
        }
    }

    displayJobs(jobsToDisplay: (string|string[])[]): any[] {

        let jobs: any[] = JSON.parse(JSON.stringify(jobsToDisplay));
        const maxArray = (array) => {
            let max = 0;
            for (let i = 0; i < array.length; i++) {
                if (array[i] instanceof Array && array[i].length > max) max = array[i].length;
            }
            return max;
        }
        
        let res = [];
        let maxRows = maxArray(jobs);

        if (maxRows === 0) {
            let row = [];
            for (let i = 0; i < jobs.length; i++) {
                row.push(jobs[i]);
            }
            res.push(row);
            return res;
        }

        let rownum = 0;
        while (rownum < maxRows) {
            for (let i = 0; i < jobs.length; i++) {
                if (!res[rownum]) res[rownum] = [];
                if (jobs[i] instanceof Array) {
                    for (let j = 0; j < jobs[i].length; j++) {
                        if (jobs[i][j] != '') {
                            
                            res[rownum][i] = jobs[i][j];
                            jobs[i][j] = '';
                            break;
                        }     
                    }
                } else if (jobs[i] != ''){
                    res[rownum].push(jobs[i]);
                    jobs[i] = '';
                }
            }
            
            rownum++;
        }

        for (let i = 1; i < res.length; i++) {
            while(res[i].length < this.jobs.length) {
                res[i].push(null);
            }
        }

        for (let i = 1; i < res.length; i++)  res[i].unshift(null);

        for (let i = 0; i < res.length; i++) {
            for (let j = 0; j < res[i].length; j++) {
                if (!res[i][j]) continue;
                res[i][j].selected = false;
            }
        }
        return res;
    }

}
