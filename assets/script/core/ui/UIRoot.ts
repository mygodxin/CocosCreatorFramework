import { BlockInputEvents, Button, Color, director, Graphics, instantiate, Layers, Node, NodeEventType, Prefab, Sprite, UIOpacity, UITransform } from "cc";
import { loader } from "../../support/res/Loader";
import UIComp from "./UIComp";
import { UIScene } from "./UIScene";
import UIView from "./UIView";

/** UI层级(预留，端游的概念，手游的弹窗背景通常都有黑色遮罩，阻挡事件，所以很少会出现专门设置层级的情况) */
export enum UILayer {
    scene,
    window,
    alert
}

export class UIRoot {
    public readonly designWidth: number = 1280;
    public readonly designHeight: number = 720;
    public cacheList: Map<string, UIView> = new Map<string, UIView>();
    public _curScene: UIScene;

    /** 已打开节点列表 */
    public openList: UIView[] = [];
    /** modal层 */
    private _modalLayer: Node;

    private static _inst: UIRoot = null;
    public static get inst(): UIRoot {
        if (this._inst == null)
            this._inst = new UIRoot();
        return this._inst;
    }

    private get root() {
        return director.getScene().getChildByName('Canvas');
    }

    public async showScene(scene: { new(): UIScene }, data: any = null) {
        if (this._curScene != null) {
            this._curScene.hide();
        }
        this._curScene = await this.showWindow(scene, data) as UIScene;
    }

    public async showWindow(win: { new(): UIComp }, data: any = null) {
        const pack = win['pack'];
        const url = win['url'];
        const key = pack + url;
        var view = this.cacheList.get(key);
        if (view == null) {
            var node = instantiate(await loader.loadSync(pack, url) as Prefab);
            var uiComp = node.getComponent(win);
            if (!uiComp)
                uiComp = node.addComponent(win);
            this.cacheList[key] = uiComp;
            view = uiComp as UIView;
            view.data = data;

        }
        view.node.parent = this.root;

        //新开启面板放最上面
        view.node.setSiblingIndex(this.root.children.length - 1)

        this.openList.push(view);

        this.adjustModalLayer();

        return view;
    }

    public hideWindow(view: UIView): void {
        view.hide();
    }
    public hideWindowImmediately(view: UIView, dispose: boolean = false): void {
        var index = this.openList.indexOf(view);
        if (index >= 0)
            this.openList.splice(index, 1);
        this.adjustModalLayer();
    }

    public get modalLayer(): Node {
        if (this._modalLayer == null)
            this.createModalLayer();

        return this._modalLayer;
    }

    private createModalLayer(): void {
        var rootTran = this.root.getComponent(UITransform);
        const viewWidth = rootTran.width;
        const viewHeight = rootTran.height;
        this._modalLayer = new Node('ModalLayer');
        this._modalLayer.addComponent(UITransform).setContentSize(rootTran.contentSize);
        const graphics = this.modalLayer.addComponent(Graphics);
        graphics.fillColor = Color.BLACK;
        graphics.fillRect(-viewWidth / 2, -viewHeight / 2, viewWidth, viewHeight);
        this._modalLayer.layer = Layers.Enum.UI_2D;
        this._modalLayer.addComponent(UIOpacity).opacity = 127;
        this.setBlockInput(true);
        this._modalLayer.parent = this.root;
        this._modalLayer.addComponent(Button);
    }
    /** 设置是否挡住触摸事件 */
    private _blocker: BlockInputEvents = null;
    public setBlockInput(block: boolean) {
        if (!this._blocker) {
            this._blocker = this.modalLayer.addComponent(BlockInputEvents);
        }
        this._blocker.node.active = block;
    }

    private adjustModalLayer(): void {
        if (this._modalLayer == null)
            this.createModalLayer();
        var canvas = this.root;
        var cnt = canvas.children.length;
        this._modalLayer.setSiblingIndex(cnt - 1);
        var btn = this._modalLayer.getComponent(Button);
        btn.node.targetOff(btn);

        for (let i: number = cnt - 1; i >= 0; i--) {
            var go = canvas.children[i];
            var name = go.name.replace("(Clone)", "");
            var win = go.getComponent(name) as UIView;
            if (win != null && win.isModal && go.activeInHierarchy) {
                var block = win.getComponent(BlockInputEvents);
                if(!block)
                    win.addComponent(BlockInputEvents);
                if (win.isClickVoidClose) {
                    btn.node.on(NodeEventType.TOUCH_END, () => {
                        win.hide();
                    });
                }
                this._modalLayer.active = true;
                this._modalLayer.setSiblingIndex(i);
                return;
            }
        }
        this._modalLayer.active = false;
    }
}