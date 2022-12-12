Das Modul startet einen Metasploit-Listener um eingehende Meterpreter-Verbindungen zu verarbeiten. 
Dazu interagiert das Modul mit einer Metasploit-Instanz, die mit dem Baustein *Metasploit: Start* bereitgestellte wurde.

## **Eingänge**

: msg.payload (array): JSON-Struktur, welche die Werte für die Erstellung eines *exploit/multi/handler* bereitstellt.
Beispiel:
```
{
    "PAYLOAD": "linux/x64/meterpreter_reverse_http",
    "LHOST": "metasploit.apt999.svc.cluster.local",
    "LPORT": "10000"
}
```
Diese Werte können z.B. mit dem Node-Red-Modul *Change* im Vorfeld festgelegt werden.

## **Ausgänge**

Am Ausgang des Moduls werden die folgenden Datenobjekte bereitgestellt:

: msg.meterpreter.id (string): ID der gestarteten Metasploit-Session. Wird dem Modul *MsfRpc - Session Command* zum Ausführen von Meterpreter-Kommandos übergeben.

: msg.meterpreter.info (array): Informationen zur Metasploit-Session.  

Im Fehlerfall wird eine Fehlermeldung ausgegeben und die weitere Verarbeitung abgebrochen.

## **Konfiguration**

**Einstellung MsfRpc: Listener Start**

- *Name:* Bezeichnung des Knotens, der frei gewählt werden kann (optional).
- *Wait Time:* Zeit in Sekunden (default: 3600) die das Modul auf eingehende Meterpreter-Verbindungen wartet.
- *Session-only connect:* Soll nur auf Meterpreter-BackConnect-Verbindungen reagiert werden, die sich mit dem in diesem Modul eingerichteten Listener verbinden?
Wenn nein, dann reagiert dieses Modul auf alle eingehenden Meterpreter-Verbindungen, wobei aber NUR die neuste Session aller existierenden Meterpreter-Verbindungen zum Server genutzt wird.

**Einstellungen MsfRpc Config** 

Die nachfolgenden Einstellungen ergeben sich aus den Parametern des Bausteins *Metasploit: Start*.

- *MsfRpc Host:* Host des MsfRPC-Services
- *MsfRpc Port:* Port des MsfRPC-Services
- *MsfRpc User:* Nutzernamen des MsfRPC-Services
- *MsfRpc Password:* Passwort des MsfRPC-Services.
- *Use SSL:* Verschlüsselte Verbindung?

## **Referenzen**

*Informationen / Optionen Metasploit Generic Payload Handler*
https://www.infosecmatter.com/metasploit-module-library/?mm=exploit/multi/handler