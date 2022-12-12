Bei der Ausführung des Moduls werden alle Ressourcen eines Namespaces gelöscht. 
Dabei wird der Namespace verwendet, der in der Kubernetes-Konfiguration gesetzt ist.
Wird in der Regel vor dem Start und nach Beendigung des Szenarios als Baustein eingefügt.

## **Eingänge**

Der Baustein erwartet keine spezielle Datenstruktur am Eingang.

## **Ausgänge**

Die Ausgänge **Job Success** und **Job Failed** liefern das folgende Objekt:

: msg.jobresult (array): Informationen über das ausgeführte Ansible Playbook zur Bereitstellung des Kubernetes-Workloads.

### Job success

Dieser Ausgang wird aufgerufen, wenn die Ressourcen des Namespaces erfolgreich gelöscht werden konnten.

### Job failed

Der Ausgang wird aufgerufen, wenn ein Fehler beim Löschen der Namespace-spezifischen Kubernetes-Ressourcen aufgetreten ist.

### Standard Output

: msg.payload (string) : Standardausgabe des Ansible-Prozesses, der den *Workload zum Löschen der Ressourcen* im Kubernetes-Cluster startet.

## **Konfiguration**

**Einstellungen Scenario Plane Clean**
- *Name:* Bezeichnung des Knotens, der frei gewählt werden kann (optional)

**Einstellungen AWX** 

- *AWX Host:* cluster-interne URL zur AWX-API (Bsp: awx-service.awx.svc.cluster.local)
- *AWX Port:* cluster-interner Port des AWX-API-Service (z.B. 80)
- *AWX Token:* Nutzertoken für den Zugriff auf die Job Templates in AWX
- *Use TLS:* verschlüsselte Verbindung zur AWX-API? (default: no)
- *Verify Certificates:* Nur signierte Zertifikate erlaubt? (default: no)

**Einstellungen Kubernetes**

- *Kubernetes API URL:* Cluster-interne Adresse der Kubernetes-API-Schnittstelle  (z.B. https://172.16.30.169:6443)
- *Kubernetes API Token:* Nutzer-Token für den Zugriff auf den Kubernetes-Cluster. Dieser Token muss alle erfoderlichen Rechte für den Namespace aufweisen,
in dem das Szenario ausgeführt wird.
- *Kubernetes Namespace:* Namespace, in dem der Kubernetes Workload installiert wird.
- *Kubernetes Cluster Name:* Domänenname des Kubernetes Cluster. (default: cluster.local)
- *Helm Repository URL:* Adresse des Helm Repository, der die Helm Charts zum Starten der 
Kubernetes Workloads vorhält. (z.B. https://harbor.cyber/chartrepo/cyber-range)
- *Verify certificates:* Soll der Zugriff auf die Kubernetes-API nur mit signierten Zertifikaten 
erlaubt sein? (default: no)

## **Referenzen**

*Verwendetes Ansible-Playbook*
https://github.com/spfuu/fasac/blob/main/ansible_playbooks/helm_delete.yaml

*Struktur einer Ansible-Jobinformation:* 
https://docs.ansible.com/ansible-tower/3.2.3/html/towerapi/job_list.html#results