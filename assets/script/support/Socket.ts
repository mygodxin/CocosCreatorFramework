/*
 * @Author: 毛大仙 
 * @Date: 2022-07-02 20:31:47 
 * @Last Modified by: 毛大仙
 * @Last Modified time: 2022-07-02 20:35:39
 */
import { error, warn } from "cc";
import { ISocket } from "../core/network/ISocket";
import { WebSock } from "../core/network/WebSock";
import { timer } from "../core/util/Timer";
import { RequestCode, ReturnCode } from "../cs/EnumDefine";
import { BufferReader, BufferWriter, Dictionary, EncryptHelper, IProtocolSerializable } from "../cs/ProtocolCommon";
import ConstString from "../define/ConstString";

interface ArrayBufferTypes {
    ArrayBuffer: ArrayBuffer;
}
type ArrayBufferLike = ArrayBufferTypes[keyof ArrayBufferTypes];

class RequestData extends BufferWriter {

    //加密签名
    static sgin: Dictionary<number>;
    static keys: Int32Array;
    code: RequestCode = undefined!;
    encrypt: boolean;
    protected static checkEcrypt(code: RequestCode): boolean {
        return this.sgin && this.sgin.has(code);
    }
    private setCode(code: RequestCode) {
        this.code = code;
        if (this.encrypt) {
            var sgin = RequestData.sgin.get(this.code);
            this.writeInt32(sgin);
            if (++sgin > ConstString.Int32MaxValue) {
                sgin = ConstString.Int32MinValue;
            }
            RequestData.sgin.add(this.code, sgin);
        }
        else {
            this.writeByte(this.code);
        }
    }
    constructor(code: RequestCode, serializable?: IProtocolSerializable);
    constructor(code: RequestCode, bufferLength: number);
    constructor(code: RequestCode, data: any) {
        let encrypt = RequestData.checkEcrypt(code);
        let len: number = encrypt ? 4 : 1;
        if (!data) {
            super(len);
            this.encrypt = encrypt;
            this.setCode(code);
        }
        else if (typeof (data) == "number") {
            super(len + data);
            this.encrypt = encrypt;
            this.setCode(code);
        }
        else {
            super(128 + len);
            this.encrypt = encrypt;
            this.setCode(code);
            this.writeSerializable(data);
        }
    }
    public getEncryptBuffer(keys: Int32Array): ArrayBufferLike {
        var buffer = EncryptHelper.EncryptBinary(super.getUint8Array(), keys);
        var writer = new BufferWriter(buffer.length + 1);
        writer.writeByte(this.code);
        writer.joint(buffer);
        return writer.Buffer;
    }
    public get Buffer(): ArrayBufferLike {
        if (this.encrypt) {
            return this.getEncryptBuffer(RequestData.keys);
        }
        else if (this.buffer.byteLength > this.offset) {
            return this.buffer.slice(0, this.offset);
        }
        else {
            return this.buffer;
        }
    }

}

class ResponseData {
    private code: ReturnCode;
    private requestCode: RequestCode;
    public get ReturnCode(): ReturnCode {
        return this.code;
    }
    public get RequestCode(): RequestCode {
        return this.requestCode;
    }
    public stream: BufferReader;
    constructor(code: ReturnCode, stream: BufferReader, requestCode: RequestCode) {
        this.code = code;
        this.stream = stream;
        this.requestCode = requestCode;
    }
}

/** Socket连接 */
class DSocket {
    static readonly inst = new DSocket();

    private socket: ISocket = null!;    // 当前连接
    private reConnectTimes: number = 0;   // 当前重连次数
    private readonly maxReConnectTimes: number = 10;   // 最大重连次数
    private readonly reconnetIT: number = 5000;  // 重连间隔时间
    private readonly heartDeltaTime: number = 6000; // 心跳超时检测间隔(ms)
    private heartCheckTimeid: string = '';        // 心跳超时检测timeid
    private readonly messageCheckDeltaTime: number = 1000000;   //消息超时检测间隔(ms)
    private messageCheckTimeid: string = '';        // 消息超时检测timeid
    private messageSendTimeid: string = '';   //发现消息计时器
    private reqList: RequestData[] = null!;   // 消息请求列表
    private resList: RequestData[] = null!;   // 消息返回列表
    private excuteList: RequestData[] = null!;    //消息执行列表
    private url: string = '';
    private readonly sendMessageDeltaTime: number = 16;  //消息发送执行间隔(ms)

    /** 初始化 */
    init(): void {
        if (this.socket === undefined) {
            this.socket = new WebSock();

            this.addLisenter();
        }
        this.reqList = [];
        this.resList = [];
        this.excuteList = [];
    }

