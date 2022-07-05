import { Asset, assetManager, AssetManager } from "cc";

class Loader {
    /** 异步加载 */
    load(pack: string, url: string, callback?: (res: Asset) => void): void;
    load(url: string, callback?: (res: Asset) => void): void;
    load(): void {
        const len = arguments.length;
        switch (len) {
            case 2:
                assetManager.loadAny(arguments[0], (err, res) => {
                    if (err) throw err;
                    arguments[1]?.();
                });
                break;
            case 3:
                this.loadByUrlFromBundle(arguments[0], arguments[1], arguments[2]);
                break;
        }
    }

    /** 同步加载 */
    async loadSync(pack: string, url: string): Promise<Asset>;
    async loadSync(url: string): Promise<Asset>;
    async loadSync(): Promise<Asset> {
        const len = arguments.length;
        switch (len) {
            case 2:
                return new Promise<Asset>((resolve, reject) => {
                    assetManager.loadAny(arguments[0], (err, res) => {
                        if (err) reject(err);
                        resolve(res);
                    });
                })
            case 3:
                const pack = arguments[0];
                const url = arguments[1];
                return new Promise<Asset>(async (resolve, reject) => {
                    const bundle = await this.loadBundleSync(pack);
                    if (bundle instanceof AssetManager.Bundle) {
                        bundle.load(url, (err, res) => {
                            if (err) reject(err);
                            resolve(res);
                        })
                    } else
                        reject(undefined);
                })
        }
    }

    /**
     * 同步加载bundle
     * @param pack 
     * @returns 
     */
    async loadBundleSync(pack: string): Promise<AssetManager.Bundle> {
        return new Promise<AssetManager.Bundle>((resolve, reject) => {
            const bundle = assetManager.getBundle(pack);
            if (bundle) {
                resolve(bundle);
            } else {
                assetManager.loadBundle(pack, (err: Error) => {
                    if (err) reject(err)
                    resolve(assetManager.getBundle(pack))
                })
            }
        })
    }

    private loadByUrlFromBundle(pack: string, url: string, callback: (res: Asset) => void): void {
        const bundle = assetManager.getBundle(pack);
        if (bundle) {
            bundle.load(url, (err, res) => {
                if (err) throw err;
                if (res) callback && callback(res as any);
            })
        } else {
            assetManager.loadBundle(pack, (err: Error) => {
                if (err) throw err;
                this.loadByUrlFromBundle(pack, url, callback);
            })
        }
    }
}

/** 加载器(继承自AssetManager,提供同步加载方式) */
export const loader = new Loader();