import { Injectable } from '@angular/core';
import request from 'request';

const ROOT_URL = 'http://localhost:8080'
const API = '/api/json';
const CRUMB = '/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,":",//crumb)';
const CRUMB_HEADER = 'Jenkins-Crumb';

const CREATE = '/createItem';
const DELETE = '/doDelete';
const BUILD = '/build';
const LAST_BUILD_STATUS = '/lastBuild';
const JOB = (name) => `/job/${name}`;

@Injectable()
export class JenkinsService {
    url: string;
    username: string;
    password: string;
    crumb: string;

    constructor(/*{ url, username, password }*/) {
        this.url = /*url ||*/ ROOT_URL;
        this.username =  'ahmedmoalla';
        this.password = '98578652';
        this.generateCrumb((crumb) => this.crumb = crumb);  
    }

    generateCrumb(callback) {
        request.get(ROOT_URL + CRUMB)
            .auth(this.username, this.password)
            .on('data', (data) => {
                callback(data.toString().split(':')[1]);
            });
    }
    
    createJob(name, config, callback) {   
        const sendResponse = (crumb) => {
            let res = request.post(ROOT_URL + CREATE, 
                    { 
                        qs: { name }, 
                        body: `
                            <flow-definition plugin="workflow-job@2.12.1">
                                <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps@2.36">
                                    <script>
                                    pipeline { agent any stages { stage('Stage 1') { steps { echo 'Running step 1' } } } }
                                    </script>
                                    <sandbox>true</sandbox>
                                </definition>
                            </flow-definition>
                        `,
                        headers: { 'Jenkins-Crumb': crumb, 'Content-Type': 'application/xml' }
                    }
                )
                .auth(this.username, this.password);
                res.on('response', (response) => callback(response));
        }     
        if (!this.crumb) {
            this.generateCrumb((crumb) => {
                this.crumb = crumb;
                sendResponse(crumb);
            });
        } else {
            sendResponse(this.crumb);
        }
    }
    
    listJobs(callback) {
        request.get(ROOT_URL + API + '?tree=jobs[name,url]')
            .auth(this.username, this.password)
            .on('data', (data) => {
                let jobs = JSON.parse(data.toString()).jobs;
                callback(jobs);
            });
    }

    jobInfo(name, callback) {
        request.get(ROOT_URL + JOB(name) + API)
            .auth(this.username, this.password)
            .on('data', (data) => {
                let info = JSON.parse(data.toString());
                callback(info);
            });
    }

    deleteJob(name, callback) {
        const sendResponse = (crumb) => {
            let res = request.post(ROOT_URL + JOB(name) + DELETE, 
                    { 
                        headers: { 'Jenkins-Crumb': crumb, }
                    }
                )
                .auth(this.username, this.password);
                res.on('response', (response) => callback(response));
        }     
        if (!this.crumb) {
            this.generateCrumb((crumb) => {
                this.crumb = crumb;
                sendResponse(crumb);
            });
        } else {
            sendResponse(this.crumb);
        }
    }

    buildJob(name, callback) {
        const sendResponse = (crumb) => {
            let res = request.post(ROOT_URL + JOB(name) + BUILD, 
                    { 
                        headers: { 'Jenkins-Crumb': crumb, }
                    }
                )
                .auth(this.username, this.password);
                res.on('response', (response) => callback(response));
        }     
        if (!this.crumb) {
            this.generateCrumb((crumb) => {
                this.crumb = crumb;
                sendResponse(crumb);
            });
        } else {
            sendResponse(this.crumb);
        }
    }

    buildStatus(name, callback) {
        const sendResponse = (crumb) => {
            let res = request.post(ROOT_URL + JOB(name) + LAST_BUILD_STATUS + API, 
                    { 
                        headers: { 'Jenkins-Crumb': crumb, }
                    }
                )
                .auth(this.username, this.password);
                res.on('data', (response) => callback(response));
        }     
        if (!this.crumb) {
            this.generateCrumb((crumb) => {
                this.crumb = crumb;
                sendResponse(crumb);
            });
        } else {
            sendResponse(this.crumb);
        }
    }

    buildJobAndWait(name, callback: any, checkInterval: number = 500) {
        let noop = () => {};
        this.buildStatus(name, (previousBuildResponse) => {
            const previousResp = JSON.parse(previousBuildResponse.toString());
            let latestBuildId = previousResp.id;
            console.log('job ' + name + ' started building !');
            this.buildJob(name, (response) => {
                if (response.statusCode != 201) {
                    // failed
                }
                
                let interval = setInterval(() => {
                    this.buildStatus(name, (buildResponse) => {
                        const resp = JSON.parse(buildResponse.toString());
                        const result = resp.result;
                        const d = new Date()
                        if (!result) noop();//console.log(`[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}] IN PROGRESS`);
                        else if (resp.id != latestBuildId) { // Not previous build id (Current build might be in queue)
                            callback(result);
                            clearInterval(interval);
                        }
                    })
                }, checkInterval);
            });
        });
    }

    buildJobs(jobs, index = 0) {
        console.log('buildJobs(' + jobs + ', ' + index + ')');
        if (jobs[index] instanceof Array) { // parallel jobs
            let parallelJobs = jobs[index];
            console.log('Parallel build of : ', JSON.stringify(parallelJobs));

            let parallelJobsStatus = [];
            jobs[index].forEach((elt) => parallelJobsStatus.push(false));
            
            for (let i = 0; i < parallelJobs.length; i++) {
                console.log(`Building job ${parallelJobs[i]}.`);
                this.buildJobAndWait(parallelJobs[i], (result) => {
                    console.log('job ' + parallelJobs[i] + ' finished building (' + result + ').');
                    
                    parallelJobsStatus[i] = true;
                    if (parallelJobsStatus.indexOf(false) == -1 && index + 1 < jobs.length) {
                        this.buildJobs(jobs, index + 1);
                    }
                })
            }
        } else {
            console.log('Normal build :');
            console.log(`Building job ${jobs[index]}.`);
            this.buildJobAndWait(jobs[index], (result) => {
                //console.log(`[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}] ${result}`)
                console.log('job ' + jobs[index] + ' finished building (' + result + ').');
                //console.log('Building next job ...');
                if ((index + 1) == jobs.length)
                    console.log('Finished building all jobs') 
                else 
                    this.buildJobs(jobs, index + 1);
            })
        }
           
    }
}
