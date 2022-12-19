const axios = require('axios').default;
const errorCodes  = require("./awx-error.js")

var awxConnector = (function () {
    var publicAPIs = {};

    var awx, token, baseConfig, host, jobName, timing;

    publicAPIs.init = function (awxUrl, userToken) {
        awx = awxUrl;
        token = userToken;

        baseConfig = {
            baseURL: awx,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
	};
    
    publicAPIs.executeJob = async function (jobTemplateName, hostName, extraVars, pollTiming) {
        if (!awx) {
            throw new Error(errorCodes.AWX_ERR_001);
        }
        if (!token ) {
            throw new Error(errorCodes.AWX_ERR_002);
        }
        jobName = jobTemplateName;
        host = hostName;
        timing = pollTiming;

        // get jobTemplate id
        // pagination
        var nextPageJobTemplate = "/api/v2/job_templates/?page_size=25";
        var jobTemplateId, inventoryId;
        do {
            let response = await getJobTemplateId(nextPageJobTemplate);
            for (const [, value] of Object.entries(response.data.results)) {
                if (value.name === jobTemplateName) {
                    jobTemplateId = value.id;
                    inventoryId = value.inventory;
                    break
                }
            } 
            nextPageJobTemplate = response.data.next;
        } while (nextPageJobTemplate);

        if (!jobTemplateId) {
            throw new Error(errorCodes.AWX_ERR_004)
        }

        // check if hostname is already registered in inventory
        // pagination
        var nextPageHost = `/api/v2/inventories/${inventoryId}/hosts/?page_size=25`
        var hostNameFound = false;
        do {
            var response = await checkHost(nextPageHost);
            for (const [, value] of Object.entries(response.data.results)) {
                if (value.name === hostName) {
                    hostNameFound = true;
                }
            } 
            nextPageHost = response.data.next;
        } while (nextPageHost);

        // if (!hostNameFound) {
        //     await addHost(hostName, inventoryId);
        //     console.log(`Host ${hostName} added to inventory.`);
        // } else {
        //     console.log(`Host ${hostName} already registered in inventory.`);
        // }

        let launchJobResponse = await launchJob(jobTemplateId, extraVars)
        let pollJobResponse;


        const tick = 10;
        const timeout = timing.timeout * 1000

        const counter = Math.ceil(timeout / tick);
        const sleep = ms => new Promise(r => setTimeout(r, ms));

        var timedOut = true;
        for (var i = counter; i > 0; i--) {
            try {
                pollJobResponse = await pollJobStatus(launchJobResponse.job, timing);
                if (pollJobResponse.data.finished) {
                    timedOut = false;
                    break;
                }
            } catch (error) {
                console.log(error);
                // keep it going till until timeout
            }
            await sleep(tick*1000)
        }
        if (timedOut) {
            try {
                await cancelJob(launchJobResponse.job);
            } catch (error) {
                console.log(error)
            }
            throw new Error("Job timed out!")
        }


        // fetch  stdout
        let stdout;
        try {
            let stdoutResult = await getStdout(pollJobResponse.data.id)
            stdout = stdoutResult.data
        } catch (err) {
            throw err;
        }

        // gather the job summary of the job
        // pagination
        let jobSuccess = true;
        let nextJobSummary = `/api/v2/jobs/${pollJobResponse.data.id}/job_host_summaries/?page_size=25`;
        let jobSummaryResults = {};

        do {
            let response = await getJobSummary(nextJobSummary);
            for (const [key , value] of Object.entries(response.results)) {
                jobSummaryResults[key] = value;
                if (value.failed) {
                    jobSuccess = !value.failed;
                }
            } 
            nextPageHost = response.next;
        } while (nextPageHost);

        if(isEmptyObject(jobSummaryResults)){
            jobSuccess = false;
        }
        return { jobSummaryResults, jobSuccess, stdout};
    };
    
    var cancelJob = async function (jobId) {
        var cancelConfig = {
            method: "post",
            url: `/api/v2/jobs/${jobId}/cancel/`
        };
        await axios.request({...baseConfig, ...cancelConfig});
    };

    var getJobSummary = async function(nextPage){
        var summaryConfig = {
            method: "get",
            url: nextPage
        };
        return await (await axios.request({...baseConfig, ...summaryConfig})).data; 
    };

    var getStdout = async function(jobId) {
        var stdoutConfig = {
            method: "get",
            url: `/api/v2/jobs/${jobId}/stdout/?format=txt`
        };
        var response = await (await axios.request({...baseConfig, ...stdoutConfig})); 
        return response;
    }

    var launchJob = async function(jobTemplateId, extraVars){

        // check extraVars for a valid json syntax. More elegant solution available?
        if (extraVars){
            JSON.parse(JSON.stringify(extraVars)); 
        };

        const launchConfig = {
            method: "post",
            url: `/api/v2/job_templates/${jobTemplateId}/launch/`,
            data: extraVars
        };

        response = await axios.request({...baseConfig, ...launchConfig});
        if (response.status === 201) {
            return response.data;
        } else {
            throw new Error(response.data);
        }
    };

    var getJobTemplateId = async function (nextPage){
        const infoJobTemplatesConfig = {
            method: "get",
            url: nextPage
        }
        return await axios.request({...baseConfig, ...infoJobTemplatesConfig});
    };

    var checkHost = async function (nextPage) {
        const checkHostConfig = {
            method: "get",
            url: nextPage,
        };
        return await axios.request({...baseConfig, ...checkHostConfig});
    };

    var pollJobStatus = async function(jobId){
        let pollConf = {
            method: "get",
            url: `/api/v2/jobs/${jobId}`
        }
        const pollConfig = { ...baseConfig, ...pollConf }
        return await axios.request(pollConfig);
    };

    var isEmptyObject = function(obj){
        return Object.keys(obj).length === 0 && obj.constructor === Object
    }

    return publicAPIs;

})();

module.exports = awxConnector;