const awxConnector  = require("awx-nodered/awx-connector.js")
const axios = require("axios");
const path = require ("path");

module.exports = function(RED) {
    function DeleteDirectoryNode(config) {
        try {          
            RED.nodes.createNode(this, config);
            this.awxService = RED.nodes.getNode(config.awxService);
            this.hostSshService = RED.nodes.getNode(config.hostSshService);
            
            try {
                this.jobTimeout = parseInt(config.jobTimeout);
            } catch (err){
                throw new Error("Job timed out.")
            }

            var timings = { //in seconds
                initialWait: 2,
                interval: 2,
                timeout: this.jobTimeout
            }

            const node = this;

            node.on('input', async function(msg) {
                try {
                    const payload = msg.payload;
                    var ssh_key;

                    if (Object.prototype.toString.call(payload) !== "[object String]") {
                        const err = "Message payload must be a string."
                        node.status({ fill: "red", shape: "dot", text: err});
                        throw new Error(err)
                    }

                    const deletePath = msg.payload;
    
                    if (!deletePath) {
                        const err = "Invalid path."
                        node.status({ fill: "red", shape: "dot", text: err});
                        throw new Error(err)
                    }

                    if (!path.isAbsolute(deletePath)) {
                        const err = `Invalid path: ${deletePath} must be an absolute path.`
                        node.status({ fill: "red", shape: "dot", text: err});
                        throw new Error(err)
                    }
                    
                    let extraVars = {
                        limit: this.hostSshService.host,
                        extra_vars: {
                            host: this.hostSshService.host,
                            ssh_port: this.hostSshService.port,
                            ssh_user: this.hostSshService.username,
                            ssh_password: this.hostSshService.credentials.password,
                            ssh_key: ssh_key,
                            path: deletePath
                        }
                    };

                    awxConnector.init(this.awxService.url, this.awxService.credentials.token);
                    node.status({ fill: "blue", shape: "ring", text: `Job pending` });
                    
                    
                    const jobResponse = await awxConnector.executeJob("Delete Directory", this.hostSshService.host, extraVars, timings);
                    allSuccess = jobResponse.jobSuccess;
                    jobs = jobResponse.jobSummaryResults;
                    stdout = jobResponse.stdout;


                    let msgStdoutResponse = { payload: stdout };
                    var allSuccessResponse, failedResponse; 

                    if (!allSuccess){
                        node.status({ fill: "yellow", shape: "dot", text: `Job finished with errors.` });
                        msg.payload = jobs;
                        failedResponse = msg;
                    } else {
                        msg.payload = jobs;
                        allSuccessResponse = msg
                        node.status({ fill: "green", shape: "dot", text: `Job finished.` });
                    }
                    node.send([msgStdoutResponse, allSuccessResponse, failedResponse])
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

    RED.nodes.registerType("delete-directory", DeleteDirectoryNode);
}

