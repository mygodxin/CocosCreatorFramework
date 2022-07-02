/*
 * @Author: 毛大仙 
 * @Date: 2022-07-02 20:24:10 
 * @Last Modified by:   毛大仙 
 * @Last Modified time: 2022-07-02 20:24:10 
 */
import { error } from "cc";

class HttpRequest {
    private readonly timeout: number = 5000;    // 超时时间(ms)

    /**
     * get请求
     * @param url 请求地址
     * @returns 
     */
    get(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let xhr: XMLHttpRequest = this.getXhr();
            xhr.open("GET", url, true);
            xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    let response = xhr.responseText;
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(response);
                    }
                    else {
                        reject("xhr.status = " + xhr.status);
                    }
                }
            };
            xhr.send();
        });
    }

    /**
     * post请求
     * @param url 请求地址
     * @param param 请求参数
     * @returns 
     */
    post(url: string, param: any): Promise<string> {
        return new Promise((resolve, reject) => {
            var xhr: XMLHttpRequest = this.getXhr();
            xhr.open("POST", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    let response = xhr.responseText;
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(response);
                    }
                    else {
                        reject("xhr.status = " + xhr.status);
                    }
                }
                else {
                    error(xhr);
                }
            };
            xhr.send(param);
        })
    }

    private getXhr(): XMLHttpRequest {
        const xhr = new XMLHttpRequest();
        xhr.timeout = this.timeout;
        return xhr;
    }
}

/** http请求 */
export const httpRequest = new HttpRequest();