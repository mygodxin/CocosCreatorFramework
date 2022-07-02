/*
 * @Author: 毛大仙 
 * @Date: 2022-07-02 20:24:19 
 * @Last Modified by: 毛大仙
 * @Last Modified time: 2022-07-02 20:25:02
 */
/** websocket数据 */
export type WebSockData = string | Blob | ArrayBufferView | ArrayBuffer;

/** socket接口 */
export interface ISocket {
    onConnected: () => void;           // 连接回调
    onMessage: (msg: WebSockData) => void;  // 消息回调
    onError: (err: string) => void;               // 错误回调
    onClosed: () => void;              // 关闭回调

    connect(url: string): boolean;                   // 连接接口1
    connect(ip: string, port: number): boolean;      // 连接接口2
    send(buffer: WebSockData): boolean;              // 数据发送接口
    close(code?: number, reason?: string): void;  // 关闭接口
    isWorking: boolean;    //是否工作中
}
