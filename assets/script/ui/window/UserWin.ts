import { Button, NodeEventType } from "cc";
import UIView from "../../core/ui/UIView";

/** 用户界面 */
export class UserWin extends UIView
{
    public static get pack(): string
    {
        return `resources`;
    }
    public static get url(): string
    {
        return `ui/window/UserWin`;
    }
    private btnClose: Button;

    protected onInit(): void
    {
        console.log('UserWin界面onInit');
        this.btnClose = this.node.getChildByName('btnClose').getComponent(Button);
        this.btnClose.node.on(NodeEventType.TOUCH_END, this.onClickClose, this);
    }

    protected onShow(): void
    {
        console.log('UserWin界面onShow');
    }

    protected onHide(): void
    {
        console.log('UserWin界面onHide');
    }

    private onClickClose(): void
    {
        this.hide();
    }
}