#!/usr/bin/env node
"use strict";

const ProcessCPULoad = require("../build/index").ProcessCPULoad;

const tracker = new ProcessCPULoad("node"); // "node" | "linux"

tracker.start((total, user, system) => {
  console.log('CPU Usage: Total: %d, User: %d, System: %d', total, user, system);
}, 1000);

const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.sendStatus(200);
});

app.listen(5000);
console.log('Server started, listening on port 5000 ...');