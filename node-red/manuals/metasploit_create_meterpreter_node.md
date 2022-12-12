Das Modul erzeugt einen Meterpreter des Metasploit-Frameworks und stellt diesen über eine Web-Adresse zum
Download zur Verfügung. Die Erstellung erfolgt über einen Container im Kubernetes-Cluster.

## **Eingänge**

Dieses Modul übernimmt keine Werte aus der msg-Datenstruktur am Eingang. Alle Werte werden über 
die Konfigurationsmaske des Bausteins parameterisiert.

## **Ausgänge**

Die Ausgänge **Job success** und **Job failed** liefern die folgenden Objekte:

: msg.helmReleaseName (string) : Helm-Release-Name des gestarteten Kubernetes Workload. Dieser Wert kann zum Beenden des Workloads und für das Löschen von Workload-Ressourcen dem Baustein *Workload Stop* übergeben werden.

: msg.jobresult (array): Informationen über das ausgeführte Ansible Playbook zur Bereitstellung des Kubernetes-Workloads.

### Job success

Dieser Ausgang wird aufgerufen, wenn der Meterpreter erfolgreich erzeugt wurde.

: msg.payload (string): Web-URL zum Download des erstellten Meterpreters.

### Job failed

Der Ausgang wird aufgerufen, wenn der Meterpreter nicht erstellt werden konnte.

### Standard Output

: msg.payload (string) : Standardausgabe des Ansible-Prozesses, der den Workload zum Erstellen des Meterpreters im Kubernetes-Cluster startet.

## **Konfiguration**

**Einstellung Meterpreter**

- *Name:* Bezeichnung des Knotens, der frei gewählt werden kann (optional)
- *Helm Release Name:* Ein Wert, der dem Kubernetes Workload zugeordnet wird und alle zum Workload 
zugehörigen Ressourcen eindeutig identifiziert. Der *Helm Release Name* wird für das vollständige 
Löschen des Workloads im Cluster benötigt. Der Parameter wird mit einem zufälligen Wert initialisiert 
und kann manuell überschrieben werden.
- *Service Name:* Name des Services im Cluster, über den der Web-Server zum Download des Meterpreters 
Cluster-intern erreichbar ist. Der Wert wird zufällig gewählt und kann manuell überschrieben werden. Die komplette Adresse lautet dann wie folgt: 
\<SERVICE-NAME\>.\<NAMESPACE\>.svc.cluster.local:80. Diese Adresse wird bei einem erfolgreichen Bauvorgang des Meterpretes über die Variable 
*msg.payload* am Ausgang *Job success* zur Verfügung gestellt.
- *Payload*: Payload des zu erstellenden Meterpreters, mit dem sich das Beacon zum Metasploit-C2-Server zurückmeldet.
- *LHOST*: Adresse des Metasploit-C2-Servers. 
- *LPORT*: Port des Metasploit-C2-Servers.
- *Format*: Datei-Format des Meterpreters.
- *Job Timout:* Nach Ablauf dieses Zeitwerts (in sek) wird der Start des Kubernetes Workloads 
abgebrochen. Je nach Performance des Clusters und der Komplexität des Workloads ist an dieser Stelle 
ein höherer Wert zu wählen.

**Einstellungen AWX** 

- *AWX Host:* cluster-interne URL zur AWX-API (Bsp: awx-service.awx.svc.cluster.local)
- *AWX Port:* cluster-interner Port des AWX-API-Service (z.B. 80)
- *AWX Token:* Nutzertoken für den Zugriff auf die Job Templates in AWX
- *Use TLS:* verschlüsselte Verbindung zur AWX-API? (default: no)
- *Verify Certificates:* Nur signierte Zertifikate erlaubt? (default: no)

**Einstellungen Kubernetes**

- *Kubernetes API URL:* Cluster-interne Adresse der Kubernetes-API-Schnittstelle 
(z.B. https://172.16.30.169:6443)
- *Kubernetes API Token:* Nutzer-Token für den Zugriff auf den Kubernetes-Cluster. 
Dieser Token muss alle erfoderlichen Rechte für den Namespace aufweisen, 
in dem das Szenario ausgeführt wird.
- *Kubernetes Namespace:* Namespace, in dem der Kubernetes Workload installiert wird.
- *Kubernetes Cluster Name:* Domänenname des Kubernetes Cluster. (default: cluster.local)
- *Helm Repository URL:* Adresse des Helm Repository, der die Helm Charts zum Starten der 
Kubernetes Workloads vorhält. (z.B. https://harbor.cyber/chartrepo/cyber-range)
- *Verify certificates:* Soll der Zugriff auf die Kubernetes-API nur mit signierten Zertifikaten 
erlaubt sein? (default: no)

## **Referenzen**

*Verwendetes Ansible-Playbook*
https://github.com/spfuu/fasac/blob/main/ansible_playbooks/helm_install.yml

*Verwendetes Helm Chart*
https://github.com/spfuu/fasac/tree/main/kubernetes/msfvenom

*Metasploit Reverse Shells*
https://docs.metasploit.com/docs/using-metasploit/basics/how-to-use-a-reverse-shell-in-metasploit.html

*Struktur einer Ansible-Jobinformation:* 
https://docs.ansible.com/ansible-tower/3.2.3/html/towerapi/job_list.html#results