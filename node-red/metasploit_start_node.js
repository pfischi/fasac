const awxConnector  = require("./awx-connector.js")


module.exports = function(RED) {
    function MetasploitStartNode(config) {
        try {
            RED.nodes.createNode(this, config);
            this.helmChart = "metasploit";
            this.clusterService = RED.nodes.getNode(config.clusterService);
            this.awxService = RED.nodes.getNode(config.awxService);
            this.jobTimeout;

            this.helmReleaseName = config.helmReleaseName;
            this.msfrpcdSSL = config.msfrpcdSSL;
            this.msfrpcdPort = config.msfrpcdPort;
            this.msfrpcdUser = config.msfrpcdUser;
            this.msfrpcdPassword = config.msfrpcdPassword;
            this.persistence = config.persistence;
            this.persistenceStorage = config.persistenceStorage;
            this.metasploitServiceName = config.metasploitServiceName;
            this.tcpBackConnect1 = Number(config.tcpBackConnect1);
            this.tcpBackConnect2 = Number(config.tcpBackConnect2);
            this.tcpBackConnect3 = Number(config.tcpBackConnect3);
            this.tcpBackConnect4 = Number(config.tcpBackConnect4);

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
                const regexPort = /^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$/
                try {

                    // error check: helm name
                    if (!new RegExp(regexKubernetesName).test(this.helmReleaseName)) {
                        throw 'Helm Release Name: Invalid name!';
                    }
                    if (!new RegExp(regexPort).test(this.msfrpcdPort)) {
                        throw 'MsfRpcd Port: Invalid port!';
                    }
                    if (!new RegExp(regexPort).test(this.tcpBackConnect1)) {
                        throw 'TCP Backconnect Port 1: Invalid port!';
                    }
                    if (!new RegExp(regexPort).test(this.tcpBackConnect2)) {
                        throw 'TCP Backconnect Port 2: Invalid port!';
                    }
                    if (!new RegExp(regexPort).test(this.tcpBackConnect3)) {
                        throw 'TCP Backconnect Port 3: Invalid port!';
                    }
                    if (!new RegExp(regexPort).test(this.tcpBackConnect4)) {
                        throw 'TCP Backconnect Port 4: Invalid port!';
                    }

                    const tcpBackConnectArray = [this.tcpBackConnect1, this.tcpBackConnect2, this.tcpBackConnect3, this.tcpBackConnect4];

                    if (new Set(tcpBackConnectArray).size !== tcpBackConnectArray.length) {
                        throw 'Duplicate values in TCP backconnect ports!';
                        return false;
                    }

                    var helm_values = {
                        persistence: {
                            enabled: this.persistence,
                            size: this.persistenceStorage + "Mi",
                        },
                        serviceName: this.metasploitServiceName,
                        msfrpcd: {
                            user: this.msfrpcdUser,
                            password: this.msfrpcdPassword
                        },
                        service: {
                            port: {
                                msfrpc: this.msfrpcdPort,
                                tcpBackConnect1: this.tcpBackConnect1,
                                tcpBackConnect2: this.tcpBackConnect2,
                                tcpBackConnect3: this.tcpBackConnect3,
                                tcpBackConnect4: this.tcpBackConnect4
                            },
                            ssl: this.msfrpcdSSL
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

    RED.nodes.registerType("Metasploit: Start", MetasploitStartNode);
}

