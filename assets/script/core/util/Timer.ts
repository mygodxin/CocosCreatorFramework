/*
 * @Author: 毛大仙 
 * @Date: 2022-07-04 13:21:55 
 * @Last Modified by: 毛大仙
 * @Last Modified time: 2022-07-04 13:29:14
 */

/** 计时器回调 */
interface TimerCallback {
    callback: Function; // 回调函数
    maxTimes: number;   // 最大次数
    times: number;  // 当前次数
    interval: number;   // 间隔(ms)
    id: string; //id
    runTime: number;    //运行时长(ms)
}

class Timer {
    private _id: number = 0;    // 计时器id
    private _timeId: number;    // 计时器
    private _startTime: number; // 开启时间
    private _callbackList: TimerCallback[]; // 回调列表
    private _size: number;  // 当前数
    private static readonly MAX_SIZE: number = 50;  // 最大数
    private _lastTick: number;  // 上一次时间戳(ms)
    private static readonly MIN_INTERVAL: number = 16;  // 最小触发间隔(ms)
    private _runTime: number;   // 运行时长(ms)
    private static readonly RECYCLE_INTERVAL: number = 6000;    // 自动回收间隔(ms)

    /** 获取当前时间 */
    private get now() {
        return Date.now();
    }

    /** 以当前时间启动计时器 */
    tempTime() {
        this._startTime = this.now;
    }
    /** 获取start到now的时间戳,并将start重置为now */
    getTimeLag() {
        if (this._startTime == undefined) {
            throw new Error('timer not start');
        };
        const now = this.now;
        const temp = now - this._startTime;
        this._startTime = now;
        return temp;
    }
    /** 初始化 */
    init(): void {
        this._runTime = 0;
        this._size = 0;
        this._callbackList = [];

        this.start();
    }

    /** 启动计时器 */
    private start(): void {
        if (this._timeId !== undefined) return;

        this.ticker();
    }

    /** 触发器 */
    private ticker(): void {
        this._lastTick = this.now;
        this._timeId = setTimeout(() => {
            const now = this.now;
            const dt = now - this._lastTick;
            this.update(dt);
            this._lastTick = now;
            this.ticker();
        }, Timer.MIN_INTERVAL);
    }

    /** 计时器刷新 */
    private update(dt: number): void {
        //定时回收计时器
        if (this._runTime >= Timer.RECYCLE_INTERVAL) {
            this.recycle();
            this._runTime = 0;
        } else {
            this._runTime += dt;
        }

        this._callbackList.forEach(foo => {
            //回收无效计时器
            if (!foo || !foo.callback || !foo.id) {
                // this.delete(foo);
                return;
            }

            if (foo.maxTimes > 0) { //计次
                if (foo.times < foo.maxTimes) {
                    if (foo.runTime < foo.interval) {
                        foo.runTime += dt;
                        return;
                    }
                    foo.runTime = 0;
                    try {
                        this.excute(foo, dt);
                    } catch (err) {
                        console.warn(`[Timer]run error${err}`)
                    } finally {
                        //运行excute有可能被清除
                        if (!foo.id) return;

                        foo.times++;
                        if (foo.times >= foo.maxTimes) {
                            this.delete(foo);
                        }
                    }
                }
            } else {    //计时
                if (foo.runTime < foo.interval) {
                    foo.runTime += dt;
                } else {
                    foo.runTime = 0;
                    try {
                        this.excute(foo, dt);
                    } catch (err) {
                        console.warn(`[Timer]run error${err}`)
                    }
                }
            }
        })
    }

    /** 回收计时器 */
    private recycle(): void {
        const len = this._callbackList.length;
        if (len <= Timer.MAX_SIZE) {
            return;
        }
        // console.log('启动回收', this.callbackList.length);
        this._callbackList = this._callbackList.filter(foo => {
            return foo.id;
        });
        // console.log('回收过后', this.callbackList.length);
    }

    /** 执行计时器 */
    private excute(foo: TimerCallback, dt: number): void {
        foo.callback && foo.callback(dt);
    }

    /** 获取下一个计时器id */
    private get next(): string {
        return `timer${this._id++}`;
    }

    /** 有效性校验 */
    private validityCheck(callback: Function) {
        if (!callback) {
            console.warn(`[Timer]check fail,please check callback`);
            return false;
        }
        const cbLen: number = this._callbackList.length;
        for (let i = 0; i < cbLen; i++) {
            const foo = this._callbackList[i];
            if (foo.callback === callback) {
                console.warn(`[Timer]please do not repeat add callback`);
                return false;
            }
        }
        return true;
    }

    /**
     * 延迟调用
     * @param callback 回调函数
     * @param delay 延迟(ms)
     * @param times 次数(默认1次)
     */
    setTimeOut(callback: Function, delay: number, times: number = 1): string {
        if (!this.validityCheck(callback))
            return;

        if (delay <= 0) {
            setTimeout((dt) => {
                callback.call(dt);
            }, 0);
            return;
        }

        const id = this.next;
        this.push(id, callback, delay, times);
        return id;
    }

    /**
     * 循环调用
     * @param callback 回调函数
     * @param interval 调用间隔(ms)
     */
    setInterval(callback: Function, interval: number): string {
        if (!this.validityCheck(callback))
            return;

        const id = this.next;
        this.push(id, callback, interval, 0);
        return id;
    }

    /** 清理计时器
     * @param 计时器id
     */
    clear(id: string): void {
        const len = this._callbackList.length;
        for (let i = 0; i < len; i++) {
            const callback = this._callbackList[i];
            if (callback && callback.id === id) {
                this.delete(callback);
                break;
            }
        }
        this._callbackList.filter(foo => {
            return foo.id != id;
        })
    }

    /** 添加回调 */
    private push(id: string, callback: Function, delay: number, times: number): void {
        const curLen = this._callbackList.length;
        if (this._size < curLen) {
            for (let i = 0; i < curLen; i++) {
                const foo = this._callbackList[i];
                if (!foo.id) {
                    foo.id = id;
                    foo.callback = callback;
                    foo.runTime = 0;
                    foo.interval = delay;
                    foo.times = 0;
                    foo.maxTimes = times;
                }
            }
        } else {
            this._callbackList.push({
                id: id,
                callback: callback,
                runTime: 0,
                interval: delay,
                times: 0,
                maxTimes: times
            })
        }
        this._size++;
    }

    /** 清理TimerCallback */
    private delete(cb: TimerCallback): void {
        cb.id = '';
        cb.callback = undefined;
        cb.runTime = 0;
        cb.interval = 0;
        cb.maxTimes = 0;
        cb.times = 0;
        this._size--;
    }
}
/** 计时器 */
export const timer = new Timer();