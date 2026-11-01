# Roadmap

**[English](#english) · [Deutsch](#deutsch)**

---

## English

Planned improvements. Every change is first built on a test branch and tested on a real system before it is released.

### 1.1.0 – Better integration in Home Assistant

- **Proper icons:** Covers get a device class (shutter, blind or awning, selectable), so Home Assistant shows the matching icon that changes with the position.
- **"Wink" button per blind:** The blind briefly moves up and down, so you can see which one it is (uses the WMS wave command).
- **Correct model name:** "WMS radio motor" instead of "Vertical awning".
- **Radio quality per blind:** A sensor that counts how often a blind needs a second attempt (`wmsRetry`). Shows weak radio reception at a glance.
- **Notification on repeated problems:** If the bridge restarts 4 times within one hour, a notification appears in Home Assistant.

### 1.2.0 – Bridge status and presentation

- **"Warema WMS Bridge" device in Home Assistant**, with:
  - Stick connected (yes/no)
  - Last stick disconnect and number of automatic restarts
  - Buttons "Scan for blinds" and "Restart bridge"
- **README:** badges (version, supported platforms, build status) and screenshots.

### 2.0.0 – Setup assistant

A setup page inside the app (sidebar / "Open web UI"):

1. Scan for blinds with one click
2. "Wink" next to each blind to identify it, and give it a name right away
3. Choose the type for each blind (shutter, blind, awning)
4. Show the radio quality per blind
5. Save – the assistant fills in the configuration (incl. forced devices) by itself

---

## Deutsch

Geplante Verbesserungen. Jede Änderung wird zuerst auf einem Testzweig gebaut und an einem echten System getestet, bevor sie veröffentlicht wird.

### 1.1.0 – Bessere Einbindung in Home Assistant

- **Passende Symbole:** Die Rollos bekommen eine Geräteart (Rollladen, Jalousie oder Markise, einstellbar), damit Home Assistant das passende Symbol zeigt, das sich mit der Position verändert.
- **„Winken“-Knopf pro Rollo:** Das Rollo bewegt sich kurz hoch und runter, damit man sieht, welches es ist (nutzt den WMS-Befehl zum Winken).
- **Richtiger Modellname:** „WMS-Funkmotor“ statt „Vertical awning“.
- **Funkqualität pro Rollo:** Ein Sensor zählt, wie oft ein Rollo einen zweiten Anlauf braucht (`wmsRetry`). So sieht man schwachen Funkempfang auf einen Blick.
- **Meldung bei Dauerproblemen:** Startet die Bridge 4-mal innerhalb einer Stunde neu, erscheint eine Meldung in Home Assistant.

### 1.2.0 – Bridge-Status und Auftritt

- **Gerät „Warema WMS Bridge“ in Home Assistant**, mit:
  - Stick verbunden (ja/nein)
  - Letzte Stick-Trennung und Anzahl der automatischen Neustarts
  - Knöpfe „Rollos neu suchen“ und „Bridge neu starten“
- **README:** Plaketten (Version, unterstützte Plattformen, Build-Status) und Screenshots.

### 2.0.0 – Einrichtungsassistent

Eine Einrichtungsseite direkt in der App (Seitenleiste / „Benutzeroberfläche öffnen“):

1. Rollos per Knopfdruck suchen
2. Neben jedem Rollo „Winken“, um es zu erkennen, und direkt einen Namen vergeben
3. Für jedes Rollo die Art wählen (Rollladen, Jalousie, Markise)
4. Funkqualität pro Rollo anzeigen
5. Speichern – der Assistent trägt die Konfiguration (inkl. fest eingetragener Geräte) selbst ein
