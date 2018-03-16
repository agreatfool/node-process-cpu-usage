"use strict";
///<reference path="../node_modules/@types/node/index.d.ts"/>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const LibUtil = require("util");
const child_process_1 = require("child_process");
const execp = LibUtil.promisify(child_process_1.exec);
class ProcessCPULoad {
    constructor(mode = "node") {
        this._mode = "node";
        this._interval = 1000; // 1s
        this._psCommand = 'ps -p $PID -o %cpu | grep -v "%CPU"';
        this._timer = null;
        this._prevLoadInfo = null;
        this._mode = mode;
    }
    start(listener, interval = this._interval) {
        if (this._timer !== null) {
            // already running, have to stop first
            return;
        }
        this._timer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const usage = yield this._calc();
            if (usage >= 0) {
                listener(usage);
            }
        }), interval);
    }
    stop() {
        clearInterval(this._timer);
        this._timer = null;
    }
    _calc() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._mode === "node") {
                return yield this._calcModeNode();
            }
            else {
                return yield this._calcModeLinux();
            }
        });
    }
    // FIXME
    // 1.
    _calcModeNode() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._prevLoadInfo === null) {
                this._setLoadInfo();
                return Promise.resolve(-1);
            }
            const elapTime = process.hrtime(this._prevLoadInfo.hrtime);
            const elapUsage = process.cpuUsage(this._prevLoadInfo.usage);
            const elapTimeMS = this._hrtimeToMs(elapTime);
            const elapUserMS = this._usageTimeToMs(elapUsage.user);
            const elapSystMS = this._usageTimeToMs(elapUsage.system);
            const cpuPercent = parseFloat((100 * (elapUserMS + elapSystMS) / elapTimeMS).toFixed(1));
            this._setLoadInfo();
            return Promise.resolve(cpuPercent);
        });
    }
    _calcModeLinux() {
        return __awaiter(this, void 0, void 0, function* () {
            const { stdout } = yield execp(this._psCommand.replace("$PID", process.pid.toString()));
            return Promise.resolve(parseFloat(stdout.trim()));
        });
    }
    _setLoadInfo() {
        this._prevLoadInfo = {
            hrtime: process.hrtime(),
            usage: process.cpuUsage(),
        };
    }
    _hrtimeToMs(time) {
        return Math.round(time[0] * 1000 + time[1] / 1000000); // secondToMs + nanosecondToMs
    }
    _usageTimeToMs(time) {
        return Math.round(time / 1000); // microsecondToMs
    }
}
exports.ProcessCPULoad = ProcessCPULoad;
//# sourceMappingURL=cpu-usage.js.map