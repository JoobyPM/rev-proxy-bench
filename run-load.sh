#!/bin/bash
K6_WEB_DASHBOARD=true k6 run  --insecure-skip-tls-verify ramp-test.js