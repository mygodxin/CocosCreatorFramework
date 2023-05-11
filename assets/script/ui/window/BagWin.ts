import { Button, NodeEventType, _decorator } from "cc";
import UIView from "../../core/ui/UIView";
const { ccclass, property } = _decorator;

/** 背包界面 */
@ccclass
export class BagWin extends UIView
{
    public static get pack(): string
    {
        return `resources`;
    }
    public static get url(): string
    {
        return `ui/window/BagWin`;
    }
    private btnClose: Button;

    protected onInit(): void
    {
        console.log('BagWin界面onInit');
        this.btnClose = this.node.getChildByName('btnClose').getComponent(Button);
        this.btnClose.node.on(NodeEventType.TOUCH_END, this.onClickClose, this);

        // const graphics = this.viewComponent.getComponent(Graphics);
        // graphics.fillColor = Color.BLACK;
        // const viewWidth = view.getVisibleSize().width;
        // const viewHeight = view.getVisibleSize().height;
        // graphics.fillRect(-viewWidth, -viewHeight, viewWidth, viewHeight);
    }

    protected onShow(): void
    {
        console.log('BagWin界面onShow');
    }

    protected onHide(): void
    {
        console.log('BagWin界面onHide');
    }

    private onClickClose(): void
    {
        this.hide();
    }
}