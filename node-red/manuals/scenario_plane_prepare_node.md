Bei der Ausführung des Moduls wird der Namespace des Szenarios eingerichtet. 
Dabei wird der Namespace verwendet, der in der Kubernetes-Konfiguration gesetzt ist.
In der vorliegenden Version wird eine Netzwerkrichtline installiert, die keinen ein- und ausgehende Kommunikatio des Szenario-Namespace zulässt.
Ausnahmen lassen sich in der Konfigurationsmaske definieren.
Das Modul wird in der Regel vor dem Start  des Szenarios als Baustein eingefügt.

## **Eingänge**

Der Baustein erwartet keine spezielle Datenstruktur am Eingang.

## **Ausgänge**

Die Ausgänge **Job Success** und **Job Failed** liefern die folgenden Objekte:

: msg.helmReleaseName (string) : Helm-Release-Name des gestarteten Kubernetes Workload.  Dieser Wert ist festgelegt (und unveränderbar) auf **prepare**. Dieser Wert kann zum Beenden des Workloads und für das Löschen von Workload-Ressourcen dem Baustein *Workload Stop* übergeben werden.

: msg.jobresult (array): Informationen über das ausgeführte Ansible Playbook zur Bereitstellung des Kubernetes-Workloads.

### Job success

Dieser Ausgang wird aufgerufen, wenn das Szenario erfolgreich eingerichtet wurde.

### Job failed

Der Ausgang wird aufgerufen, wenn ein Fehler beim Einrichten des Szenarios aufgetreten ist.

### Standard Output

: msg.payload (string) : Standardausgabe des Ansible-Prozesses, der den *Workload zum Einrichten des Szenarios* im Kubernetes-Cluster startet.

## **Konfiguration**

**Einstellung Scenario Plane Prepare**

- *Name:* Bezeichnung des Knotens, der frei gewählt werden kann (optional)
- *Scenario Plane Namespace:* (readonly) Name des einzurichtenden Namespace / Szenario
- *Allowed Communication Label:* Key/Value-Paar, das einen Namespace eindeutig identifiziert. 
Zu jedem so spezifizierten Namespace wird eine ein- und ausgehende Kommunikation erlaubt. 
Hier muss i.d.R. mindestens der Namesapce der Kontrollschicht eingetragen werden (z.B. *plane=fasac-control* ==> key: plane, value: fasac-control)
Es können mehrere Namespaces mit den entsprechenden Key/Value-Paaren angegeben werden.

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
https://github.com/spfuu/fasac/blob/main/ansible_playbooks/helm_install.yml

*Verwendetes Helm Chart*
https://github.com/spfuu/fasac/tree/main/kubernetes/fasac-scenario

*Die vom Modul installierte Netzwerkrichtlinie*
https://github.com/spfuu/fasac#netzwerkrichtlinie

*Label für den Namespace der Kontrollschicht*
https://github.com/spfuu/fasac#labels-f%C3%BCr-die-kontrollschicht

*Struktur einer Ansible-Jobinformation:* 
https://docs.ansible.com/ansible-tower/3.2.3/html/towerapi/job_list.html#results