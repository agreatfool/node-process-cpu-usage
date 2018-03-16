#!/usr/bin/env bash

PID=$(ps aux | grep "cpu-usage.js" | grep -v "grep" | awk '{print $2}')

echo "Tracing cpu usage of pid: ${PID}"

while true; do
    sleep 1
    ps -p ${PID} -o %cpu | grep -v "%CPU"
done