#!/usr/bin/env bash
#
# init.sh
# Simple script to create self-signed certs for rev-proxy.test.lab.
# It places them into ./certs and concatenates a .pem for HAProxy.
#

set -e

CERTS_DIR="./certs"
DOMAIN="rev-proxy.test.lab"
CRT_FILE="$CERTS_DIR/$DOMAIN.crt"
KEY_FILE="$CERTS_DIR/$DOMAIN.key"
PEM_FILE="$CERTS_DIR/$DOMAIN.pem"

# 1) Create certs directory if not present.
mkdir -p "$CERTS_DIR"

echo "Generating key and self-signed cert for $DOMAIN ..."
openssl req -x509 -nodes -days 365 \
  -subj "/CN=$DOMAIN" \
  -newkey rsa:2048 \
  -keyout "$KEY_FILE" \
  -out "$CRT_FILE"

echo "Concatenating .crt + .key into .pem for HAProxy ..."
cat "$CRT_FILE" "$KEY_FILE" > "$PEM_FILE"

echo "All done!"
echo
echo "Remember to add the following line to your /etc/hosts (or equivalent):"
echo "  127.0.0.1  $DOMAIN"
echo
echo "(If Docker is running on a remote host, replace '127.0.0.1' with that IP.)"
