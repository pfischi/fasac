module.exports = function(RED) {
    function MsfRpcConfigNode(config) {
        RED.nodes.createNode(this, config);

        var urlPrexix = "http";
        if (config.msfrpcSSL) {
            urlPrexix = "https";
        }

        this.msfrpcUri = urlPrexix + '://' + config.msfrpcUser + ':' +
            config.msfrpcPassword + '@' + config.msfrpcHost + ':' + config.msfrpcPort;
    }
    RED.nodes.registerType("MsfRpc: Config", MsfRpcConfigNode);
}
