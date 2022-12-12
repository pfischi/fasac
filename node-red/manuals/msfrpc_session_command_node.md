Das Modul führt Meterpreter-Kommandos über eine bestehende Meterpreter-Verbindung aus.

## **Eingänge**

: msg.payload (string): Meterpreter-Session-ID. Wird i.d.R. vom Baustein *MsfRpc - Listener Start* (in msg.meterpreter.id) geliefert.

## **Ausgänge**

Am Ausgang des Moduls wird das folgende Datenobjekt bereitgestellt:

: msg.payload (string): Ausgabe der Meterpreter-Konsole, was im Normalfall der Standardausgabe der Konsole des Zielsystems entspricht.

## **Konfiguration**

**Einstellung MsfRpc: Session Command**

- *Name:* Bezeichnung des Knotens, der frei gewählt werden kann (optional).
- *Meterpreter Command:* Auszuführendes Meterpreter-Kommando.
- *Delay Read:* Verzögerung in Sekunden, bevor die Standardausgabe der Meterpreter-Session gelesen wird.
Je nach Meterpreter-Kommando kann die Verarbeitung länger dauern, weshalb der Wert je nach Anwendungsfall entsprechend angepasst werden muss.

**Einstellungen MsfRpc Config** 

Die nachfolgenden Einstellungen ergeben sich aus den Parametern des Bausteins *Metasploit: Start*.

- *MsfRpc Host:* Host des MsfRPC-Services
- *MsfRpc Port:* Port des MsfRPC-Services
- *MsfRpc User:* Nutzernamen des MsfRPC-Services
- *MsfRpc Password:* Passwort des MsfRPC-Services.
- *Use SSL:* Verschlüsselte Verbindung?

## **Referenzen**

*Liste von Meterpreter-Kommandos*
https://www.offensive-security.com/metasploit-unleashed/meterpreter-basics/