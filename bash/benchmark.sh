#!/usr/bin/env bash

wrk \
 -d 2h \
 -t 15 \
 -c 15 \
 -s ./delay.lua \
 http://127.0.0.1:5000/test

# -c, --connections: total number of HTTP connections to keep open with each thread handling N = connections/threads
# -d, --duration:    duration of the test, e.g. 2s, 2m, 2h
# -t, --threads:     total number of threads to use
# -s, --script:      LuaJIT script, see SCRIPTING
# -s ./delay.lua:    10-50ms delay before each request
