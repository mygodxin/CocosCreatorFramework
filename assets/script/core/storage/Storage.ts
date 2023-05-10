import { sys } from "cc";

class Storage {
    /**
     * 存储(非string类型自动序列化)
     * @param key 
     * @param value 
     */
    saveLocal(key: string, value: any) {
        if (typeof value !== 'string') {
            value = JSON.stringify(value);
        }
        sys.localStorage.setItem(key, value);
    }
    /**
     * 读取
     * @param key 
     * @param toJson 默认true
     * @returns 
     */
    readLocal(key: string, toJson: boolean = true) {
        var value = sys.localStorage.getItem(key);
        return toJson && value ? JSON.parse(value) : value;
    }
}
/** 本地存储 */
export const storage = new Storage();