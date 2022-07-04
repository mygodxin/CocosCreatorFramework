


/**序列化类型 */
export enum SerializableType
{
    Byte = 0,
    SByte = 1,
    Int16 = 2,
    UInt16 = 3,
    Int32 = 4,
    UInt32 = 5,
    Int64 = 6,
    Single = 7,
    Boolean = 8,
    String = 9,
    DateTime = 10,
    Double = 11,
    Serializable = 12,
}



export function base64ToUint8Array(base64String): Uint8Array
{
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i)
    {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


export function arrayBufferToBase64(array: ArrayBuffer): string
{
    var binary = '';
    var bytes = new Uint8Array(array);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++)
    {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}




//可使用父类序列化正反序列化类型装饰器
export function IntedSerType(creatTable: Function)
{
    return function constructor(serialization)
    {
        serialization.prototype._$getSerializableTable = () =>
        {
            if (!serialization.prototype.typeTable)
            {
                var table = creatTable();
                serialization.prototype.typeTable = table;
                for (let k in table)
                {
                    table[k].prototype._$serializeValue = Number.parseInt(k);
                }
            }
            return serialization.prototype.typeTable;
        };
    }
}

class callData
{
    target: any;
    callTime: number;
    constructor(target: any, callTime: number)
    {
        this.callTime = callTime;
        this.target = target;
    }
}


class EventOject
{
    private static eventID = Number.MIN_SAFE_INTEGER;
    private callBack: Function;
    private callDatas: callData[] = [];
    public get EventID(): number
    {
        return this.callBack["__$DelegateID$__"];
    }
    public get TagetCount(): number
    {
        return this.callDatas.length;
    }
    public get Active(): boolean
    {
        return this.callDatas.length > 0;
    }
    constructor(func: Function, calltarget: any, callTime: number = undefined)
    {
        this.callBack = func;
        this.callDatas.push(new callData(calltarget, callTime));
        if (this.callBack["__$DelegateID$__"] == undefined)
        {
            this.callBack["__$DelegateID$__"] = EventOject.eventID++;
        }
    }
    public emit(pro1 = undefined, pro2 = undefined, pro3 = undefined, pro4 = undefined, retruns: any[] = undefined)
    {
        let len = this.callDatas.length;
        for (let index = 0; index < len; index++)
        {
            const element = this.callDatas.shift();
            let r = this.callBack.call(element.target, pro1, pro2, pro3, pro4);
            retruns?.push(r);
            if (element.callTime == undefined || ((--element.callTime) > 0))
            {
                this.callDatas.push(element);
            }
        }

    }
    public add(calltarget: any, callTime: number)
    {
        this.callDatas.push(new callData(calltarget, callTime));
    }
    public remove(calltarget: any)
    {
        for (let index = 0; index < this.callDatas.length; index++)
        {
            const element = this.callDatas[index];
            if (element.target == calltarget)
            {
                this.callDatas.splice(index, 1);
                break;
            }
        }
    }
}
class DelegateBase
{
    private functions: Dictionary<EventOject> = new Dictionary();
    protected baseOn(action: Function, callTarget: any, callTime: number = undefined)
    {
        let id = action["__$DelegateID$__"];
        if (this.functions.has(id))
        {
            this.functions.get(id).add(callTarget, callTime);
        }
        else
        {
            let e = new EventOject(action, callTarget, callTime);
            this.functions.add(e.EventID, e);
        }
    }
    public off(action: Function, target: any): boolean
    {
        let id = action["__$DelegateID$__"];
        let obj = this.functions.get(id);
        if (obj)
        {
            if (obj.TagetCount == 1)
            {
                return !!this.functions.remove(id);
            }
            else
            {
                obj.remove(target);
                return true;
            }
        }
        return false;
    }
    protected baseEmit(pro1 = undefined, pro2 = undefined, pro3 = undefined, pro4 = undefined, returns: any[] = undefined)
    {
        if (this.functions.length > 0)
        {
            this.functions.forEach((x, y) =>
            {
                // try
                // {
                    y.emit(pro1, pro2, pro3, pro4, returns);
                    if (!y.Active)
                    {
                        this.functions.remove(x);
                    }
                // } catch (error)
                // {
                //     cc.error(error, y);
                // }
                // finally
                // {
                    return false;
                // }
            });
        }
    }
    public clear()
    {
        this.functions.clear();
    }
}



export class Delegate extends DelegateBase
{
    /**
     * @param action 回调
     * @param calltarget this指向
     * @param callTime 执行次数 默认无限
     * 
     */
    public on(action: Action, calltarget: any, callTime: number = undefined)
    {
        this.baseOn(action, calltarget, callTime);
    }
    public emit()
    {
        this.baseEmit();
    }
    public emitGetRetun(): unknown[]
    {
        let arr = [];
        this.baseEmit(undefined, undefined, undefined, undefined, arr);
        return arr;
    }

}


export class Delegate1<T> extends DelegateBase
{

    /**
     * @param action 回调
     * @param calltarget this指向
     * @param callTime 执行次数 默认无限
     * 
     */
    public on(action: Action1<T>, calltarget: any, callTime: number = undefined)
    {
        this.baseOn(action, calltarget, callTime);
    }
    public emit(pro: T)
    {
        return this.baseEmit(pro);
    }
    public emitGetRetun(pro: T): unknown[]
    {
        let arr = [];
        this.baseEmit(pro, undefined, undefined, undefined, arr);
        return arr;
    }

}



export class Delegate2<T1, T2> extends DelegateBase
{
    /**
 * @param action 回调
 * @param calltarget this指向
 * @param callTime 执行次数 默认无限
 * 
 */
    public on(action: Action2<T1, T2>, calltarget: any, callTime: number = undefined)
    {
        this.baseOn(action, calltarget, callTime);
    }
    public emit(pro1: T1, pro2: T2)
    {
        this.baseEmit(pro1, pro2);
    }

    public emitGetRetun(pro1: T1, pro2: T2): unknown[]
    {
        let arr = [];
        this.baseEmit(pro1, pro2, undefined, undefined, arr);
        return arr;
    }
}


export class Delegate3<T1, T2, T3> extends DelegateBase
{
    /**
 * @param action 回调
 * @param calltarget this指向
 * @param callTime 执行次数 默认无限
 * 
 */
    public on(action: Action3<T1, T2, T3>, calltarget: any, callTime: number = undefined)
    {
        this.baseOn(action, calltarget, callTime);
    }
    public emit(pro1: T1, pro2: T2, pro3: T3)
    {
        this.baseEmit(pro1, pro2, pro3);
    }
    public emitGetRetun(pro1: T1, pro2: T2, pro3: T3): unknown[]
    {
        let arr = [];
        this.baseEmit(pro1, pro2, pro3, undefined, arr);
        return arr;
    }
}


export class Delegate4<T1, T2, T3, T4> extends DelegateBase
{
    /**
     * @param action 回调
     * @param calltarget this指向
     * @param callTime 执行次数 默认无限
     * 
     */
    public on(action: Action4<T1, T2, T3, T4>, calltarget: any, callTime: number = undefined)
    {
        return this.baseOn(action, calltarget, callTime);
    }
    public emit(pro1: T1, pro2: T2, pro3: T3, pro4: T4)
    {
        this.baseEmit(pro1, pro2, pro3, pro4);
    }
    public emitGetRetun(pro1: T1, pro2: T2, pro3: T3, pro4: T4): unknown[]
    {
        let arr = [];
        this.baseEmit(pro1, pro2, pro3, pro4, arr);
        return arr;
    }
}






export interface Action
{
    (): void;
}
export interface Action1<T>
{
    (arg0: T): void;
}
export interface Action2<T, R>
{
    (arg0: T, arg1: R): void;
}
export interface Action3<T, R, V>
{
    (arg0: T, arg1: R, arg2: V): void;
}

export interface Action4<T, R, V, B>
{
    (arg0: T, arg1: R, arg2: V, arg3: B): void;

}
export interface Func<R>
{
    (): R;
}
export interface Func1<T, R>
{
    (arg0: T): R;
}
export interface Func2<T1, T2, R>
{
    (arg0: T1, arg1: T2): R;
}
export interface Func3<T1, T2, T3, R>
{
    (arg0: T1, arg1: T2, arg2: T3): R;
}





export interface IProtocolSerializable
{
    Serialize(stream: BufferWriter): void;
    Deserialize(stream: BufferReader): void;
}
export class SList<T extends number | string | IProtocolSerializable | Date> implements IProtocolSerializable
{
    protected _list: T[] = [];
    private creatValueParamaters;
    private dserValFunc: Function;
    private serValFunc: Function;
    indexOf(data: T): number
    {
        return this._list.indexOf(data);
    }
    public get getArray(): T[]
    {
        return this._list;
    }
    has(value: T): boolean
    {
        for (let index = 0; index < this._list.length; index++)
        {
            const element = this._list[index];
            if (value == element)
            {
                return true;
            }
        }
        return false;
    }
    setByIndex(index: number, value: T)
    {
        if (this._list.length > index)
        {
            this._list[index] = value;
        }
    }
    getByIndex(index: number)
    {
        if (this._list.length > index)
        {
            return this._list[index];
        }
        return undefined;
    }
    constructor(vlue_Type: SerializableType, ...creatValueParamaters)
    {
        this.creatValueParamaters = creatValueParamaters;
        this.serValFunc = BufferWriter.prototype[`write${SerializableType[vlue_Type]}`];
        this.dserValFunc = BufferReader.prototype[`read${SerializableType[vlue_Type]}`];
    }
    public get length(): number
    {
        return this._list.length;
    }
    Serialize(stream: BufferWriter): void
    {
        stream.writeUInt16(this.length);
        this.forEach(element =>
        {
            this.serValFunc.call(stream, element);
        });
    }
    Deserialize(stream: BufferReader): void
    {
        let len = stream.readUInt16();
        for (let index = 0; index < len; index++)
        {
            this._list.push(this.dserValFunc.apply(stream, this.creatValueParamaters));
        }
    }
    public forEach(f: { (data: T): any })
    {
        let count: number = this._list.length;
        for (let index = 0; index < count; index++)
        {
            const element: T = this._list[index];
            if (f(element))
            {
                break;
            }
        }
    }
    public add(value: T): void
    {
        this._list.push(value);
    }
    public addRange(valus: T[])
    {
        if (valus && valus.length > 0)
        {
            for (let index = 0; index < valus.length; index++)
            {
                const element = valus[index];
                this._list.push(element);
            }
        }
    }
    public remove(index: number): T
    {
        if (index < this.length && index >= 0)
        {
            var data: T = this._list[index];
            this._list.splice(index, 1);
            return data;
        }
        return null;
    }
    clear()
    {
        this._list = [];
    }
}
//字典
export class Dictionary<ValueType>
{
    private _items: any = {};
    private _len: number = 0;
    get length(): number
    {
        return this._len;
    }
    has(key: any): boolean
    {
        return this._items.hasOwnProperty(key);
    }
    add(key: any, val: ValueType)
    {
        if (!this.has(key))
        {
            this._len++;
        }
        this._items[key] = val;
    }
    getFirstValue(): ValueType
    {
        for (let k in this._items)
        {
            return this._items[k];
        }
        return undefined;
    }
    getFirstKey(): any
    {
        for (let k in this._items)
        {
            return k;
        }
        return undefined;
    }
    remove(key: any): ValueType 
    {
        if (this.has(key)) 
        {
            let v = this._items[key];
            delete this._items[key];
            this._len--;
            return v;
        }
    }
    get(key: any): ValueType 
    {
        return this.has(key) ? this._items[key] : undefined;
    }
    clear()
    {
        this._items = {};
        this._len = 0;
    }



    get values(): ValueType[] 
    {
        this._items
        let values: ValueType[] = [];
        for (let k in this._items) 
        {
            values.push(this._items[k]);
        }
        return values;
    }
    get keys(): any[]
    {
        let keys: any[] = [];
        for (let k in this._items) 
        {
            keys.push(k);
        }
        return keys;
    }
    /**  如果回调返回ture则结束循环 返回false 继续循环 */
    forEach(action: Func2<any, ValueType, boolean>): boolean
    {
        for (let k in this._items)
        {
            if (action(k, this._items[k]))
            {
                return true;
            }
        }
        return false;
    }

    forEachKey(action: Func1<any, boolean>): boolean
    {
        for (let k in this._items)
        {
            if (action(k))
            {
                return true;
            }
        }
        return false;
    }

    forEachValue(action: Func1<ValueType, boolean>): boolean
    {
        for (let k in this._items)
        {
            if (action(this._items[k]))
            {
                return true;
            }
        }
        return false;
    }

    public async forEachAsync(promiseFunc: Func2<any, ValueType, Promise<void>>)
    {
        for (let k in this._items)
        {
            await promiseFunc(k, this._items[k])
        }
        return false;
    }





}
export class SDictionary<K, V extends number | string | IProtocolSerializable | Date> extends Dictionary<V> implements IProtocolSerializable
{
    private serKeyFunc: Function;
    private dserKeyFunc: Function;
    private serValFunc: Function;
    private dserValFunc: Function;
    private creatValueParamaters;
    constructor(key_Type: SerializableType, vlue_Type: SerializableType, ...creatValueParamaters)
    {
        super();
        this.creatValueParamaters = creatValueParamaters;
        this.serKeyFunc = BufferWriter.prototype[`write${SerializableType[key_Type]}`];
        this.dserKeyFunc = BufferReader.prototype[`read${SerializableType[key_Type]}`];
        this.serValFunc = BufferWriter.prototype[`write${SerializableType[vlue_Type]}`];
        this.dserValFunc = BufferReader.prototype[`read${SerializableType[vlue_Type]}`];
    }
    Serialize(stream: BufferWriter): void
    {
        stream.writeUInt16(this.length);
        this.forEach((key, value) =>
        {
            this.serKeyFunc.call(stream, key);
            this.serValFunc.call(stream, value);
            return false;
        });
    }
    Deserialize(stream: BufferReader): void
    {
        let len = stream.readUInt16();
        for (let index = 0; index < len; index++)
        {
            let key = this.dserKeyFunc.apply(stream);
            let value = this.dserValFunc.apply(stream, this.creatValueParamaters);
            this.add(key, value);
        }
    }
}



export class HashSet<T>
{
    protected _list: T[];

    constructor()
    {
        this.clear();
    }
    public get length(): number
    {
        return this._list.length;
    }
    protected indexOf(value: T): number
    {
        return this._list.indexOf(value);

    }

    Has(value: T): boolean
    {
        return this.indexOf(value) >= 0;
    }

    public forEach(f: { (data: T): void })
    {
        let count: number = this._list.length;
        for (let index = 0; index < count; index++)
        {
            const element: T = this._list[index];
            f(element);
        }
    }


    public addOrUpdate(value: T): void
    {
        var index: number = this.indexOf(value);
        if (index != -1)
        {
            this._list[index] = value;
        }
        else
        {
            this._list.push(value);
        }
    }
    public remove(key: T): T
    {
        var index: number = this.indexOf(key);
        if (index != -1)
        {
            var data: T = this._list[index];
            this._list.splice(index, 1);
            return data;
        }
        return null;
    }
    public getByIndex(index: number)
    {
        if (this._list.length > index)
        {
            return this._list[index];
        }
        return undefined;
    }
    public toArray(): T[]
    {
        var arr = [];
        arr.push(this._list);
        return arr;
    }

    clear()
    {
        this._list = [];
    }

}

export class SHashSet<T extends number | string | IProtocolSerializable | Date> implements IProtocolSerializable
{
    protected _list: T[] = [];
    private creatValueParamaters;
    private dserValFunc: Function;
    private serValFunc: Function;
    constructor(vlue_Type: SerializableType, ...creatValueParamaters)
    {
        this.creatValueParamaters = creatValueParamaters;
        this.serValFunc = BufferWriter.prototype[`write${SerializableType[vlue_Type]}`];
        this.dserValFunc = BufferReader.prototype[`read${SerializableType[vlue_Type]}`];
        this.clear();
    }
    public get length(): number
    {
        return this._list.length;
    }
    protected getIndexByKey(value: T): number
    {
        var count: number = this._list.length;
        for (let index = 0; index < count; index++)
        {
            const element: T = this._list[index];
            if (element == value)
            {
                return index;
            }
        }
        return -1;
    }
    Has(value: T): boolean
    {
        return this.getIndexByKey(value) >= 0;
    }
    Serialize(stream: BufferWriter): void
    {
        stream.writeUInt16(this.length);
        this.forEach(element =>
        {
            this.serValFunc.call(stream, element);
        });
    }
    Deserialize(stream: BufferReader): void
    {
        let len = stream.readUInt16();
        for (let index = 0; index < len; index++)
        {
            this._list.push(this.dserValFunc.apply(stream, this.creatValueParamaters));
        }
    }
    public forEach(f: { (data: T): void })
    {
        let count: number = this._list.length;
        for (let index = 0; index < count; index++)
        {
            const element: T = this._list[index];
            f(element);
        }
    }
    public addOrUpdate(value: T): void
    {
        var index: number = this.getIndexByKey(value);
        if (index != -1)
        {
            this._list[index] = value;
        }
        else
        {
            this._list.push(value);
        }
    }
    public remove(key: T): T
    {
        var index: number = this.getIndexByKey(key);
        if (index != -1)
        {
            var data: T = this._list[index];
            this._list.splice(index, 1);
            return data;
        }
        return null;
    }
    public getByIndex(index: number)
    {
        if (this._list.length > index)
        {
            return this._list[index];
        }
        return undefined;
    }
    public toArray(): T[]
    {
        var arr = [];
        arr.push(this._list);
        return arr;
    }
    clear()
    {
        this._list = [];
    }

}








export function UTF8Length(input: string)
{
    if (!input || input == '')
    {
        return 1;
    }
    let output = 3;
    for (let i = 0; i < input.length; i++)
    {
        let charCode = input.charCodeAt(i);
        if (charCode > 0x7FF)
        {
            if (0xD800 <= charCode && charCode <= 0xDBFF)
            {
                i++;
                output++;
            }
            output += 3;
        } else if (charCode > 0x7F)
            output += 2;
        else
            output++;
    }
    return output;
}

// export function SerializableLength<T extends IProtocolSerializable>(instance: T): number
// {
//     return instance ? instance.BufferLength() + 1 : 1;
// }



export class BufferWriter
{

    protected getStringLength(input: string)
    {
        let output = 0;
        for (let i = 0; i < input.length; i++)
        {
            let charCode = input.charCodeAt(i);
            if (charCode > 0x7FF)
            {
                // Surrogate pair means its a 4 byte character
                if (0xD800 <= charCode && charCode <= 0xDBFF)
                {
                    i++;
                    output++;
                }
                output += 3;
            } else if (charCode > 0x7F)
                output += 2;
            else
                output++;
        }
        return output;
    }
    protected buffer: ArrayBuffer;
    protected offset: number;
    protected dataView: DataView;
    public get length(): number
    {
        return this.offset;
    }

    constructor(length: number = 128)
    {
        if (!length)
        {
            length = 128;
        }
        this.buffer = new ArrayBuffer(length);
        this.dataView = new DataView(this.buffer);
        this.offset = 0;
    }

    joint(buffer: ArrayBufferLike)
    {
        if (buffer && buffer.byteLength)
        {
            this.moreBuffer(buffer.byteLength);
            var reader = new BufferReader(buffer);
            while (!reader.isReadToEnd)
            {
                this.dataView.setUint8(this.offset++, reader.readByte());
            }
        }
    }

    public getJsonData(): string
    {
        var arr = new Uint8Array(this.Buffer);
        var numArr = new Array<number>();
        arr.forEach(x =>
        {
            numArr.push(x);
        });
        return JSON.stringify(numArr);
    }

    public get Buffer(): ArrayBufferLike
    {
        if (this.buffer.byteLength > this.offset)
        {
            return this.buffer.slice(0, this.offset);
        }
        return this.buffer;
    }
    public getBase64String(): string
    {
        return arrayBufferToBase64(this.Buffer);
    }
    protected getBuffer(): ArrayBufferLike
    {
        if (this.buffer.byteLength > this.offset)
        {
            return this.buffer.slice(0, this.offset);
        }
        return this.buffer;
    }
    protected getUint8Array(): Uint8Array
    {
        return new Uint8Array(this.getBuffer());
    }
    //string
    writeString(str: string)
    {
        if (!str || str == '')
        {
            this.moreBuffer(1);
            this.writeByte(0);
            return;
        }
        this.writeByte(1);
        //var strlen = this.getStringLength(str);
        let oldindex = this.offset;
        this.writeUInt16(0);

        let len, c;
        len = str.length;
        for (let i = 0; i < len; i++)
        {
            c = str.charCodeAt(i);
            if (c >= 0x010000 && c <= 0x10FFFF)
            {
                this.writeByte(((c >> 18) & 0x07) | 0xF0);
                this.writeByte(((c >> 12) & 0x3F) | 0x80);
                this.writeByte(((c >> 6) & 0x3F) | 0x80);
                this.writeByte((c & 0x3F) | 0x80);
            } else if (c >= 0x000800 && c <= 0x00FFFF)
            {
                this.writeByte(((c >> 12) & 0x0F) | 0xE0);
                this.writeByte(((c >> 6) & 0x3F) | 0x80);
                this.writeByte((c & 0x3F) | 0x80);
            } else if (c >= 0x000080 && c <= 0x0007FF)
            {
                this.writeByte(((c >> 6) & 0x1F) | 0xC0);
                this.writeByte((c & 0x3F) | 0x80);
            } else
            {
                this.writeByte(c & 0xFF);
            }
        }
        this.dataView.setUint16(oldindex, this.offset - oldindex - 2, true)
        return this;

    }
    writeDouble(input: number)
    {
        this.moreBuffer(8)
        this.dataView.setFloat64(this.offset, input, true);
        this.offset += 8;
        return this;
    }
    //bool
    writeBoolean(input: boolean)
    {
        this.moreBuffer(1);
        this.dataView.setUint8(this.offset++, input ? 1 : 0);
        return this;
    }
    writeByte(input: number)
    {
        this.moreBuffer(1);
        this.dataView.setUint8(this.offset++, input);
        return this;
    }
    writeSByte(input: number)
    {
        this.moreBuffer(1);
        this.dataView.setInt8(this.offset++, input);
        return this;
    }
    writeUInt16(input: number)
    {
        this.moreBuffer(2);
        this.dataView.setUint16(this.offset, input, true);
        this.offset += 2;
        return this;
    }
    writeInt16(input: number)
    {
        this.moreBuffer(2);
        this.dataView.setInt16(this.offset, input, true);
        this.offset += 2;
        return this;
    }
    writeInt32(input: number)
    {
        this.moreBuffer(4);
        this.dataView.setInt32(this.offset, input, true);
        this.offset += 4;
        return this;
    }
    writeUInt32(input: number)
    {
        this.moreBuffer(4);
        this.dataView.setUint32(this.offset, input, true);
        this.offset += 4;
        return this;
    }
    writeSingle(input: number)
    {
        this.moreBuffer(4);
        this.dataView.setFloat32(this.offset, input, true);
        this.offset += 4;
        return this;
    }
    writeInt64(input: number)
    {
        this.moreBuffer(8);
        var sign = input < 0;
        if (sign)
            input = -1 - input;
        for (var i = 0; i < 8; i++)
        {
            var mod = input % 0x100;
            input = (input - mod) / 0x100;
            var v = sign ? mod ^ 0xFF : mod;
            this.dataView.setUint8(this.offset++, v);
        }
        return this;
    }
    writeUInt64(input: number)
    {
        this.moreBuffer(8);
        var sign = input < 0;
        if (sign)
            input = -1 - input;
        for (var i = 0; i < 8; i++)
        {
            var mod = input % 0x100;
            input = (input - mod) / 0x100;
            var v = sign ? mod ^ 0xFF : mod;
            this.dataView.setUint8(this.offset++, v);
        }
        return this;
    }

    writeDateTime(input: Date)
    {
        if (input)
        {
            this.writeInt64(((input.valueOf() + 28800000) * 10000) + 621355968000000000);
        }
        else
        {
            this.offset += 8;
        }
        return this;
    }
    writeSerializable<T extends IProtocolSerializable>(instance: T) 
    {
        //如果是null或者Undefine
        if (!instance)
        {
            this.writeByte(0);
            return;
        }
        instance['_$getSerializableTable'] && instance['_$getSerializableTable']();
        if (instance['_$serializeValue'] == undefined)
        {
            this.writeByte(1);
            instance.Serialize(this);
        }
        else
        {
            this.writeByte(2);
            this.writeByte(instance['_$serializeValue']);
            instance.Serialize(this);
        }
        return this;
    }
    private moreBuffer(len: number)
    {
        if (this.offset + len > this.buffer.byteLength)
        {
            var current = this.offset;
            var arr = new Uint8Array(this.buffer);
            this.buffer = new ArrayBuffer(this.offset + (len < 128 ? 128 : len));
            this.dataView = new DataView(this.buffer);
            this.offset = 0;
            for (let index = 0; index < current; index++)
            {
                const element = arr[index];
                this.writeByte(element);
            }
        }
    }
    public rest()
    {
        this.offset = 0;
        return this;
    }

}


export class BufferReader implements IProtocolSerializable
{
    protected buffer: ArrayBuffer;
    protected offset: number;
    protected dataView: DataView;
    public get isReadToEnd()
    {
        return this.offset >= this.buffer.byteLength;
    }
    public get length(): number
    {
        return this.buffer.byteLength;
    }
    public get Index(): number
    {
        return this.offset;
    }
    public get Buffer(): ArrayBuffer
    {
        return this.buffer;
    }
    constructor(buffer: ArrayBuffer | Array<number> | Uint8Array | string)
    {
        if (buffer instanceof ArrayBuffer)
        {
            this.buffer = buffer;
            this.dataView = new DataView(this.buffer);
        }
        else if (buffer instanceof Array || buffer instanceof Uint8Array)
        {
            this.buffer = new ArrayBuffer(buffer.length);
            this.dataView = new DataView(this.buffer);
            for (let index = 0; index < buffer.length; index++)
            {
                const element = buffer[index];
                this.dataView.setUint8(index, element);
            }
        }
        else if (typeof (buffer) == "string")
        {
            var u8arr = base64ToUint8Array(buffer);
            this.buffer = new ArrayBuffer(u8arr.length);
            this.dataView = new DataView(this.buffer);
            for (let index = 0; index < u8arr.length; index++)
            {
                const element = u8arr[index];
                this.dataView.setUint8(index, element);
            }
        }
        this.offset = 0;
    }

    Serialize(stream: BufferWriter): void 
    {
        stream.writeUInt16(this.buffer.byteLength);
        for (let index = 0; index < this.buffer.byteLength; index++) 
        {
            stream.writeByte(this.dataView.getInt8(index));
        }
    }
    Deserialize(stream: BufferReader): void 
    {
        let count = stream.readUInt16();
        this.buffer = new ArrayBuffer(count);
        this.dataView = new DataView(this.buffer);
        for (let index = 0; index < count; index++)
        {
            this.dataView.setUint8(index, stream.readByte());
        }
        this.offset = 0;
    }
    rest()
    {
        this.offset = 0;
    }
    readString()
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        if (!this.readBoolean())
        {
            return undefined;
        }
        let output = "";
        let utf16;
        let length = this.readUInt16();
        let pos = 0;
        let input = new Uint8Array(this.buffer, this.offset, length);
        this.offset += length;
        while (pos < length)
        {
            let byte1 = input[pos++];
            if (byte1 < 128)
                utf16 = byte1;
            else
            {
                let byte2 = input[pos++] - 128;
                if (byte1 < 0xE0) // 2 byte character
                    utf16 = 64 * (byte1 - 0xC0) + byte2;
                else
                {
                    let byte3 = input[pos++] - 128;
                    if (byte1 < 0xF0) // 3 byte character
                        utf16 = 4096 * (byte1 - 0xE0) + 64 * byte2 + byte3;
                    else
                    {
                        let byte4 = input[pos++] - 128;
                        if (byte1 < 0xF8) // 4 byte character
                            utf16 = 262144 * (byte1 - 0xF0) + 4096 * byte2 + 64
                                * byte3 + byte4;
                    }
                }
            }
            if (utf16 > 0xFFFF) // 4 byte character - express as a surrogate
            // pair
            {
                utf16 -= 0x10000;
                output += String.fromCharCode(0xD800 + (utf16 >> 10)); // lead
                // character
                utf16 = 0xDC00 + (utf16 & 0x3FF); // trail character
            }
            output += String.fromCharCode(utf16);
        }
        return output;
    }
    readBoolean(): boolean
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        return this.dataView.getUint8(this.offset++) == 1;
    }
    readByte(): number
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        return this.dataView.getUint8(this.offset++);
    }
    readSByte(): number
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        return this.dataView.getInt8(this.offset++);
    }
    readUInt16()
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        let num = this.dataView.getUint16(this.offset, true);
        this.offset += 2;
        return num;
    }
    readInt16()
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        let num = this.dataView.getInt16(this.offset, true);
        this.offset += 2;
        return num;
    }
    readInt32()
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        let num = this.dataView.getInt32(this.offset, true);
        this.offset += 4;
        return num;
    }
    readUInt32()
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        let num = this.dataView.getUint32(this.offset, true);
        this.offset += 4;
        return num;
    }
    readSingle()
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        let num = this.dataView.getFloat32(this.offset, true);
        this.offset += 4;
        return num;
    }
    readInt64()
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        var bytes = new Uint8Array(this.buffer, this.offset, 8);
        var sign = bytes[7] >> 7;
        this.offset += 8;
        var sum = 0;
        var digits = 1;
        for (var i = 0; i < 8; i++)
        {
            var value = bytes[i];
            sum += (sign ? value ^ 0xFF : value) * digits;
            digits *= 0x100;
        }
        return sign ? -1 - sum : sum;
    }
    readUInt64()
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        var bytes = new Uint8Array(this.buffer, this.offset, 8);
        var sign = bytes[7] >> 7;
        this.offset += 8;
        var sum = 0;
        var digits = 1;
        for (var i = 0; i < 8; i++)
        {
            var value = bytes[i];
            sum += (sign ? value ^ 0xFF : value) * digits;
            digits *= 0x100;
        }
        return sign ? -1 - sum : sum;
    }
    readDouble()
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        let num = this.dataView.getFloat64(this.offset, true);
        this.offset += 8;
        return num;
    }
    readDateTime()
    {
        if (this.offset >= this.buffer.byteLength)
        {
            return undefined;
        }
        return new Date(((this.readInt64() - 621355968000000000) / 10000) - 28800000);
    }
    readSerializable<T extends IProtocolSerializable>(type: { prototype: T }, ...ctorParamaters): T
    {
        var instance: any;
        try
        {
            if (this.offset >= this.buffer.byteLength)
            {
                return instance;
            }
            let bit = this.readByte();
            if (!bit)
            {
                return instance;
            }
            if (bit == 2)
            {
                bit = this.readByte();
                type = type.prototype['_$getSerializableTable']()[bit];
            }
            var instance = new (type as any)(...ctorParamaters);
            instance.Deserialize(this);
        }
        catch (error)
        {
            console.warn(error);
        }
        return instance;
    }

}