    /** 连接 */
    connect(url: string): void {
        if (this.socket === undefined)
            throw new Error('socket is not init!');
        this.url = url;

        const connectSuccess: boolean = this.socket.connect(url);
        if (connectSuccess) {
            this.addLisenter();
        } else {
            throw new Error('socket connect fail!');
        }
    }

    private addLisenter() {
        this.socket.onConnected = () => { this.onConnected() };
        this.socket.onMessage = (msg) => { this.onMessage(msg) };
        this.socket.onError = (err) => { this.onError(err) };
        this.socket.onClosed = () => { this.onClosed() };
    }

    /** 连接成功 */
    private onConnected(): void {
        if (this.messageSendTimeid) timer.clear(this.messageSendTimeid);

        this.messageSendTimeid = timer.setInterval(() => {
            this.excuteSendMessage();
        }, this.sendMessageDeltaTime);
    }

    /** 执行发送消息 */
    private excuteSendMessage(): void {
        //发送消息
        //1.队列有消息
        //2.socket处于工作状态
        //3.循环只负责处理消息，不负责校验
        if (this.excuteList && this.excuteList.length > 0 && this.socket && this.socket.isWorking) {
            const requestData: RequestData = this.excuteList.shift() as RequestData;
            this.socket.send(requestData.Buffer);
        }
    }

    /** 响应消息 */
    private onMessage(msg: any): void {
        const data = msg && msg.data;
        if (data instanceof ArrayBuffer) {
            this.emitMessage(data);
        }
        else if (data instanceof Blob) {
            let f = new FileReader();
            let onload = (ev: any) => {
                this.emitMessage(f.result as ArrayBuffer);
            };
            f.onload = onload.bind(this);
            f.readAsArrayBuffer(data);
        }
    }

    /**
     * 1. 无网络
     * 2. 服务器域名解析失败
     * 3. 服务器端口拒绝访问
     * 4. 数据包路由失败
     * 5. 服务器没有websocket服务
     * 6. 如果是wss协议，证书无效
     * 7. 服务器完成握手后立即关闭连接
     * 8. 微信小游戏中反复切换前后台or切换网络会导致连接出错
     * 以上场景均可能触发onerror，但是HTML5规范中不允许ErrorEvent对象携带上述信息，防止服务器被蓄意攻击
     */

    /** 连接错误 */
    private onError(err: string): void {
        error('ws连接错误', err);

        this.closeSocket();
    }

    /** 连接关闭 */
    private onClosed(): void {
        if (this.socket) {
            this.socket.close();
        }
        this.clearTimer();

        this.reConnect();
    }

    /** 解析消息 */
    private emitMessage(buffer: ArrayBuffer) {
        this.resetHeartTimer();
        this.resetMessageTimer();

        let stream = new BufferReader(buffer)//(<ArrayBuffer>f.result);
        let code = stream.readByte();
        if (code == 0) {
            let requestCode = stream.readByte();
            // let callback: Queue<Action1<ResponseData>> = this.waitRes.get(requestCode);
            // if (callback && callback.Count > 0) {
            //     callback.Deque()(new ResponseData(stream.readByte(), stream, requestCode));
            // }
        }
        else if (code == 1) {
            code = stream.readByte();
            // let action = this.serverEvent.get(code);
            // if (action) {
            //     for (let index = 0; index < action.length; index++) {
            //         const element = action[index];
            //         element && element(stream);
            //     }
            // }

        }
    }

    /** 重置心跳检测 */
    private resetHeartTimer(): void {
        if (this.heartCheckTimeid) timer.clear(this.heartCheckTimeid);

        this.heartCheckTimeid = timer.setTimeOut(() => {
            this.closeSocket();
        }, this.heartDeltaTime);
    }

    /** 重置心跳检测 */
    private resetMessageTimer(): void {
        if (this.messageCheckTimeid) timer.clear(this.messageCheckTimeid);

        this.messageCheckTimeid = timer.setTimeOut(() => {
            this.closeSocket();
        }, this.messageCheckDeltaTime);
    }

    /** 清理心跳检测 */
    private clearTimer() {
        if (this.heartCheckTimeid) timer.clear(this.heartCheckTimeid);
        if (this.messageCheckTimeid) timer.clear(this.messageCheckTimeid);
    }

    /** 连接出错、心跳超时或消息超时等主动关闭socket */
    private closeSocket(): void {
        if (this.socket) this.socket.close();

        this.reConnect();
    }

    /** 主/被动关闭后开始重连 */
    reConnect(): void {
        if (this.reConnectTimes < this.maxReConnectTimes) {
            this.closeSocket();
            this.connect(this.url);
            this.reConnectTimes++;
        } else {
            throw new Error('socket reConnect to maxTimes!');
        }
    }

    /** 检验消息入发送队列 */
    private sendMessage(data: RequestData) {
        //消息校验

        //入队列
        this.reqList.push(data);
    }
}

/** socket管理类 */
export const AppSocket = DSocket.inst;