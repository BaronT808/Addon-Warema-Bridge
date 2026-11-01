const log = require('../logger');
const WmsVbStick = require('./stick')
const {SerialPort} = require('serialport')
const {DelimiterParser} = require('@serialport/parser-delimiter')

const DelimiterChar = '}';
// 0 disables the silence watchdog, default 300 s
const STICK_SILENCE_LIMIT_S = process.env.STICK_SILENCE_LIMIT_S !== undefined && process.env.STICK_SILENCE_LIMIT_S !== ''
    ? parseInt(process.env.STICK_SILENCE_LIMIT_S) : 300;
const STICK_SILENCE_LIMIT_MS = (isNaN(STICK_SILENCE_LIMIT_S) ? 300 : STICK_SILENCE_LIMIT_S) * 1000;

//--------------------------------------------------------------------------------------------------
class StickUsb extends WmsVbStick {
    constructor(portPath, channel, panid, key, optionsPar, callback) {
        super(portPath, channel, panid, key, optionsPar, callback);
        this.portPath = portPath;

        if (this.options.autoOpen) {
            this.openUsbPort(portPath, channel, panid, key, this.options);
        }
    }

    static listWmsStickSerialPorts(callback) {
        var portsList = [];
        var portsWorkList = [];
        var portsOpened = [];
        var errorMsg = "";
        var callbackPendig = true;
        var timer;

        // serialport since version 8.0.0:
        // Promise instead of callback
        SerialPort.list().then(
            ports => {
                timer = setTimeout(timeoutListWmsStickSerialPorts, 1000); // In 1 second all WMS Sticks should have answered.

                // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
                function appendErrorMsg(msg) {
                    log.debug("appendErrorMsg: " + msg);
                    if (errorMsg) {
                        errorMsg += " ";
                    }
                    errorMsg += msg;
                }

                // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
                function timeoutListWmsStickSerialPorts() {
                    appendErrorMsg('Timeout scanning port: ' + portsWorkList.join(", ") + ".");
                    finishListWmsStickSerialPorts();
                }

                // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
                function finishListWmsStickSerialPorts() {
                    for (var i = 0; i < portsOpened.length; i++) {
                        log.debug('Closing ' + portsOpened[i].path + '.');
                        portsOpened[i].close(function (err) {
                            if (err) {
                                appendErrorMsg('Error closing port: ' + err + ".");
                            }
                        });
                    }
                    if (callbackPendig) {
                        callback(errorMsg, {topic: "wms-vb-list-serial-ports", payload: {portsList: portsList}});
                        callbackPendig = false;
                    }
                }

                // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
                function portsWorkListFinishPort(portPath) {
                    var pos = portsWorkList.indexOf(portPath);
                    if (pos >= 0) {
                        portsWorkList.splice(pos, 1);
                        if (portsWorkList.length === 0) {
                            log.silly("portsWorkList now empty.");
                            clearTimeout(timer);
                            finishListWmsStickSerialPorts();
                        }
                    }
                }

                // . End of local functions  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

                log.silly(ports.length + " ports found:\n" + JSON.stringify(ports, null, 2));
                ports.forEach((port) => {
                    portsWorkList.push(port.path);
                });

                ports.forEach((port) => {
                    log.silly("foreach " + port.path);
                    if (true || port.path.includes("USB")) {

                        var testPort = new SerialPort(port.path, {baudRate: 125000})
                        var testParser = testPort.pipe(new Delimiter({delimiter: DelimiterChar}))

                        testPort.on('open', function () {
                            log.silly('Opened serial port ' + port.path + '.');
                            portsOpened.push(testPort);

                            testParser.on('data', function (data) {
                                var rcvString = data.toString('utf8') + DelimiterChar;
                                log.silly(port.path + " received: " + rcvString);
                                if (rcvString.substr(0, 2) === "{v") {
                                    var version = rcvString.substr(2);
                                    var posEndMarker = version.lastIndexOf('}');
                                    if (posEndMarker >= 1) {
                                        version = version.substring(0, posEndMarker);
                                    }
                                    log.silly(port.path + " version: " + version);
                                    port.wmsStickVersion = version;
                                    portsList.push(port);
                                    portsWorkListFinishPort(port.path);
                                }

                                portsWorkListFinishPort(port.path);

                            });

                            testPort.write('{V}', function (err) {
                                if (err) {
                                    appendErrorMsg('Port ' + port.path + ' error on write: ' + err.message + '.')
                                    portsWorkListFinishPort(port.path);
                                } else {
                                    log.silly(port.path + ' message written');
                                }
                            })
                        });

                        testPort.on('error', function (err) {
                            portsWorkListFinishPort(port.path);
                            if (err.message.includes("125000")) {
                                // Input/output error setting custom baud rate of 125000.
                                log.silly('Port ' + port.path + ' error event: ' + err.message + '.');
                            } else {
                                appendErrorMsg('Port ' + port.path + ' error event: ' + err.message + '.');
                            }
                        });
                    } else {
                        portsWorkListFinishPort(port.path);
                    }
                });
            },
            err => console.error(err)
        );
    }

