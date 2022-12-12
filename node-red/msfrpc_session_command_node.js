const MsfRpc  = require("awx-nodered/msfrpc.js")

module.exports = function(RED) {
function MsfRpcSessionCommandNode(config) {
        try {
            RED.nodes.createNode(this, config);
            this.msfrpcConfig = RED.nodes.getNode(config.msfrpcConfig);
            this.msfrpcUri = this.msfrpcConfig.msfrpcUri
            this.meterpreterCommand = config.meterpreterCommand;
            this.meterpreterDelayRead = config.meterpreterDelayRead;
            const node = this;

            node.on('input', async function (msg) {
                try {
                    if ("meterpreter" in msg) {
                        if (! "id" in msg.meterpreter) {
                            throw new Error("No key 'id' found in msg.meterpreter !")
                        }
                    }
                    else{
                        throw new Error("No key 'meterpreter' found in msg !")
                    }
                    if (msg.meterpreter.id.length === 0) {
                        throw new Error("No session uuid was given via msg.meterpreter.id !")
                    }
                    if (this.meterpreterCommand.length === 0) {
                        throw new Error("No Meterpreter command not configured.")
                    }

                    const msfrpc = new MsfRpc(this.msfrpcUri);
                    console.log(`Connecting to ${this.msfrpcUri}`);

                    node.status({fill: "yellow", shape: "dot", text: "Waiting to connect to msfrpc server ..."});

                    await msfrpc.connect();

                    node.status({fill: "yellow", shape: "dot", text: "Executing Meterpreter command ..."});
                    var result = await msfrpc.session.meterpreter_run_single(msg.meterpreter.id, this.meterpreterCommand);

                    if (result ==! 'success') {
                        throw new Error("Command was not executed successfully.");
                    }

                    node.status({fill: "yellow", shape: "dot", text: "Reading Meterpreter command results..."});
                    const sleep = ms => new Promise(r => setTimeout(r, ms));
                    await sleep(this.meterpreterDelayRead * 1000)
                    result = await msfrpc.session.meterpreter_read(msg.meterpreter.id)

                    if(result.data.length > 0)
                    {
                        node.status({fill: "green", shape: "dot", text: "Done."});
                        msg.payload = result.data;
                        node.send(msg);
                    } else {
                        // sometimes the result is empty but an output was generated
                        // we will try it one last time
                        node.status({fill: "yellow", shape: "dot", text: "No result data ... trying to fetch output data one more time."});
                        await sleep(5 * 1000)
                        result = await msfrpc.session.meterpreter_read(msg.meterpreter.id)
                        if(result.data.length > 0) {
                            node.status({fill: "green", shape: "dot", text: "Done."});
                            msg.payload = result.data;
                            node.send(msg);
                        } else {
                            node.status({fill: "yellow", shape: "dot", text: "No result data."});
                            msg.payload = result.data;
                            node.send(msg);
                        }
                    }
                } catch (error) {
                    node.status({fill: "red", shape: "dot", text: error});
                    node.error(error, msg)
                }
            });
        } catch (err) {
            console.log(err)
            node.error(err)
        }
    }

    RED.nodes.registerType("MsfRpc: Session Command", MsfRpcSessionCommandNode);
}
