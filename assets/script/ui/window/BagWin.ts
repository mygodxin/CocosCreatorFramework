import { Button, Color, Graphics, NodeEventType, view } from "cc";
import BaseWindow from "../../core/base/BaseWindow";

/** 背包界面 */
export class BagWin extends BaseWindow {
    constructor() {
        super(`ui/window/BagWin`, 'resources');
    }
    private btnClose: Button;

    protected onInit(): void {
        console.log('BagWin界面onInit');
        this.btnClose = this.viewComponent.getChildByName('btnClose').getComponent(Button);
        this.btnClose.node.on(NodeEventType.TOUCH_END, this.onClickClose, this);

        // const graphics = this.viewComponent.getComponent(Graphics);
        // graphics.fillColor = Color.BLACK;
        // const viewWidth = view.getVisibleSize().width;
        // const viewHeight = view.getVisibleSize().height;
        // graphics.fillRect(-viewWidth, -viewHeight, viewWidth, viewHeight);
    }

    protected onShow(): void {
        console.log('BagWin界面onShow');
    }

    protected onHide(): void {
        console.log('BagWin界面onHide');
    }

    private onClickClose(): void {
        this.hide();
    }
}