const awxConnector  = require("./awx-connector.js")
module.exports = function(RED) {
    function ScenarioPlanePrepare(config) {
        try {
            RED.nodes.createNode(this, config);

            // Fasac-Scenario-Preparation
            this.helmChart = "fasac-scenario";
            // Hardcoded Helm Namespace, internal usage for some preparation workloads
            this.helmReleaseName = "preparation";
            this.clusterService = RED.nodes.getNode(config.clusterService);
            this.awxService = RED.nodes.getNode(config.awxService);

            this.jobTimeout;

            this.allowedCommunicationLabels = config.allowedCommunicationLabels;
            this.scenarioPlaneNamespace = config.scenarioPlaneNamespace.trim();

            try {
                this.jobTimeout = parseInt(config.jobTimeout);
            } catch (err){
                throw new Error("Job timed out.")
            }

            var timings = { //in seconds
                initialWait: 2,
                interval: 10,
                timeout: this.jobTimeout
            }

            const node = this;

            node.on('input', async function(msg) {
                const regexKubernetesName =  /(?=^.{0,23}$)^[a-z]([-a-z0-9]*[a-z0-9])$/g;
                try {
                    const labels = [];

                    if (this.allowedCommunicationLabels.length === 0){
                        throw 'Allowed Communication Labels: At least one label required!';
                    }
                    // error check: mail users
                    for (const [key, value] of Object.entries(this.allowedCommunicationLabels)) {
                        if (value.key.length === 0 || value.value.length === 0) {
                            throw 'Allowed Communication Label: Empty values!';
                        }
                        if (labels.includes(value.key)) {
                            throw 'Allowed Communication Label: Duplicate entries!';
                        }
                        labels.push(value.key);

                        if (!new RegExp(regexKubernetesName).test(value.key)) {
                            throw 'Allowed Communication Label: Invalid label key name!';
                        }
                        if (!new RegExp(regexKubernetesName).test(value.value)) {
                            throw 'Allowed Communication Label: Invalid label value name!';
                        }
                    }

                    if (!new RegExp(regexKubernetesName).test(this.helmReleaseName)) {
                        throw 'Helm Release Name: Invalid name!';
                    }
                    if (!new RegExp(regexKubernetesName).test(this.scenarioPlaneNamespace)) {
                        throw 'Scenario Plane Namespace: Invalid name!';
                    }

                    const obj = {};
                    for (const [key, value] of Object.entries(this.allowedCommunicationLabels)) {

                        if(value.key.trim().toLowerCase() === 'kubernetes.io/metadata.name') {
                            throw "Scenario Plane Namespace: Label key 'kubernetes.io/metadata.name' not allowed!";
                        }
                        obj[value.key.trim()] = value.value.trim();
                    }

                    obj['kubernetes.io/metadata.name'] = this.clusterService.kubeNamespace;

                    var helm_values = {
                        allowedCommunicationLabels: obj
                    }

                    var validate = "no"
                    if ( this.clusterService.rejectUnauthorized === "yes" ){
                        validate = "yes"
                    }

                    let extraVars = {
                        limit: "localhost",
                        extra_vars: {
                            kube_api_token: this.clusterService.credentials.token,
                            kube_api_url: this.clusterService.kubeApiUrl,
                            helm_release_name: this.helmReleaseName,
                            helm_chart: this.helmChart,
                            helm_repo_url: this.clusterService.helmRepoUrl,
                            kube_namespace: this.clusterService.kubeNamespace,
                            helm_values: JSON.stringify(helm_values),
                            wait: "yes",
                            atomic: "yes",
                            force: "yes",
                            validate_certs: validate
                        }
                    };

                    awxConnector.init(this.awxService.url, this.awxService.credentials.token);
                    node.status({fill: "blue", shape: "ring", text: `Job pending`});

                    let jobResponse = await awxConnector.executeJob("Helm Install", 'localhost', extraVars, timings);
                    const allSuccess = jobResponse.jobSuccess;
                    const jobs = jobResponse.jobSummaryResults;
                    const stdout = jobResponse.stdout;

                    let msgStdoutResponse = {payload: stdout};
                    let allSuccessResponse, failedResponse;

                    if (!allSuccess) {
                        node.status({fill: "yellow", shape: "dot", text: `Job finished with errors.`});
                        msg.jobresult = jobs;
                        failedResponse = msg;
                    } else {
                        msg.payload = this.helmReleaseName;
                        msg.jobresult = jobs;
                        allSuccessResponse = msg
                        node.status({fill: "green", shape: "dot", text: `Job finished.`});
                    }
                    node.send([allSuccessResponse, failedResponse, msgStdoutResponse])
                } catch (err) {
                    console.log(err)
                    node.status({fill: "red", shape: "dot", text: err});
                    node.error(err)
                }
            });
        } catch (err) {
            console.log(err)
            node.error(err)
        }
    }

    RED.nodes.registerType("scenario-plane-prepare", ScenarioPlanePrepare);
}

