const awxConnector  = require("./awx-connector.js")
const axios = require("axios");
const path = require ("path");

module.exports = function(RED) {
    function CreateFileNode(config) {
        try {          
            RED.nodes.createNode(this, config);
            this.awxService = RED.nodes.getNode(config.awxService);
            this.hostSshService = RED.nodes.getNode(config.hostSshService);
            this.jobTimeout;
            // job polling variables

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
                    const payload = msg.payload;
                    var ssh_key;
                    var isBase64Content = false;

                    if (payload.constructor != Object) {
                        const err = "Message payload must be a dictionary."
                        node.status({ fill: "red", shape: "dot", text: err});
                        throw new Error(err)
                    }

                    const filePath = msg.payload.path;
                    const owner = msg.payload.user;
                    const group = msg.payload.group;
                    const mode = msg.payload.mode;
                    const content = msg.payload.content;
                    isBase64Content = msg.payload.isBase64Content;


                    if (!filePath) {
                        const err = "Invalid file path."
                        node.status({ fill: "red", shape: "dot", text: err});
                        throw new Error(err)
                    }

                    if (!path.isAbsolute(filePath)) {
                        const err = `Invalid file path: ${filePath} must be an absolute path.`
                        node.status({ fill: "red", shape: "dot", text: err});
                        throw new Error(err)
                    }
                    
                    let extraVars = {
                        limit: this.hostSshService.host,
                        base64Content: isBase64Content,
                        extra_vars: {
                            host: this.hostSshService.host,
                            ssh_port: this.hostSshService.port,
                            ssh_user: this.hostSshService.username,
                            ssh_password: this.hostSshService.credentials.password,
                            ssh_key: ssh_key,
                            file_path: filePath,
                            mode: mode,
                            owner: owner,
                            group: group,
                            content: content,
                            is_base64_content: isBase64Content
                        }
                    };

                    awxConnector.init(this.awxService.url, this.awxService.credentials.token);
                    node.status({ fill: "blue", shape: "ring", text: `Job pending` });
                    
                    
                    const jobResponse = await awxConnector.executeJob("Create File", this.hostSshService.host, extraVars, timings);
                    allSuccess = jobResponse.jobSuccess;
                    jobs = jobResponse.jobSummaryResults;
                    stdout = jobResponse.stdout;
                    
                    let msgStdoutResponse = { payload: stdout };
                    let allSuccessResponse, failedResponse;

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

    RED.nodes.registerType("create-file", CreateFileNode);
}

