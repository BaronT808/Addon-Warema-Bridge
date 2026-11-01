# Warema WMS Bridge – Home Assistant app

Control your **Warema WMS** blinds, awnings and weather station from Home Assistant via MQTT,
using a Warema WMS USB stick.

**This is a fork** of [santam85/addon-warema-wms](https://github.com/santam85/addon-warema-wms),
which itself is based on [giannello/addon-warema-bridge](https://github.com/giannello/addon-warema-bridge)
and the node module [warema-wms-venetian-blinds](https://www.npmjs.com/package/warema-wms-venetian-blinds).
All credit for the bridge and the WMS protocol work goes to the original authors.

## About this fork / How it was made

I am not a programmer. I use Home Assistant at home and wanted my Warema blinds to work reliably.
The analysis of the problem, the fix and this whole repository were created by
**Claude (Anthropic's AI assistant)** in conversation with me. I described the problem, tested
it on my own system and decided what goes in.

Please keep that in mind: I can report problems and test, but I cannot review the code myself
like a developer would.

## What is different in this fork?

| Problem in the original | Fix in this fork |
|---|---|
| If the WMS USB stick disconnects for even a second (USB power glitch, reboot timing), the bridge keeps running with a dead connection. Every command ends in `wmsRetry` / `wmsTimeout` until you restart the app manually. | The bridge detects the closed port and restarts itself within a few seconds, then re-opens the stick. If the stick is still missing, it keeps retrying. |
| A stick that hangs without closing the port is not noticed either. | Second safety net: if the stick sends nothing for 5 minutes although the bridge keeps polling, the bridge restarts (configurable, `0` disables it). |
| Version is always `dev`, so Home Assistant never offers updates. | Real version numbers and a changelog. |
| Prebuilt image from 2023, outdated base image. | Current Home Assistant base image, images built automatically by GitHub Actions for `aarch64` (Raspberry Pi 4/5) and `amd64`. |

## Installation

1. In Home Assistant go to **Settings → Apps → App store → ⋮ → Repositories**.
2. Add `https://github.com/BaronT808/addon-warema-bridge`.
3. Install **Warema Bridge** and configure it (see the *Documentation* tab of the app).

Moving from the original app? Copy your settings (serial port, key, PAN ID, channel,
forced/ignored devices) over, stop the old app and start this one. Your covers keep their
entity IDs because they are identified by the device serial numbers.

---

## Deutsch

Steuert **Warema WMS**-Rollos, -Markisen und die Wetterstation über einen WMS-USB-Stick und MQTT
aus Home Assistant.

Dies ist ein **Fork** von [santam85/addon-warema-wms](https://github.com/santam85/addon-warema-wms)
(basierend auf [giannello/addon-warema-bridge](https://github.com/giannello/addon-warema-bridge)).
Der Dank für Bridge und Protokoll gebührt den ursprünglichen Autoren.

**Über diesen Fork:** Ich bin kein Programmierer. Die Fehleranalyse, der Fix und das ganze
Repository wurden von **Claude (KI-Assistent von Anthropic)** im Gespräch mit mir erstellt.
Ich habe das Problem beschrieben, auf meinem eigenen System getestet und entschieden, was
reinkommt. Den Code selbst wie ein Entwickler prüfen kann ich nicht.

**Was ist anders?**
- Trennt sich der USB-Stick kurz (Wackler, Stromschwankung, Neustart), startet sich die Bridge
  nach wenigen Sekunden selbst neu und öffnet den Stick neu. Vorher liefen alle Befehle ins Leere,
  bis man die App von Hand neu gestartet hat.
- Zusätzlich: Meldet sich der Stick 5 Minuten lang gar nicht, startet die Bridge ebenfalls neu
  (einstellbar, `0` schaltet das ab).
- Echte Versionsnummern, aktuelles Basis-Image, fertige Images für Raspberry Pi und PC.

**Installation:** Einstellungen → Apps → App Store → ⋮ → Repositories →
`https://github.com/BaronT808/addon-warema-bridge` hinzufügen → **Warema Bridge** installieren.

## License

The upstream projects do not include a license file. Until this is clarified with the original
authors, this fork is published for personal use and to offer the fix back upstream.
