import { Asset, BaseNode, instantiate, js, Node, Prefab, warn } from "cc";
import { loader } from "../../support/res/Loader";

/** 组件基类 */
export default abstract class BaseComp extends Node {
    private pack: string;
    private url: string;
    constructor(url: string, pack: string) {
        super();
        this.name = js.getClassName(this);
        this.url = url;
        this.pack = pack;
    }

    /** node组件 */
    viewComponent: Node;

    /** 打开面板传输的数据 */
    openData: any;

    private _loading: boolean;
    private _inited: boolean = false;
    /** 是否自动解析UI */
    protected isAutoParse: boolean = true;

    show(): void {
        if (this._inited) {
            this.doShowAnimation();
        } else {
            if (this._loading) return;

            this._loading = true;
            if (this.pack != '')
                loader.load(this.pack, this.url, this.loadComplete.bind(this));
            else
                loader.load(this.url, this.loadComplete.bind(this));
        }
    }

    private loadComplete(res: Asset): void {
        this._loading = false;

        const node: Node = instantiate(res as Prefab);
        this.addChild(node);
        this.viewComponent = node;

        this._inited = true;
        this.onInit();

        if (this.isShowing)
            this.doShowAnimation();
    }

    protected doShowAnimation(): void {
        this.onShow();
    }

    /** 关闭 */
    hide(): void {
        if (this.isShowing)
            this.doHideAnimation();
    }

    protected doHideAnimation(): void {
        this.hideImmediately();
    }

    private hideImmediately(): void {
        this.onHide();
        this.removeFromParent();
    }

    /** 是否显示 */
    get isShowing(): boolean {
        return this.parent != null;
    }

    /** 初始化 */
    protected onInit(): void {

    }

    /** 打开 */
    protected onShow(): void {

    }

    /** 关闭 */
    protected onHide(): void {

    }
}