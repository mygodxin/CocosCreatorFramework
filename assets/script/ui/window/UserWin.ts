import { Button, NodeEventType } from "cc";
import BaseWindow from "../../core/base/BaseWindow";

/** 用户界面 */
export class UserWin extends BaseWindow {
    constructor() {
        super(`ui/window/UserWin`, 'resources');
    }
    private btnClose: Button;

    protected onInit(): void {
        console.log('UserWin界面onInit');
        this.btnClose = this.viewComponent.getChildByName('btnClose').getComponent(Button);
        this.btnClose.node.on(NodeEventType.TOUCH_END, this.onClickClose, this);
    }

    protected onShow(): void {
        console.log('UserWin界面onShow');
    }

    protected onHide(): void {
        console.log('UserWin界面onHide');
    }

    private onClickClose(): void {
        this.hide();
    }
}