    openUsbPort(portPath, channel, panid, key, options) {
        log.debug(portPath + " open(" + portPath + ", " + channel + ", " + panid + ", " + key + ", " + JSON.stringify(options) + ")");

        this.port = new SerialPort({path: portPath, baudRate: 125000})

        this.parser = this.port.pipe(new DelimiterParser({delimiter: DelimiterChar}))

        var stickObj = this;
        this.port.on('open', function () {
            log.debug('Opened port ' + portPath + ' and listening ...');
            stickObj.lastRxTs = Date.now();
            stickObj.startStickWatchdog(portPath);
            stickObj.initWmsNetwork();
        })

        // Fix (BaronT808): If the USB stick disconnects (even for a second), Linux closes the
        // port. The original bridge kept running with a dead connection and every command ended
        // in wmsRetry/wmsTimeout until the add-on was restarted manually. We now exit the process,
        // s6 restarts the bridge service automatically (see finish script),
        // which re-opens the stick.
        this.port.on('close', function (err) {
            var reason = (err && err.disconnected) ? ' (USB device disconnected)' : '';
            StickUsb.fatal(portPath + ' port closed' + reason + '.');
        });

        this.port.on('error', function (err) {
            if (!portPath) {
                portPath = portPath;
            }

            log.error(portPath + ' error: ' + err.message)
            this.status = "error";
            if (!stickObj.port.isOpen) {
                StickUsb.fatal(portPath + ' is not open after error: ' + err.message);
            }
        })

        this.parser.on('data', function (data) {
            stickObj.lastRxTs = Date.now();
            stickObj.comDataReceive(data.toString('utf8') + DelimiterChar);
        });

        this.parser.on('close', function (data) {
            log.debug(portPath + ' port closed. ');
            this.status = "created";
        });

    }

    // Overwriting suber class
    comDataSendCallback(dataString) {
        // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        function portWriteErrHdlr(err) {
            if (err) {
                return console.log('Error on write to port: ', err.message)
            }
        }

        // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

        if (!this.port || !this.port.isOpen) {
            StickUsb.fatal('Cannot write to ' + this.portPath + ': port is not open.');
            return;
        }
        this.port.write(dataString, portWriteErrHdlr);
    }

    // Second safety net: the WMS stick acknowledges every command it receives. If it has not
    // sent anything for STICK_SILENCE_LIMIT_MS although the bridge keeps polling, the stick is
    // considered dead (e.g. hung without the port being closed) and the bridge exits.
    startStickWatchdog(portPath) {
        var stickObj = this;
        if (STICK_SILENCE_LIMIT_MS <= 0 || (process.env.WMS_PAN_ID || 'FFFF').toUpperCase() === 'FFFF') {
            // disabled, or network parameter discovery mode (no polling, silence is expected)
            return;
        }
        if (this.stickWatchdogTimer) {
            clearInterval(this.stickWatchdogTimer);
        }
        this.stickWatchdogTimer = setInterval(function () {
            var silentMs = Date.now() - (stickObj.lastRxTs || 0);
            if (silentMs > STICK_SILENCE_LIMIT_MS) {
                StickUsb.fatal('No data from WMS stick on ' + portPath + ' for ' + Math.round(silentMs / 1000) + ' s.');
            }
        }, 60 * 1000);
    }

    static fatal(reason) {
        if (StickUsb.exiting) {
            return;
        }
        StickUsb.exiting = true;
        log.error(reason + ' Exiting, the bridge will be restarted automatically.');
        // short delay so the log line is flushed
        setTimeout(function () {
            process.exit(1);
        }, 1000);
    }

}

//--------------------------------------------------------------------------------------------------
module.exports = StickUsb;

