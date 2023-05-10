/*
 * @Author: 毛大仙 
 * @Date: 2022-07-04 13:46:58 
 * @Last Modified by:   毛大仙 
 * @Last Modified time: 2022-07-04 13:46:58 
 */

import { EventTarget } from "cc";
type CCFunction = (...any: any[]) => void;

class Event {
    static readonly inst = new Event();

    private eventTarget: EventTarget = null;

    constructor() {
        this.eventTarget = new EventTarget();
    }

    /**
     * 派发事件
     * @param eventName 事件名
     * @param data 数据
     */
    emit(eventName: string, data: any): void {
        this.eventTarget.emit(eventName, data);
    }

    /**
     * 是否存在事件
     * @param eventName 事件名
     * @param callback 回调
     * @param thisArg 指向域
     */
    has(eventName: string, callback: CCFunction, thisArg?: any): void {
        this.eventTarget.hasEventListener(eventName, callback, thisArg);
    }

    /**
     * 监听事件
     * @param eventName 事件名
     * @param callback 回调
     * @param thisArg 指向域
     */
    on(eventName: string, callback: CCFunction, thisArg?: any): void {
        this.eventTarget.on(eventName, callback, thisArg);
    }

    /**
     * 监听一次
     * @param eventName 事件名
     * @param callback 回调
     * @param thisArg 指向域
     */
    once(eventName: string, callback: CCFunction, thisArg?: any): void {
        this.eventTarget.once(eventName, callback, thisArg);
    }

    /**
     * 移除事件
     * @param eventName 事件名
     * @param callback 回调
     * @param thisArg 指向域
     */
    off(eventName: string, callback: CCFunction, thisArg?: any): void {
        this.eventTarget.off(eventName, callback, thisArg);
    }
}

/** 事件 */
export const event = Event.inst;