/*
 * @Author: 毛大仙 
 * @Date: 2022-07-02 20:24:24 
 * @Last Modified by: 毛大仙
 * @Last Modified time: 2022-07-04 13:30:54
 */
import { Asset, assetManager, resources, sys, warn } from "cc";
import { ISocket, WebSockData } from "./ISocket";

/** WebSocket类 */
export class WebSock implements ISocket {
    private ws: WebSocket = null!;              // websocket对象

    onConnected() { }
    onMessage(msg: any) { }
    onError(err: any) { }
    onClosed() { }

    /**
     * 连接
     * @param url url地址
     */
    connect(url: string): boolean;
    /**
     * 连接
     * @param ip ip地址
     * @param port 端口号
     */
    connect(ip: string, port: number): boolean;
    connect(): boolean {
        if (this.ws) {
            if (this.ws.readyState === WebSocket.CONNECTING) {
                warn(`websocket is connecting,please wait`);
                return false;
            }
        }

        let url: string = '';
        if (arguments.length == 1) {
            url = arguments[0];
        } else {
            let ip = arguments[0];
            let port = arguments[1];
            url = `${ip}:${port}`;
        }

        //处理证书
        let cacert: any = undefined;
        if (url.includes("wss") && sys.isNative && sys.os == sys.OS.ANDROID) {
            let uuid: string = resources.getInfoWithPath('Android/cacert')?.uuid as string;
            cacert = assetManager.utils.getUrlWithUuid(uuid, { isNative: true, ext: '.pem' });
        }
        const ws: any = WebSocket;
        this.ws = new ws(url, undefined, cacert);
        this.ws.binaryType = "arraybuffer";
        this.ws.onmessage = (event) => {
            this.onMessage(event.data);
        };
        this.ws.onopen = this.onConnected;
        this.ws.onerror = this.onError;
        this.ws.onclose = this.onClosed;
        return true;
    }

    /**
     * 发送数据
     * @param buffer 指定格式数据
     * @returns 
     */
    send(buffer: WebSockData) {
        if (this.ws.readyState == WebSocket.OPEN) {
            this.ws.send(buffer);
            return true;
        }
        return false;
    }

    /**
     * 关闭
     * @param code 提示编号
     * @param reason 提示内容
     */
    close(code?: number, reason?: string) {
        this.ws.close(code, reason);
    }

    get isWorking(): boolean {
        return this.ws.readyState === WebSocket.OPEN;
    }
}