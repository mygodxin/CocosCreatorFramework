import { Asset, instantiate, Node, Prefab } from "cc";
import { loader } from "../../support/res/Loader";

/** 组件基类 */
export default abstract class BaseComp extends Node {
    /** 包名 */
    abstract get pack(): string;
    /** url */
    abstract get url(): string;

    /** node组件 */
    private viewComponent: Node;

    /** 打开面板传输的数据 */
    openData: any;

    private _loading: boolean;
    private _inited: boolean = false;

    init(): void {
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
        return this.viewComponent.parent != null;
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