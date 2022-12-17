# node-red-contrib-fasac

Node-RED-Modul zur Bereitstellung von Szenario-Bausteinen für FASAC, einem Framework zur automatisierten Simulation von APT-Szenarien in einem Kubernetes-Cluster.

## FASAC
Die Bausteine sind Teil des Frameworks FASAC, das für eine Simulation von APT-Angriffe konzipiert wurde. Eine komplette Beschreibung von FASAC kann im [Github-Verzeichnis des Projekts](https://github.com/spfuu/fasac) abgerufen werden.

## Installation

Die Installation der Module erfolgt entweder über den Palettenmanager von Node-RED oder über die Kommandozeile:

```bash
npm install node-red-contrib-fasac
```

## Node-RED-Module

- [Mailserver: Start](https://github.com/spfuu/fasac/tree/main/node-red/manuals/mailserver_start_node.md)
- [Metasploit: Start](https://github.com/spfuu/fasac/tree/main/node-red/manuals/metasploit_start_node.md)
- [Metasploit: Create Meterpreter](https://github.com/spfuu/fasac/tree/main/node-red/manuals/metasploit_create_meterpreter_node.md)
- [MsfRpc: Listener Start](https://github.com/spfuu/fasac/tree/main/node-red/manuals/msfrpc_listener_start_node.md)
- [MsfRpc: Session Command](https://github.com/spfuu/fasac/tree/main/node-red/manuals/msfrpc_session_command_node.md)
- [Scenario Plane: Prepare](https://github.com/spfuu/fasac/tree/main/node-red/manuals/scenario_plane_prepare_node.md)
- [Scenario Plane: Clean](https://github.com/spfuu/fasac/tree/main/node-red/manuals/scenario_plane_clean_node.md)
- [VM: Start](https://github.com/spfuu/fasac/tree/main/node-red/manuals/vm_start_node.md)
- [Workload: Stop](https://github.com/spfuu/fasac/tree/main/node-red/manuals/workload_stop_node.md)