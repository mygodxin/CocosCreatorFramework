import BaseWindow from "./base/BaseWindow";
import BaseComp from "./base/BaseComp";
import { Asset, director, instantiate, Node, Prefab, Scene } from "cc";

class GameLayer {
    private _modalLayer: Node;

    init(): void {
        // this.drawModalLayer();
    }

    // private drawModalLayer(): void {

    // }

    /**
     * 添加组件
     * @param comp prefab上绑定的脚本类 
     * @param param 可通过this.openData获取
     */
    async addComp<T extends BaseComp>(comp: { prototype: T }, parent?: Node, param?: any): Promise<Node> {
        const pack = (comp as any).pack;
        const url = (comp as any).url;
        const res = await loader.loadSync(pack, url);
        const node = instantiate(res as Prefab);
        const baseComp = node.getComponent(comp);
        if (!baseComp) throw new Error(comp + ' no find');
        if (param && param instanceof Function)
            param(node);
        else
            baseComp.openData = param;
        if (parent != undefined)
            parent.addChild(node);
        return node;
    }

    /** 显示场景(TODO) */
    private showScene(scene: { new(): BaseScene }, param?: any): void {
        director.getScene().destroy();
        this.showWindow(scene, param);
        return;
    }

    /**
     * 显示面板
     * @param view prefab上绑定的脚本类
     * @param param Object可通过this.openData获取,Function则完成后调用
     */
    showWindow(view: { new(): BaseWindow }, param?: any): void {
        if (!view) return;

        this.load(view, param);
    }

    private load(comp: { new(): BaseComp }, param?: any): void {
        if (!comp) return;
        const pack = (comp as any).pack;
        const url = (comp as any).url;
        if (pack)
            loader.load(pack, url, this.onLoadComplete.bind(this, comp, param));
        else
            loader.load(url, this.onLoadComplete.bind(this, comp, param));
    }

    private onLoadComplete(comp: { new(): BaseComp }, param: any, res: Asset): void {
        const node = instantiate(res as Prefab);
        const baseComp = node.getComponent(comp) as BaseComp;
        if (param && param instanceof Function)
            param(node);
        else
            baseComp.openData = param;
        this.root.addChild(node);
    }

    private get root(): Scene {
        return director.getScene();
    }
}
export const gameLayer = new GameLayer();