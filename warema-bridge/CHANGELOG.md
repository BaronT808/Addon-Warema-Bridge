# Changelog

## 1.0.0

First release of the BaronT808 fork.

- **Fix:** The bridge now detects when the WMS USB stick disconnects (port closed) and restarts
  itself automatically. Previously it kept running with a dead connection and every command
  ended in `wmsRetry` / `wmsTimeout` until the app was restarted manually.
- **New:** Stick silence watchdog. If the stick sends nothing for `stick_silence_limit` seconds
  (default 300) although the bridge keeps polling, the bridge restarts. `0` disables it.
- **New:** Options `polling_interval`, `moving_interval`, `log_level` are available in the UI.
- Writing to a closed port no longer fails silently.
- The WMS key is no longer printed in the log.
- Modern app layout (`config.yaml`, `build.yaml`), current Home Assistant base image,
  s6-overlay v3, images built by GitHub Actions for `aarch64` and `amd64`.
- `serialport` updated to v12.
