Das Modul startet ein VM im Kubernetes Cluster. Die VM lässt sich durch ein *Cloud Init User Data*-Skript beim Start dynamisch anpassen. 

## **Eingänge**

Dieses Modul übernimmt keine Werte aus der msg-Datenstruktur am Eingang. Alle Werte werden über 
die Konfigurationsmaske des Bausteins parameterisiert.

## **Ausgänge**

Die Ausgänge **Job success** und **Job failed** liefern die folgenden Objekte:

: msg.helmReleaseName (string) : Helm-Release-Name des gestarteten Kubernetes Workload. Dieser Wert kann zum Beenden des Workloads und für das Löschen von Workload-Ressourcen dem Baustein *Workload Stop* übergeben werden.

: msg.jobresult (array): Informationen über das ausgeführte Ansible Playbook zur Bereitstellung des Kubernetes-Workloads.

### Job success

Dieser Ausgang wird aufgerufen, wenn die VM erfolgreich erzeugt wurde. 
Als *Ready*-Bedingung des erfolgreichen Starts der VM wird die Erreichbarkeit des SSH-Service der VM ausgewertet. 
Ein von außen erreichbarer SSH-Service ist somit Voraussetzung für das erfolgreiche Starten des Moduls.

### Job failed

Der Ausgang wird aufgerufen, wenn die VM nicht erstellt werden konnte.

### Standard Output

: msg.payload (string) : Standardausgabe des Ansible-Prozesses, der den Workload zum Erstellen der VM im Kubernetes-Cluster startet.

## **Konfiguration**

**Einstellung VM: Start**

- *Name:* Bezeichnung des Knotens, der frei gewählt werden kann (optional)
- *Helm Release Name:* Ein Wert, der dem Kubernetes Workload zugeordnet wird und alle zum Workload 
zugehörigen Ressourcen eindeutig identifiziert. Der *Helm Release Name* wird für das vollständige 
Löschen des Workloads im Cluster benötigt. Der Parameter wird mit einem zufälligen Wert initialisiert 
und kann manuell überschrieben werden.
- *SSH Service Name:* Name des SSH-Services der VM, über den der Service im Cluster erreichbar sein soll.
Der interne SSH-Port des Containers muss auf Port 22 konfiguriert sein.
Der Wert wird zufällig gewählt und kann manuell überschrieben werden.
- *SSH Port*: SSH-Port über den der SSH-Service der VM im Cluster erreichbar sein soll. 
Der SSH-Port der VM muss auf Port 22 konfiguriert sein.
- *SSH accessible via*: (readonly) Adresse des SSH-Service im Cluster.
- *Cloud Image*: Docker-Registry-Pfad eines Cloud-Images im Docker-Container-Format.
- *Cloud Init User Data*: Cloud-Init-Usert-Data-Skript, das beim Starten der VM ausgeführt wird. Beispiel: 
```
#cloud-config
users:
- default
- name: dispo
  gecos: Dieter Disponent
  lock_passwd: false
  sudo: ALL=(ALL) NOPASSWD:ALL
  passwd: $6$.B8Gf42rJ0V4P1VY$i02rEk8mYBJUW9xgNnjPBDnh0nWjKUE6cK4gLiOP0Nb5gTh1OO9uNYaBt.PSKm2mKcWl6bYSJZljOy6eqmG2K1
ssh_pwauth: True
write_files:
- content: |
    Super secret data! Do not view unless you have the clearance.
  path: /home/dispo/healthforever-contacts.txt
```

Die erste Zeile ```#cloud-config``` muss gesetzt sein.

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
https://github.com/spfuu/fasac/tree/main/kubernetes/fasac-vm

*Bereitstellung und Anpassungen von Cloud-Images*
https://github.com/spfuu/fasac#bereitstellung-und-anpassungen-von-cloud-images

*Dokumentation zu Cloud-Init-User-Data*
https://cloudinit.readthedocs.io/en/latest/topics/format.html

*Struktur einer Ansible-Jobinformation:* 
https://docs.ansible.com/ansible-tower/3.2.3/html/towerapi/job_list.html#results