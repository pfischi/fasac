module.exports = function(RED) {
    function AwxConfigNode(config) {
        RED.nodes.createNode(this, config);
        this.host = config.host;
        this.port = config.port;
        this.rejectUnauthorized = config.rejectUnauthorized;
        this.useTLS = config.useTLS
        var port = this.port ? `:${this.port}` : ""
        var prefix = this.useTLS ? "https://" : "http://"
        this.url = prefix + this.host + port
    }

    RED.nodes.registerType("awx-config", AwxConfigNode, {
        credentials: {
            token: {
                type: "password" 
            }
        }
    });
}