# Warema WMS Bridge – Home Assistant app

**[English](#english) · [Deutsch](#deutsch)**

[![Add repository to Home Assistant](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2FBaronT808%2FAddon-Warema-Bridge)

---

## English

Control your **Warema WMS** blinds, awnings and weather station from Home Assistant via MQTT,
using a Warema WMS USB stick.

### 1. About this fork

I am not a programmer. I use Home Assistant at home and wanted my Warema blinds to work reliably.
The analysis of the problem, the fix and this whole repository were created by
**Claude (Anthropic's AI assistant)** in conversation with me. I described the problem, tested
it on my own system and decided what goes in. I can report problems and test, but I cannot review
the code myself like a developer would.

This is a fork of [santam85/addon-warema-wms](https://github.com/santam85/addon-warema-wms),
which itself is based on [giannello/addon-warema-bridge](https://github.com/giannello/addon-warema-bridge)
and the node module [warema-wms-venetian-blinds](https://www.npmjs.com/package/warema-wms-venetian-blinds).
All credit for the bridge and the WMS protocol work goes to the original authors.

### 2. What is different in this fork?

| Problem in the original | Fix in this fork |
|---|---|
| If the USB stick disconnects for even a second (loose contact, power glitch, reboot timing), the bridge keeps running with a dead connection. Every command ends in `wmsRetry` / `wmsTimeout` until you restart the app manually. | The bridge detects the closed port and restarts itself within a few seconds. If the stick is still missing, it keeps retrying until it is back. |
| A stick that hangs without closing the port is not noticed either. | Second safety net: if the stick sends nothing for 5 minutes, the bridge restarts (configurable, `0` disables it). |
| Version is always `dev`, so Home Assistant never offers updates. | Real version numbers and a changelog. |
| Options without explanation. | Every option has a name and a description in English and German. |
| Prebuilt image from 2023, outdated base image. | Current Home Assistant base image, images built automatically for `aarch64` (Raspberry Pi 4/5) and `amd64`. |

### 3. What you need

- Home Assistant **OS** or **Supervised** (apps are not available in Container/Core installations)
- A **Warema WMS USB stick**
- The **Mosquitto broker** app and the **MQTT** integration
- Only if you do not know your WMS network parameters yet: a **WMS hand-held transmitter plus**
  (the remote with the battery case and the buttons A, C, STOP and +)

### 4. Installation step by step

**Step 1 – Set up MQTT** (skip if you already use MQTT)
1. **Settings → Apps → App store**, search for **Mosquitto broker**, install and start it.
2. **Settings → Devices & services**: Home Assistant usually discovers MQTT automatically.
   Click **Configure** and confirm.

**Step 2 – Add this repository**
1. Click the blue button at the top of this page, **or**:
2. **Settings → Apps → App store → ⋮ (top right) → Repositories**.
3. Paste `https://github.com/BaronT808/Addon-Warema-Bridge` and click **Add**, then **Close**.

**Step 3 – Install the app**
1. Reload the app store page (F5). Scroll down to **Warema WMS Bridge (BaronT808)**.
2. Click **Warema Bridge → Install**. Do not start it yet.

**Step 4 – Select the USB stick**
1. Plug the WMS stick into your Home Assistant device.
2. In the app, open the **Configuration** tab.
3. Under **WMS USB stick** choose the entry that starts with
   `/dev/serial/by-id/usb-FTDI_FT232R_USB_UART_...`. Do not use `/dev/ttyUSB0`.

**Step 5 – Network parameters (channel, PAN ID, key)**

*You already know them* (e.g. from a previous installation)? Enter them in **WMS radio channel**,
**WMS PAN ID** and **WMS network key**, save and continue with step 6.

*You do not know them?* Then let the app discover them:
1. Leave **WMS PAN ID** empty (or enter `FFFF`), save and **start** the app.
2. Open the **Log** tab. The app shows instructions and waits **3 minutes** for you.
3. Open the battery case of the WMS hand-held transmitter and select the channel of your blinds with **(+)**.
4. Press the **learn button** in the battery case for about **5 seconds** until the LEDs turn green.
   The transmitter now searches for receivers.
5. Each time the search stops with a **red LED**, press **(A)** and look at the log (refresh it):
   - The log shows `*** Waving and Hello!` → the stick was found. Press **STOP**.
   - Nothing appears → another device was found. Press **(C)** to go to the next one.
6. After STOP the log shows **Channel**, **PanId** and **Key**. Write them down.
7. Press the learn button briefly to end the search on the transmitter.
8. Stop the app, enter the three values in the configuration and save.

If 3 minutes pass, the log shows a timeout. Just restart the app and try again.

**Step 6 – Start and check**
1. Start the app. In the log you should see `Scanned devices` with the serial numbers (SNR) of your
   blinds, followed by `Registered devices`.
2. Recommended: copy these serial numbers into **Forced devices** (e.g. `123456,234567`).
   Then all blinds are reliably created after every start, even if one does not answer the scan.
3. Your blinds appear in Home Assistant under **Settings → Devices & services → MQTT** and are named
   after their serial number. Rename them there as you like.
4. Turn on **Start on boot** and **Watchdog** on the app's **Info** tab.

### 5. Options

| Option | What it does |
|---|---|
| WMS USB stick (`wms_serial_port`) | Port of the stick. Usually `/dev/serial/by-id/usb-FTDI_FT232R_USB_UART_XXXXXXXX-if00-port0`. |
| WMS network key (`wms_key`) | 32-character key of your WMS network. |
| WMS PAN ID (`wms_pan_id`) | 4-character network ID, e.g. `3C6C`. Empty or `FFFF` = discovery mode. |
| WMS radio channel (`wms_channel`) | Radio channel of your WMS network, e.g. `17`. |
| Ignored devices (`ignored_devices`) | Serial numbers that should not be created, comma-separated. |
| Forced devices (`force_devices`) | Serial numbers that are always created, comma-separated. Optionally `SNR:TYPE` (25 = radio motor, default). |
| Polling interval (`polling_interval`) | Milliseconds between position requests. Default `30000`. |
| Polling interval while moving (`moving_interval`) | Milliseconds between position requests for a moving blind. Default `1000`. |
| Stick watchdog (`stick_silence_limit`) | Seconds without data from the stick before the app restarts. Default `300`, `0` = off. |
| Log level (`log_level`) | `error`, `warn`, `info` (default) or `debug`. |

### 6. Switching from the original app

1. Copy your settings from the old app (port, key, PAN ID, channel, forced/ignored devices) into this app.
2. Stop the old app and turn off its **Start on boot**. Never run both at the same time.
3. Start this app. Your blinds keep their entity IDs because they are identified by serial number.
4. If you had automations that restart the old app, you can turn them off.
5. When everything runs fine for a while, uninstall the old app.

### 7. Troubleshooting

| Log message | Meaning |
|---|---|
| `port closed (USB device disconnected). Exiting, the bridge will be restarted automatically.` | The stick was disconnected. The app restarts itself – nothing to do. If this happens often, use a short USB extension cable or a powered USB hub. |
| `cannot open /dev/serial/by-id/...` repeated every few seconds | The stick is missing. The app keeps retrying and continues as soon as it is back. |
| `wmsRetry blindGetPos ...` | A blind did not answer at once and is asked again. Single retries are normal, especially while it moves. If it is always the same blind, its radio reception is weak – move the stick to a better spot. |
| `wmsTimeout` for all blinds | No radio connection. Check channel, PAN ID and key. |

### 8. Credits and license

This fork is built on the work of others. Many thanks to:

- **Giuseppe Iannello** ([giannello](https://github.com/giannello)) – the original Warema bridge app
- **Marco Santarelli** ([santam85](https://github.com/santam85/addon-warema-wms)) – improved version this fork is based on
- the author of the node module **[warema-wms-venetian-blinds](https://www.npmjs.com/package/warema-wms-venetian-blinds)** –
  the communication with the stick and the WMS radio protocol

The license in plain words:

- The module *warema-wms-venetian-blinds* (the core that talks to the stick) is under the **MIT license**.
  It explicitly allows using, changing and sharing the code as long as the author is credited.
  The USB fix of this fork is in this module.
- For the rest of the app by giannello and santam85 no license is stated. It is continued here
  with full credit to its authors.
- My own changes (fix, documentation, option descriptions, app layout) may be used freely by
  anyone, also under the MIT license.

If one of the original authors does not agree with this, please open an issue here.

---

## Deutsch

Steuert **Warema WMS**-Rollos, -Markisen und die Wetterstation über einen Warema-WMS-USB-Stick und MQTT
aus Home Assistant.

### 1. Über diesen Fork

Ich bin kein Programmierer. Ich nutze Home Assistant zu Hause und wollte, dass meine Warema-Rollos
zuverlässig funktionieren. Die Fehleranalyse, der Fix und das ganze Repository wurden von
**Claude (KI-Assistent von Anthropic)** im Gespräch mit mir erstellt. Ich habe das Problem beschrieben,
auf meinem eigenen System getestet und entschieden, was reinkommt. Ich kann Fehler melden und testen,
den Code selbst aber nicht wie ein Entwickler prüfen.

Dies ist ein Fork von [santam85/addon-warema-wms](https://github.com/santam85/addon-warema-wms),
das auf [giannello/addon-warema-bridge](https://github.com/giannello/addon-warema-bridge)
und dem Node-Modul [warema-wms-venetian-blinds](https://www.npmjs.com/package/warema-wms-venetian-blinds) basiert.
Der Dank für die Bridge und die Arbeit am WMS-Protokoll gebührt den ursprünglichen Autoren.

### 2. Was ist anders an diesem Fork?

| Problem im Original | Lösung in diesem Fork |
|---|---|
| Trennt sich der USB-Stick auch nur kurz (Wackler, Stromschwankung, Neustart), läuft die Bridge mit toter Verbindung weiter. Alle Befehle enden in `wmsRetry` / `wmsTimeout`, bis man die App von Hand neu startet. | Die Bridge erkennt den geschlossenen Port und startet sich nach wenigen Sekunden selbst neu. Fehlt der Stick noch, versucht sie es weiter, bis er wieder da ist. |
| Ein Stick, der hängt, ohne dass der Port geschlossen wird, fällt ebenfalls nicht auf. | Zweites Sicherheitsnetz: Meldet sich der Stick 5 Minuten lang gar nicht, startet die Bridge neu (einstellbar, `0` schaltet es ab). |
| Die Version ist immer `dev`, Home Assistant bietet deshalb nie Updates an. | Echte Versionsnummern und ein Changelog. |
| Optionen ohne Erklärung. | Jede Option hat einen Namen und eine Beschreibung auf Deutsch und Englisch. |
| Fertiges Image von 2023, veraltetes Basis-Image. | Aktuelles Home-Assistant-Basis-Image, Images werden automatisch für `aarch64` (Raspberry Pi 4/5) und `amd64` gebaut. |

### 3. Was du brauchst

- Home Assistant **OS** oder **Supervised** (Apps gibt es bei Container-/Core-Installationen nicht)
- Einen **Warema-WMS-USB-Stick**
- Die App **Mosquitto broker** und die Integration **MQTT**
- Nur wenn du deine WMS-Netzwerkdaten noch nicht kennst: einen **WMS Handsender plus**
  (die Fernbedienung mit Batteriefach und den Tasten A, C, STOP und +)

### 4. Installation Schritt für Schritt

**Schritt 1 – MQTT einrichten** (überspringen, wenn du MQTT schon nutzt)
1. **Einstellungen → Apps → App Store**, nach **Mosquitto broker** suchen, installieren und starten.
2. **Einstellungen → Geräte & Dienste**: Home Assistant findet MQTT meist automatisch.
   Auf **Konfigurieren** klicken und bestätigen.

**Schritt 2 – Dieses Repository hinzufügen**
1. Auf den blauen Knopf oben auf dieser Seite klicken, **oder**:
2. **Einstellungen → Apps → App Store → ⋮ (oben rechts) → Repositories**.
3. `https://github.com/BaronT808/Addon-Warema-Bridge` einfügen, auf **Hinzufügen** und dann **Schließen** klicken.

**Schritt 3 – App installieren**
1. Die App-Store-Seite neu laden (F5). Nach unten scrollen zu **Warema WMS Bridge (BaronT808)**.
2. Auf **Warema Bridge → Installieren** klicken. Noch nicht starten.

**Schritt 4 – USB-Stick auswählen**
1. Den WMS-Stick in dein Home-Assistant-Gerät stecken.
2. In der App den Reiter **Konfiguration** öffnen.
3. Bei **WMS-USB-Stick** den Eintrag wählen, der mit
   `/dev/serial/by-id/usb-FTDI_FT232R_USB_UART_...` beginnt. Nicht `/dev/ttyUSB0` nehmen.

**Schritt 5 – Netzwerkdaten (Kanal, PAN-ID, Schlüssel)**

*Du kennst sie schon* (z. B. aus einer früheren Installation)? Dann trage sie bei **WMS-Funkkanal**,
**WMS-PAN-ID** und **WMS-Netzwerkschlüssel** ein, speichere und mach mit Schritt 6 weiter.

*Du kennst sie nicht?* Dann lass sie von der App ermitteln:
1. **WMS-PAN-ID** leer lassen (oder `FFFF` eintragen), speichern und die App **starten**.
2. Den Reiter **Log** öffnen. Die App zeigt eine Anleitung und wartet **3 Minuten** auf dich.
3. Das Batteriefach des WMS-Handsenders öffnen und mit **(+)** den Kanal deiner Rollos wählen.
4. Die **Lerntaste** im Batteriefach etwa **5 Sekunden** drücken, bis die LEDs grün leuchten.
   Der Handsender sucht jetzt nach Empfängern.
5. Jedes Mal, wenn die Suche mit **roter LED** stoppt, **(A)** drücken und ins Log schauen (neu laden):
   - Im Log steht `*** Waving and Hello!` → der Stick wurde gefunden. **STOP** drücken.
   - Es erscheint nichts → ein anderes Gerät wurde gefunden. Mit **(C)** zum nächsten wechseln.
6. Nach STOP zeigt das Log **Channel**, **PanId** und **Key**. Notiere dir die drei Werte.
7. Die Lerntaste kurz drücken, um die Suche am Handsender zu beenden.
8. Die App stoppen, die drei Werte in der Konfiguration eintragen und speichern.

Sind die 3 Minuten um, steht ein Timeout im Log. Dann einfach die App neu starten und es noch einmal versuchen.

**Schritt 6 – Starten und prüfen**
1. Die App starten. Im Log sollte `Scanned devices` mit den Seriennummern (SNR) deiner Rollos stehen,
   danach `Registered devices`.
2. Empfohlen: Diese Seriennummern bei **Fest eingetragene Geräte** eintragen (z. B. `123456,234567`).
   Dann werden alle Rollos nach jedem Start sicher angelegt, auch wenn eins beim Suchlauf nicht antwortet.
3. Deine Rollos erscheinen in Home Assistant unter **Einstellungen → Geräte & Dienste → MQTT** und heißen
   wie ihre Seriennummer. Dort kannst du sie beliebig umbenennen.
4. Im Reiter **Info** der App **Beim Booten starten** und **Watchdog** einschalten.

### 5. Optionen

| Option | Was sie macht |
|---|---|
| WMS-USB-Stick (`wms_serial_port`) | Anschluss des Sticks. In der Regel `/dev/serial/by-id/usb-FTDI_FT232R_USB_UART_XXXXXXXX-if00-port0`. |
| WMS-Netzwerkschlüssel (`wms_key`) | 32-stelliger Schlüssel deines WMS-Netzes. |
| WMS-PAN-ID (`wms_pan_id`) | 4-stellige Netzwerk-ID, z. B. `3C6C`. Leer oder `FFFF` = Suchmodus. |
| WMS-Funkkanal (`wms_channel`) | Funkkanal deines WMS-Netzes, z. B. `17`. |
| Ignorierte Geräte (`ignored_devices`) | Seriennummern, die nicht angelegt werden sollen, durch Komma getrennt. |
| Fest eingetragene Geräte (`force_devices`) | Seriennummern, die immer angelegt werden, durch Komma getrennt. Optional `SNR:TYP` (25 = Funkmotor, Standard). |
| Abfrageintervall (`polling_interval`) | Millisekunden zwischen Positionsabfragen. Standard `30000`. |
| Abfrageintervall bei Fahrt (`moving_interval`) | Millisekunden zwischen Positionsabfragen eines fahrenden Rollos. Standard `1000`. |
| Stick-Wächter (`stick_silence_limit`) | Sekunden ohne Daten vom Stick, bis die App neu startet. Standard `300`, `0` = aus. |
| Log-Stufe (`log_level`) | `error`, `warn`, `info` (Standard) oder `debug`. |

### 6. Umstieg von der Original-App

1. Deine Einstellungen aus der alten App (Anschluss, Schlüssel, PAN-ID, Kanal, fest eingetragene/ignorierte Geräte) in diese App übernehmen.
2. Die alte App stoppen und dort **Beim Booten starten** ausschalten. Nie beide gleichzeitig laufen lassen.
3. Diese App starten. Deine Rollos behalten ihre Entitäts-IDs, weil sie über die Seriennummer erkannt werden.
4. Hattest du Automationen, die die alte App neu starten, kannst du sie abschalten.
5. Läuft alles eine Weile stabil, die alte App deinstallieren.

### 7. Fehlersuche

| Meldung im Log | Bedeutung |
|---|---|
| `port closed (USB device disconnected). Exiting, the bridge will be restarted automatically.` | Der Stick war kurz getrennt. Die App startet sich selbst neu, du musst nichts tun. Passiert das oft, hilft eine kurze USB-Verlängerung oder ein aktiver USB-Hub. |
| `cannot open /dev/serial/by-id/...` alle paar Sekunden | Der Stick fehlt. Die App versucht es weiter und macht weiter, sobald er wieder da ist. |
| `wmsRetry blindGetPos ...` | Ein Rollo hat nicht sofort geantwortet und wird noch mal gefragt. Einzelne Retries sind normal, vor allem während der Fahrt. Ist es immer dasselbe Rollo, ist sein Funkempfang schwach – den Stick an eine bessere Stelle setzen. |
| `wmsTimeout` bei allen Rollos | Keine Funkverbindung. Kanal, PAN-ID und Schlüssel prüfen. |

### 8. Dank und Lizenz

Dieser Fork baut auf der Arbeit anderer auf. Vielen Dank an:

- **Giuseppe Iannello** ([giannello](https://github.com/giannello)) – die ursprüngliche Warema-Bridge-App
- **Marco Santarelli** ([santam85](https://github.com/santam85/addon-warema-wms)) – die verbesserte Version, auf der dieser Fork aufbaut
- den Autor des Node-Moduls **[warema-wms-venetian-blinds](https://www.npmjs.com/package/warema-wms-venetian-blinds)** –
  die Kommunikation mit dem Stick und das WMS-Funkprotokoll

Die Lizenz in einfachen Worten:

- Das Modul *warema-wms-venetian-blinds* (das Herzstück, das mit dem Stick spricht) steht unter der **MIT-Lizenz**.
  Sie erlaubt ausdrücklich, den Code zu nutzen, zu ändern und weiterzugeben, solange der Urheber genannt wird.
  Der USB-Fix dieses Forks steckt in diesem Modul.
- Für den Rest der App von giannello und santam85 ist keine Lizenz angegeben. Sie wird hier unter
  voller Nennung ihrer Autoren weitergeführt.
- Meine eigenen Änderungen (Fix, Doku, Optionsbeschreibungen, Aufbau der App) darf jeder frei verwenden,
  ebenfalls unter der MIT-Lizenz.

Ist einer der ursprünglichen Autoren damit nicht einverstanden, bitte hier ein Issue eröffnen.
