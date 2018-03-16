#!/usr/bin/env bash

while true; do
    sleep 5
    ps -p $(ps aux | grep "index.js" | grep -v "grep" | awk '{print $2}') -o %cpu | grep -v "%CPU"
done