export class Queue<T>
{
    private data: T[] = [];
    public get Count(): number
    {
        return this.data.length;
    }
    insert(item: T, index: number)
    {
        this.data.splice(index, 0, item);
    }
    Enque(item: T)
    {
        this.data.push(item)
    }
    Deque(): T
    {
        return this.data.shift()
    }
    Clear()
    {
        this.data = [];
    }
    getArray(): T[]
    {
        return this.data
    }
    public forEach(f: { (data: T): void })
    {
        let count: number = this.data.length;
        for (let index = 0; index < count; index++)
        {
            const element: T = this.data[index];
            f(element);
        }
    }
}
export class EncryptHelper
{
    //private static Keys: Uint8Array = new Uint8Array([102, 120, 22, 24, 88, 6, 119, 88]);
    //  private static Int32Kes: Int32Array = EncryptHelper.ToIntArray(EncryptHelper.Keys, false);
    public static CreatKeys(keys: Uint8Array): Int32Array
    {
        var key = EncryptHelper.ToIntArray(keys, false);
        if (key.length < 4)
        {
            var key2 = new Int32Array(4);
            for (let index = 0; index < key.length; index++)
            {
                const element = key[index];
                key2[index] = element;
            }
            key = key2;
        }
        return key;
    }
    public static EncryptBinary(data: Uint8Array, keys: Int32Array): Uint8Array
    {
        if (data.length == 0)
        {
            return data;
        }
        return this.ToByteArray(this.Encrypt(this.ToIntArray(data, true), keys), false);
    }
    public static DecryptBinary(data: Uint8Array, keys: Int32Array): Uint8Array
    {
        if (data.length == 0)
        {
            return data;
        }
        return this.ToByteArray(this.Decrypt(this.ToIntArray(data, false), keys), true);
    }
    private static RightMove(value: number, pos: number): number
    {
        if (pos != 0)
        {
            var mask = 2147483647;
            value = value >> 1;
            value = value & mask;
            value = value >> pos - 1;
        }
        return value;
    }
    private static Encrypt(data: Int32Array, keys: Int32Array): Int32Array
    {
        var n: number = data.length - 1;
        if (n < 1)
        {
            return data;
        }
        var z: number = data[n];
        var y: number = data[0];
        var delta: number = -1640531527;
        var sum: number = 0;
        var e: number = 0;
        var p: number = 0;
        var q: number = Math.floor((6 + 52 / (n + 1)));
        while (q-- > 0)
        {
            sum = (sum + delta);
            e = this.RightMove(sum, 2) & 3;
            for (p = 0; p < n; p++)
            {
                y = data[p + 1];
                z = data[p] += (this.RightMove(z, 5) ^ y << 2) + (this.RightMove(y, 3) ^ z << 4) ^ (sum ^ y) + (keys[p & 3 ^ e] ^ z);
            }

            y = data[0];
            z = data[n] += (this.RightMove(z, 5) ^ y << 2) + (this.RightMove(y, 3) ^ z << 4) ^ (sum ^ y) + (keys[p & 3 ^ e] ^ z);
        }
        return data;
    }
    private static Decrypt(data: Int32Array, keys: Int32Array): Int32Array
    {
        var n: number = data.length - 1;
        if (n < 1)
        {
            return data;
        }
        var z: number = data[n]
        var y: number = data[0]
        var delta: number = -1640531527;
        var sum: number = 0;
        var e: number = 0;
        var p: number = 0;
        var q: number = Math.floor((6 + 52 / (n + 1)));

        sum = q * delta;
        while (sum != 0)
        {
            e = this.RightMove(sum, 2) & 3;
            for (p = n; p > 0; p--)
            {
                z = data[p - 1];
                y = data[p] -= (this.RightMove(z, 5) ^ y << 2) + (this.RightMove(y, 3) ^ z << 4) ^ (sum ^ y) + (keys[p & 3 ^ e] ^ z);
            }

            z = data[n];
            y = data[0] -= (this.RightMove(z, 5) ^ y << 2) + (this.RightMove(y, 3) ^ z << 4) ^ (sum ^ y) + (keys[p & 3 ^ e] ^ z);
            sum = sum - delta;
        }
        return data;
    }
    private static ToIntArray(data: Uint8Array, includeLength: boolean): Int32Array
    {
        var n = (data.length & 3) == 0 ? this.RightMove(data.length, 2) : (this.RightMove(data.length, 2)) + 1;
        var result: Int32Array;

        if (includeLength)
        {
            result = new Int32Array(n + 1);
            result[n] = data.length;
        }
        else
        {
            result = new Int32Array(n);
        }
        n = data.length;
        for (var i = 0; i < n; i++)
        {
            result[this.RightMove(i, 2)] |= (0x000000ff & data[i]) << ((i & 3) << 3);
        }
        return result;
    }
    private static ToByteArray(data: Int32Array, includeLength: boolean): Uint8Array
    {
        var n = data.length << 2;
        if (includeLength)
        {
            var m = data[data.length - 1];
            if (m > n)
            {
                return null;
            }
            else
            {
                n = m;
            }
        }
        var result = new Uint8Array(n);
        for (var i = 0; i < n; i++)
        {
            result[i] = ((this.RightMove(data[this.RightMove(i, 2)], (i & 3) << 3)) & 0xff);
        }
        return result;
    }
}



