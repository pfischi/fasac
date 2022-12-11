const awxConnector  = require("./awx-connector.js")

module.exports = function(RED) {
    function WorkloadStopNode(config) {
        try {          
            RED.nodes.createNode(this, config);
            this.clusterService = RED.nodes.getNode(config.clusterService);
            this.awxService = RED.nodes.getNode(config.awxService);
            this.helmReleaseName = config.helmReleaseName;
            this.jobTimeout;
            // job polling variables

            try {
                this.jobTimeout = parseInt(config.jobTimeout);
            } catch (err){
                throw "Job timed out."
            }

            var timings = { //in seconds
                initialWait: 2,
                interval: 10,
                timeout: this.jobTimeout
            }
            const node = this;

            node.on('input', async function(msg) {
                try {
                    //check for Helm Release name: via msg.payload or UI
                    if (this.helmReleaseName.length === 0) {
                        if (msg.payload === 0) {
                            throw "Helm Release Name: No value!"
                        } else {
                            this.helmReleaseName = msg.payload;
                        }
                    }

                    let extraVars = {
                        limit: "localhost",
                        extra_vars: {
                            kube_api_token: this.clusterService.credentials.token,
                            kube_api_url: this.clusterService.kubeApiUrl,
                            helm_release_name: this.helmReleaseName, // this triggers the Ansible Playbook to only delete ONE specific Helm Release
                            kube_namespace: this.clusterService.kubeNamespace,
                            validate_certs: this.clusterService.rejectUnauthorized
                        }
                    };

                    awxConnector.init(this.awxService.url, this.awxService.credentials.token);
                    node.status({ fill: "blue", shape: "ring", text: `Job pending` });
                    
                    const jobResponse = await awxConnector.executeJob("Helm Delete", 'localhost', extraVars, timings);
                    allSuccess = jobResponse.jobSuccess;
                    jobs = jobResponse.jobSummaryResults;
                    stdout = jobResponse.stdout;
                    
                    let msgStdoutResponse = { payload: stdout };
                    let allSuccessResponse, failedResponse;
                    msg.jobresult = jobs;
                    
                    if (!allSuccess){
                        node.status({ fill: "yellow", shape: "dot", text: `Job finished with errors.` });
                        failedResponse = msg;
                    } else {
                        allSuccessResponse = msg
                        node.status({ fill: "green", shape: "dot", text: `Job finished.` });
                    }
                    node.send([allSuccessResponse, failedResponse, msgStdoutResponse])

                } catch (err) {
                    console.log(err)
                    node.status({ fill: "red", shape: "dot", text: err});
                    node.error(err)
                }
            });
        } catch (err) {
            console.log(err)
            node.error(err)
        }
    }

    RED.nodes.registerType("Workload: Stop", WorkloadStopNode);
}

