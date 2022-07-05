import { Button, NodeEventType } from "cc";
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