export class Md5Tool
{
    private static hexcase = 0;
    private static b64pad = "";
    private static chrsz = 8;
    static md5String(s: string)
    {
        return Md5Tool.binl2hex(Md5Tool.core_md5(Md5Tool.str2binl(s), s.length * Md5Tool.chrsz));
    }
    static md5(binarry: Uint8Array)
    {
        return Md5Tool.binl2hex(binarry);
    }
    static md5Buffer(buffer: ArrayBuffer)
    {
        return Md5Tool.binl2hex(new Uint8Array(buffer));
    }




    private static core_md5(x, len)
    {
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;

        for (var i = 0; i < x.length; i += 16)
        {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = Md5Tool.md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = Md5Tool.md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = Md5Tool.md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = Md5Tool.md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = Md5Tool.md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = Md5Tool.md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = Md5Tool.md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = Md5Tool.md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = Md5Tool.md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = Md5Tool.md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = Md5Tool.md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = Md5Tool.md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = Md5Tool.md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = Md5Tool.md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = Md5Tool.md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = Md5Tool.md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
            a = Md5Tool.md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = Md5Tool.md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = Md5Tool.md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = Md5Tool.md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = Md5Tool.md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = Md5Tool.md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = Md5Tool.md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = Md5Tool.md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = Md5Tool.md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = Md5Tool.md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = Md5Tool.md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = Md5Tool.md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = Md5Tool.md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = Md5Tool.md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = Md5Tool.md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = Md5Tool.md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = Md5Tool.md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = Md5Tool.md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = Md5Tool.md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = Md5Tool.md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = Md5Tool.md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = Md5Tool.md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = Md5Tool.md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = Md5Tool.md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = Md5Tool.md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = Md5Tool.md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = Md5Tool.md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = Md5Tool.md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = Md5Tool.md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = Md5Tool.md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = Md5Tool.md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = Md5Tool.md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = Md5Tool.md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = Md5Tool.md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = Md5Tool.md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = Md5Tool.md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = Md5Tool.md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = Md5Tool.md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = Md5Tool.md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = Md5Tool.md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = Md5Tool.md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = Md5Tool.md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = Md5Tool.md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = Md5Tool.md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = Md5Tool.md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = Md5Tool.md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = Md5Tool.md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = Md5Tool.md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = Md5Tool.safe_add(a, olda);
            b = Md5Tool.safe_add(b, oldb);
            c = Md5Tool.safe_add(c, oldc);
            d = Md5Tool.safe_add(d, oldd);
        }
        return Array(a, b, c, d);

    }


