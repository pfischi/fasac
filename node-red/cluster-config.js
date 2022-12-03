module.exports = function(RED) {
    function ClusterConfigNode(config) {
        RED.nodes.createNode(this, config);
        this.kubeApiUrl = config.host;
        this.kubeNamespace = config.namespace;
        this.rejectUnauthorized = config.rejectUnauthorized;
        this.helmRepoUrl = config.helmRepoUrl;
        this.clusterName = config.clusterName;
        this.helmCA =config.helmCA
    }

    RED.nodes.registerType("cluster-config", ClusterConfigNode, {
        credentials: {
            token: {
                type: "password" 
            }
        }
    });
}