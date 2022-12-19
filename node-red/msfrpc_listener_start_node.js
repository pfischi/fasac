const MsfRpc = await import('./msfrpc.js');

module.exports = function(RED) {
    function MsfRpcStartListenerNode(config) {
        try {
            RED.nodes.createNode(this, config);
            this.msfrpcConfig = RED.nodes.getNode(config.msfrpcConfig);
            this.msfrpcUri = this.msfrpcConfig.msfrpcUri;
            this.meterpreterWaitTime = config.meterpreterWaitTime;
            this.meterpreterSessionOnlyConnect = config.meterpreterSessionOnlyConnect;
            const node = this;

            node.on('input', async function(msg) {
                try {
                    const sleep = ms => new Promise(r => setTimeout(r, ms));

                    if (!msg.payload || msg.payload.length === 0) {
                        throw new Error("No options given to create a 'exploit/multi/handler' listener on MsfRpc Server. payload set. The data field msg.payload is empty!")
                    }
                    const msfrpc = new MsfRpc(this.msfrpcUri);
                    console.log(`Connecting to ${this.msfrpcUri}`);

                    node.status({fill: "yellow", shape: "dot", text: "Waiting to connect to msfrpc server ..."});

                    var msfrpcTimout = true;
                    for (var i = 30; i > 0; i--) {
                        try {
                            await msfrpc.connect();
                            msfrpcTimout = false;
                            break;
                        } catch (error) {
                            console.log(error)
                            console.log("retrying")
                            node.status({fill: "yellow", shape: "dot", text: "Cannot connect to msfrpc server ...retrying."});
                        }
                        await sleep(10000) // 10 seconds, so we have 300 seconds in total
                    }
                    if (msfrpcTimout) {
                        throw new Error("Giving up. No connection possible to msfrpc server.")
                    }

                    node.status({fill: "green", shape: "dot", text: "Connected to: " + this.msfrpcUri});
                    var result = await msfrpc.module.execute("exploit", "multi/handler", msg.payload);
                    const job_uuid = result.uuid;

                    try {
                        Number.isFinite(result.job_id);
                    } catch {
                        throw new Error("Error while starting the Metasploit listener. Are all parameters correct?")
                    }

                    node.status({fill: "green", shape: "dot", text: "Listener started"});

                    var meterpreterSession;
                    const tick = 5;

                    const counter = Math.ceil(this.meterpreterWaitTime / tick);
                    

                    node.status({fill: "yellow", shape: "dot", text: "Waiting for a Meterpreter connection ..."});
                    for (var i = counter; i > 0; i--) {
                        const sessions = await msfrpc.session.list()
                        if (sessions.length === 0) {
                            continue;
                        }
                        //console.log(sessions)
                        var found = false;
                        // only connect to a meterpreter started by the current Meterpreter listener

                        for (let [key, values] of Object.entries(sessions)) {
                            console.log(sessions)
                            if (this.meterpreterSessionOnlyConnect) {
                                if (values.exploit_uuid === job_uuid) {
                                    meterpreterSession = values;
                                    meterpreterSession['id'] = key
                                    found = true;
                                }
                                // select the last session by iterating till the end ...
                            } else {
                                found = true;
                                meterpreterSession = values;
                                meterpreterSession['id'] = key
                            }
                        }
                        if (found) {
                            break;
                        }
                        await sleep(tick * 1000);
                    }

                    if (meterpreterSession) {
                        node.status({
                            fill: "yellow",
                            shape: "dot",
                            text: "Meterpereter session found ... give me 10 seconds to breath."
                        });
                        await sleep(10000)

                        node.status({fill: "green", shape: "dot", text: "Done."});
                        msg["meterpreter"] = {};
                        msg["meterpreter"]["id"] = meterpreterSession['id'];
                        msg["meterpreter"]["info"] = meterpreterSession;

                        node.send(msg);
                    } else {
                        throw new Error("No meterpreter session found for UUID " + job_uuid + '!')
                    }
                } catch (error) {
                    console.log(error)
                    node.status({fill: "red", shape: "dot", text: error});
                    node.error(error)
                }
            });
        } catch (error) {
            console.log(error)
            node.error(error)
        }
    }

    RED.nodes.registerType("MsfRpc: Listener Start", MsfRpcStartListenerNode);
}