    private static md5_cmn(q, a, b, x, s, t)
    {
        return Md5Tool.safe_add(Md5Tool.bit_rol(Md5Tool.safe_add(Md5Tool.safe_add(a, q), Md5Tool.safe_add(x, t)), s), b);
    }
    private static md5_ff(a, b, c, d, x, s, t)
    {
        return Md5Tool.md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    private static md5_gg(a, b, c, d, x, s, t)
    {
        return Md5Tool.md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    private static md5_hh(a, b, c, d, x, s, t)
    {
        return Md5Tool.md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    private static md5_ii(a, b, c, d, x, s, t)
    {
        return Md5Tool.md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }
    private static core_hmac_md5(key, data)
    {
        var bkey = Md5Tool.str2binl(key);
        if (bkey.length > 16) bkey = Md5Tool.core_md5(bkey, key.length * Md5Tool.chrsz);
        var ipad = Array(16), opad = Array(16);
        for (var i = 0; i < 16; i++)
        {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        var hash = Md5Tool.core_md5(ipad.concat(Md5Tool.str2binl(data)), 512 + data.length * Md5Tool.chrsz);
        return Md5Tool.core_md5(opad.concat(hash), 512 + 128);
    }


    private static safe_add(x, y)
    {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    private static bit_rol(num, cnt)
    {
        return (num << cnt) | (num >>> (32 - cnt));
    }


    private static str2binl(str)
    {
        var bin = Array();
        var mask = (1 << Md5Tool.chrsz) - 1;
        for (var i = 0; i < str.length * Md5Tool.chrsz; i += Md5Tool.chrsz)
            bin[i >> 5] |= (str.charCodeAt(i / Md5Tool.chrsz) & mask) << (i % 32);
        return bin;
    }


    private static binl2str(bin)
    {
        var str = "";
        var mask = (1 << Md5Tool.chrsz) - 1;
        for (var i = 0; i < bin.length * 32; i += Md5Tool.chrsz)
            str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
        return str;
    }


    private static binl2hex(binarray)
    {
        var hex_tab = Md5Tool.hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++)
        {
            str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
                hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
        }
        return str;
    }


    private static binl2b64(binarray)
    {
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i += 3)
        {
            var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16)
                | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8)
                | ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
            for (var j = 0; j < 4; j++)
            {
                if (i * 8 + j * 6 > binarray.length * 32) str += Md5Tool.b64pad;
                else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
            }
        }
        return str;
    }


}







