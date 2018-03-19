# node-process-cpu-usage

## Aim
Get % CPU usage of current node process.

## Usage
```javascript
const ProcessCPULoad = require('process-cpu-usage').ProcessCPULoad;

const tracker = new ProcessCPULoad();

tracker.start((total, user, system) => {
  console.log('CPU Usage: Total: %d, User: %d, System: %d', total, user, system);
});
```

## Have a try
```bash
# start example server
$ cd bash
$ ./benchmark-server.sh

# start wrk benchmark client
$ ./benchmark-client.sh

# see the console output of script benchmark-server.sh

# and use read-load-by-ps.sh to see the CPU usage from linux ps command
$ ./read-load-by-ps.sh
```