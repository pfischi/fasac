const awxConnector  = require("./awx-connector.js")


module.exports = function(RED) {
    function MailserverStartNode(config) {
        try {          
            RED.nodes.createNode(this, config);
            this.helmChart = "docker-mailserver";
            this.clusterService = RED.nodes.getNode(config.clusterService);
            this.awxService = RED.nodes.getNode(config.awxService);
            this.jobTimeout;

            this.helmReleaseName = config.helmReleaseName;
            this.mailServiceName = config.mailServiceName;
            this.persistence = config.persistence;
            this.persistenceStorage = config.persistenceStorage;
            this.mailUsers = config.mailUsers;
            this.mailServiceName = config.mailServiceName;

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
                    const usernames = [];
                    // error check: mail users
                    for (const [key, value] of Object.entries(this.mailUsers)) {
                        if (value.user.length === 0 || value.password.length === 0) {
                            throw 'Mail User: Empty values!';
                        }
                        if (usernames.includes(value.user)) {
                            throw 'Mail User: Duplicate entries!';
                        }
                        usernames.push(value.user);
                    }

                    if (usernames.length === 0) {
                        throw 'Mail User: At least one user required!';
                    }

                    // error check: helm name
                    if (!new RegExp(regexKubernetesName).test(this.helmReleaseName)) {
                        throw 'Helm Release Name: Invalid name!';
                    }
                    // error check: mail service name
                    if (!new RegExp(regexKubernetesName).test(this.mailServiceName)) {
                        throw 'Mail Service Name: Invalid name!';
                    }

                    const mailDomain = this.mailServiceName + '.' + this.clusterService.kubeNamespace + '.svc.' + this.clusterService.clusterName
                    var env = {
                        //"OVERRIDE_HOSTNAME": this.mailServiceName,
                        "LOG_LEVEL": "trace",
                        "TLS_LEVEL": "modern",
                        "POSTSCREEN_ACTION": "drop",
                        "FAIL2BAN_BLOCKTYPE": "drop",
                        //"OVERRIDE_HOSTNAME": this.mailServiceName,
                        "POSTMASTER_ADDRESS": "postmaster@" + this.mailServiceName,
                        "UPDATE_CHECK_INTERVAL": "10d",
                        "POSTFIX_INET_PROTOCOLS": "ipv4",
                        "ONE_DIR": "1",
                        "ENABLE_CLAMAV": "0",
                        "ENABLE_POSTGREY": "0",
                        "ENABLE_FAIL2BAN": "0",
                        "AMAVIS_LOGLEVEL": "-1",
                        "SPOOF_PROTECTION": "0",
                        "MOVE_SPAM_TO_JUNK": "0",
                        "ENABLE_UPDATE_CHECK": "0",
                        "ENABLE_SPAMASSASSIN": "0",
                        "SUPERVISOR_LOGLEVEL": "warn",
                        "SPAMASSASSIN_SPAM_TO_INBOX": "0"
                    }

                    var users = [];

                    for (const entry of this.mailUsers) {
                        users.push({user: entry.user + '@' + mailDomain, password: entry.password})
                    }

                    var helm_values = {
                        mailUsers: users,
                        persistence: {
                            enabled: this.persistence,
                            size: this.persistenceStorage + "Mi",
                        },
                        serviceName: this.mailServiceName,
                        environment: env,
                        //dnsName: this.mailServiceName,
                        myDomain: mailDomain
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
                        msg.helmReleaseName = this.helmReleaseName;
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

    RED.nodes.registerType("mailserver-start", MailserverStartNode);
}

