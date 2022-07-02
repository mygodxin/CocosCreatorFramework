/*
 * @Author: 毛大仙 
 * @Date: 2022-07-02 20:24:24 
 * @Last Modified by: 毛大仙
 * @Last Modified time: 2022-07-02 20:31:32
 */
import { Asset, assetManager, resources, sys, UIRenderable, warn, __private } from "cc";
import { ISocket, WebSockData } from "./ISocket";

/** webSocket类 */
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
        if (url.includes("wss") && sys.isNative && sys.os == __private._pal_system_info_enum_type_operating_system__OS.ANDROID) {
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

    close(code?: number, reason?: string) {
        this.ws.close(code, reason);
    }

    get isWorking(): boolean {
        return this.ws.readyState === WebSocket.OPEN;
    }
}