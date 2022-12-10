const awxConnector  = require("./awx-connector.js")


module.exports = function(RED) {
    function ScenarioPlaneClean(config) {
        try {
            RED.nodes.createNode(this, config);

            this.clusterService = RED.nodes.getNode(config.clusterService);
            this.awxService = RED.nodes.getNode(config.awxService);
            this.jobTimeout;

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
                try {
                    let extraVars = {
                        limit: "localhost",
                        extra_vars: {
                            kube_namespace: this.clusterService.kubeNamespace,
                            kube_api_token: this.clusterService.credentials.token,
                            kube_api_url: this.clusterService.kubeApiUrl
                            // helm_release_name: if not set, the Ansible Playbook deletes all Helm releases in the namespace
                        }
                    };

                    awxConnector.init(this.awxService.url, this.awxService.credentials.token);
                    node.status({fill: "blue", shape: "ring", text: `Job pending`});

                    let jobResponse = await awxConnector.executeJob("Helm Delete", 'localhost', extraVars, timings);
                    const allSuccess = jobResponse.jobSuccess;
                    const jobs = jobResponse.jobSummaryResults;
                    const stdout = jobResponse.stdout;

                    let msgStdoutResponse = {payload: stdout};
                    let allSuccessResponse, failedResponse;
                    msg.jobresult = jobs;

                    if (!allSuccess) {
                        node.status({fill: "yellow", shape: "dot", text: `Job finished with errors.`});
                        failedResponse = msg;
                    } else {
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

    RED.nodes.registerType("Scenario Plane: Clean", ScenarioPlaneClean);
}

