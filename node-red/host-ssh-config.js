module.exports = function(RED) {
    function AwxHostSshConfig(config) {
        RED.nodes.createNode(this, config);
        this.host = config.host;
        this.port = config.port;
        this.username = config.username;
    }
    
    RED.nodes.registerType("host-ssh-config", AwxHostSshConfig, {
        credentials: {
            password: {
                type: "password" 
            }
        }
    });
}
