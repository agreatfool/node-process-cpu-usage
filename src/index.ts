///<reference path="../node_modules/@types/node/index.d.ts"/>

import * as LibUtil from "util";
import {exec} from "child_process";

import Timer = NodeJS.Timer;
import CpuUsage = NodeJS.CpuUsage;
import {isNumber} from "util";

const execp = LibUtil.promisify(exec) as (cmd: string) => Promise<{stdout: string, stderr: string}>;

export declare type Hrtime = [number, number];

export interface LoadInfo {
    hrtime: Hrtime;
    usage: CpuUsage;
}

export declare type LoadListener = (percentage: number) => void;

export class ProcessCPULoad {
    private _mode: "node" | "linux" = "node";
    private _interval: number = 1000; // 1s
    private _psCommand: string = 'ps -p $PID -o %cpu | grep -v "%CPU"';

    private _timer: Timer = null;

    private _prevLoadInfo: LoadInfo = null;

    constructor(mode: "node" | "linux" = "node") {
        this._mode = mode;
    }

    public start(listener: LoadListener, interval: number = this._interval) {
        if (this._timer !== null) {
            // already running, have to stop first
            return;
        }

        this._timer = setInterval(async () => {
            const usage = await this._calc();

            if (usage >= 0) { // means correct data
                listener(usage);
            }
        }, interval);
    }

    public stop() {
        clearInterval(this._timer);
        this._timer = null;
    }

    private async _calc() {
        if (this._mode === "node") {
            return await this._calcModeNode();
        } else {
            return await this._calcModeLinux();
        }
    }

    // FIXME
    // 1.

    private async _calcModeNode(): Promise<number> {
        if (this._prevLoadInfo === null) { // no previous data, init it
            this._setLoadInfo();

            return Promise.resolve(-1);
        }

        const elapTime: Hrtime = process.hrtime(this._prevLoadInfo.hrtime);
        const elapUsage: CpuUsage = process.cpuUsage(this._prevLoadInfo.usage);

        const elapTimeMS = this._hrtimeToMs(elapTime);
        const elapUserMS = this._usageTimeToMs(elapUsage.user);
        const elapSystMS = this._usageTimeToMs(elapUsage.system);
        const cpuPercent = parseFloat((100 * (elapUserMS + elapSystMS) / elapTimeMS).toFixed(1));

        this._setLoadInfo();

        return Promise.resolve(cpuPercent);
    }

    private async _calcModeLinux(): Promise<number> {
        const {stdout} = await execp(this._psCommand.replace("$PID", process.pid.toString()));

        return Promise.resolve(parseFloat(stdout.trim()));
    }

    private _setLoadInfo() {
        this._prevLoadInfo = {
            hrtime: process.hrtime(),
            usage: process.cpuUsage(),
        } as LoadInfo;
    }

    private _hrtimeToMs(time: Hrtime) {
        return Math.round(time[0] * 1000 + time[1] / 1000000); // secondToMs + nanosecondToMs
    }

    private _usageTimeToMs(time: number) {
        return Math.round(time / 1000); // microsecondToMs
    }
}