///<reference path="../node_modules/@types/node/index.d.ts"/>

import * as LibUtil from "util";
import {exec} from "child_process";

import Timer = NodeJS.Timer;
import CpuUsage = NodeJS.CpuUsage;

const execp = LibUtil.promisify(exec) as (cmd: string) => Promise<{stdout: string, stderr: string}>;

export declare type Hrtime = [number, number];

export interface LoadInfo {
    hrtime: Hrtime;
    usage: CpuUsage;
}

export interface LoadResult {
    user: number;
    system: number;
    total: number;
}

export declare type LoadListener = (totalPercentage: number, userPercentage: number, systemPercentage: number) => void;

export class ProcessCPULoad {
    private _mode: "node" | "linux" = "node";
    private _interval: number = 1000; // 1s
    private _psCommand: string = 'ps -p $PID -o %cpu | grep -v "%CPU"';

    private _timer: Timer = null;

    private _prevLoadInfo: LoadInfo = null;

    constructor(mode: "node" | "linux" = "node") {
        this._mode = mode;
    }

    public start(listener: LoadListener, interval: number = this._interval): void {
        if (this._timer !== null) {
            // already running, have to stop first
            return;
        }

        this._timer = setInterval(async () => {
            const usage = await this._calc();

            if (usage !== null) { // means correct data
                listener(usage.total, usage.user, usage.system);
            }
        }, interval);
    }

    public stop(): void {
        clearInterval(this._timer);
        this._timer = null;
    }

    private async _calc(): Promise<LoadResult> {
        if (this._mode === "node") {
            return await this._calcModeNode();
        } else {
            return await this._calcModeLinux();
        }
    }

    private async _calcModeNode(): Promise<LoadResult> {
        if (this._prevLoadInfo === null) { // no previous data, init it
            this._setLoadInfo();

            return Promise.resolve(null);
        }

        const elapTime: Hrtime = process.hrtime(this._prevLoadInfo.hrtime);
        const elapUsage: CpuUsage = process.cpuUsage(this._prevLoadInfo.usage);

        const elapTimeMS = this._hrtimeToMs(elapTime);
        const elapUserMS = this._usageTimeToMs(elapUsage.user);
        const elapSystMS = this._usageTimeToMs(elapUsage.system);

        const total = this._calcPercentage(elapUserMS + elapSystMS, elapTimeMS);
        const user = this._calcPercentage(elapUserMS, elapTimeMS);
        const system = this._calcPercentage(elapSystMS, elapTimeMS);

        this._setLoadInfo();

        return Promise.resolve({
            total: total,
            user: user,
            system: system,
        } as LoadResult);
    }

    private async _calcModeLinux(): Promise<LoadResult> {
        const {stdout} = await execp(this._psCommand.replace("$PID", process.pid.toString()));

        return Promise.resolve({
            total: parseFloat(stdout.trim()),
            user: null,
            system: null,
        } as LoadResult);
    }

    private _setLoadInfo(): void {
        this._prevLoadInfo = {
            hrtime: process.hrtime(),
            usage: process.cpuUsage(),
        } as LoadInfo;
    }

    private _hrtimeToMs(time: Hrtime): number {
        return Math.round(time[0] * 1000 + time[1] / 1000000); // secondToMs + nanosecondToMs
    }

    private _usageTimeToMs(time: number): number {
        return Math.round(time / 1000); // microsecondToMs
    }

    private _calcPercentage(numerator: number, denominator: number): number {
        return parseFloat((100 * numerator / denominator).toFixed(1))
    }
}