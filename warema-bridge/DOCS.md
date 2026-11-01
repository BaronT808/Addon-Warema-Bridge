# Warema Bridge

Connects a **Warema WMS USB stick** to Home Assistant via MQTT. Covers (and the weather
station, if present) are created automatically through MQTT discovery.

Requirements: the **Mosquitto broker** app and the MQTT integration.

## Automatic recovery

If the USB stick disconnects or stops answering, the bridge restarts itself after a few seconds
and re-opens the stick. You will see a line like this in the log:

```
/dev/serial/by-id/usb-FTDI_... port closed (USB device disconnected). Exiting, the bridge will be restarted automatically.
```

If this happens often, check the USB connection of the stick. A short USB extension cable or a
powered USB hub usually helps, especially on a Raspberry Pi.

## Options

| Option | Description |
|---|---|
| `wms_serial_port` | The WMS USB stick. Prefer the `/dev/serial/by-id/...` entry. |
| `wms_channel`, `wms_pan_id`, `wms_key` | Your WMS network parameters (see *Network parameter discovery*). |
| `force_devices` | Comma-separated list of device serial numbers that are always added, even if the scan does not find them. Format `SNR` or `SNR:TYPE` (default type 25 = radio motor). |
| `ignored_devices` | Comma-separated list of serial numbers to ignore. |
| `polling_interval` | Milliseconds between position requests to all devices. Default `30000`. |
| `moving_interval` | Milliseconds between position requests to a moving device. Default `1000`, minimum `100`. |
| `stick_silence_limit` | Seconds without any data from the stick before the bridge restarts. Default `300`, `0` disables this check. |
| `log_level` | `error`, `warn`, `info` (default) or `debug`. |

## Network parameter discovery

To find channel, PAN ID and key, start the app with `wms_pan_id` set to `FFFF` and open the log.
Then follow the instructions printed there:

1. Open the battery case of the WMS hand-held transmitter and select the channel with (+).
2. Press the learn button in the battery case for about 5 s until the LEDs turn green.
3. Each time scanning stops with a red LED, press (A). If the log shows `*** Waving and Hello!`,
   the stick was found: press STOP. Otherwise press (C) to go to the next receiver.
4. The log now shows channel, PAN ID and key. Enter them in the options and restart the app.
