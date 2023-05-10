import { Node } from "cc";
import UIComp from "./UIComp";
import { UIRoot } from "./UIRoot";

/** 面板基类 */
export default class UIView extends UIComp
{
    public static get pack(): string { return };
    public static get url(): string { return };
    /** 是否模态窗 */
    public isModal: boolean = true;
    /** 是否点击空白处关闭 */
    public isClickVoidClose: boolean = true;
    private _clickCloseLayer: Node;

    onEnable(): void
    {
        this.DoShowAnimation();
    }
    /** 面板打开动画 */
    protected DoShowAnimation(): void
    {
        this.onShow();
    }

    protected OnDisable(): void
    {
        this.onHide();
    }

    public hide(): void
    {
        if (this._clickCloseLayer != null)
            this._clickCloseLayer.removeFromParent();
        this.DoHideAnimation();
    }

    protected DoHideAnimation(): void
    {
        this.hideImmediately();
    }

    public hideImmediately(): void
    {
        this.Hide();
        UIRoot.inst.hideWindowImmediately(this);
    }
}