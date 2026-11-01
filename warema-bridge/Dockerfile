ARG BUILD_FROM
# hadolint ignore=DL3006
FROM ${BUILD_FROM}

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Node.js runtime
# hadolint ignore=DL3018
RUN apk add --no-cache nodejs npm

WORKDIR /srv

# Install node dependencies. serialport has a native add-on, so it is compiled
# from source against the Node.js version of this image (musl/Alpine).
COPY package.json /srv/package.json
# hadolint ignore=DL3018
RUN apk add --no-cache --virtual .build-deps python3 make g++ linux-headers \
    && npm install --omit=dev --no-audit --no-fund --build-from-source \
    && npm cache clean --force \
    && apk del .build-deps

# Bridge code and s6 service scripts
COPY rootfs /

# Smoke test: fail the build if a dependency (incl. the native serialport binding) cannot be loaded
RUN node -e "require('serialport'); require('@serialport/parser-delimiter'); require('mqtt'); require('winston'); require('/srv/warema-wms-venetian-blinds/stick-usb.js'); console.log('dependencies OK, node ' + process.version)"

RUN chmod a+x /etc/services.d/warema-bridge/run /etc/services.d/warema-bridge/finish

ARG BUILD_ARCH
ARG BUILD_VERSION
LABEL \
    io.hass.name="Warema Bridge" \
    io.hass.description="Control your Warema WMS system" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version="${BUILD_VERSION}" \
    org.opencontainers.image.source="https://github.com/BaronT808/Addon-Warema-Bridge" \
    org.opencontainers.image.description="Warema WMS to MQTT bridge for Home Assistant"
