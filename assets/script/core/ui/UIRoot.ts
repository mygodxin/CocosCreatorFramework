import { BlockInputEvents, Button, Color, director, Event, Graphics, instantiate, Node, NodeEventType, Prefab, Scene, UITransform } from "cc";
import { loader } from "../../support/res/Loader";
import UIComp from "./UIComp";
import { UIScene } from "./UIScene";
import UIView from "./UIView";

/** UI层级 */
export enum UILayer
{
    scene,
    window,
    alert
}

export class UIRoot
{
    public readonly designWidth: number = 1280;
    public readonly designHeight: number = 720;
    public cacheList: Map<string, UIView>;

    /** 已打开节点列表 */
    public openList: UIView[];
    /** modal层 */
    private _modalLayer: Node;

    private static _inst: UIRoot = null;
    public static get inst(): UIRoot
    {
        if (this._inst == null)
            this._inst = new UIRoot();
        return this._inst;
    }

    private get root()
    {
        return director.getScene().getChildByName('Canvas');
    }

    public async showScene(scene: { new(): UIScene }, data: any = null)
    {

    }

    public async showWindow<T extends UIView>(win: { new(): UIComp }, data: any = null)
    {
        const pack = win['pack'];
        const url = win['url'];
        const key = pack + url;
        var view = this.cacheList.get(key);
        if (view == null)
        {
            var node = instantiate(await loader.loadSync(pack, url) as Prefab);
            var uiComp = node.getComponent(win);
            if (!uiComp)
                node.addComponent(win);
            this.cacheList[key] = node;

            view.data = data;

        }
        view.node.parent = this.root;

        //新开启面板放最上面
        view.node.setSiblingIndex(0)

        this.openList.push(view);

        this.adjustModalLayer();
    }

    public hideWindow(view: UIView): void
    {
        view.hide();
    }
    public hideWindowImmediately(view: UIView, dispose: boolean = false): void
    {
        var index = this.openList.indexOf(view);
        if (index >= 0)
            this.openList.splice(index, 1);
        this.adjustModalLayer();
    }

    public get modalLayer(): Node
    {
        if (this._modalLayer == null)
            this.createModalLayer();

        return this._modalLayer;
    }

    private createModalLayer(): void
    {
        var rootTran = this.root.getComponent(UITransform);
        const viewWidth = rootTran.width;
        const viewHeight = rootTran.height;
        this._modalLayer = new Node('ModalLayer');
        this._modalLayer.addComponent(UITransform).setContentSize(rootTran.contentSize);
        const graphics = this.modalLayer.addComponent(Graphics);
        graphics.fillColor = Color.RED;
        graphics.fillRect(-viewWidth, -viewHeight, viewWidth, viewHeight);
        // graphics.rect(0, 0, cc.view.getVisibleSize().width, cc.view.getVisibleSize().height);
        // this.modal.addComponent(UIOpacity).opacity = 127;
        this.setBlockInput(true);
        this._modalLayer.addComponent(Button);
    }
    /** 设置是否挡住触摸事件 */
    private _blocker: BlockInputEvents = null;
    public setBlockInput(block: boolean)
    {
        if (!this._blocker)
        {
            this._blocker = this.modalLayer.addComponent(BlockInputEvents);
        }
        this._blocker.node.active = block;
    }

    private adjustModalLayer(): void
    {
        if (this._modalLayer == null)
            this.createModalLayer();
        var canvas = this.root;
        var cnt = canvas.children.length;
        this._modalLayer.setSiblingIndex(cnt - 1);
        var btn = this._modalLayer.getComponent(Button);
        btn.node.targetOff(btn);

        for (let i: number = cnt - 1; i >= 0; i--)
        {
            var go = canvas.children[i];
            var name = go.name.replace("(Clone)", "");
            var win = this.cacheList.get(name);
            if (win != null && win.isModal && go.activeInHierarchy)
            {
                if (win.isClickVoidClose)
                {
                    btn.node.on(NodeEventType.TOUCH_END, () =>
                    {
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