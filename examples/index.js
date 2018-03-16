#!/usr/bin/env node
"use strict";

const ProcessCPULoad = require("../build/index").ProcessCPULoad;

const tracker = new ProcessCPULoad("node"); // "node" | "linux"

function consume() {
  function fabonacci(n) {
    if (n === 0) {
      return 0;
    }
    if (n === 1) {
      return 1;
    }
    return fabonacci(n - 1) + fabonacci(n - 2);
  }

  const n = 41;
  const start = new Date();
  const result = fabonacci(n);
  const end = new Date();

  console.log("fabonacci(%d) = %d, time used: %d ms.", n, result, end.getTime() - start.getTime());
}

// Use CPU
setInterval(() => {
  consume();
}, 5000); // interval 5s

tracker.start((usage) => {
  console.log('CPU Usage: %d', usage);
}, 500);