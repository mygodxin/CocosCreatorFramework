import { Button, NodeEventType } from "cc";
import { BaseScene } from "../../core/base/BaseScene";
import { GRoot } from "../../core/GRoot";
import { BagWin } from "../window/BagWin";
import { UserWin } from "../window/UserWin";
import { LoadScene } from "./LoadScene";

/** 游戏场景 */
export class GameScene extends BaseScene {
    constructor() {
        super(`ui/scene/GameScene`, 'resources');
    }
    private btnClose: Button;
    private btnBag: Button;
    private btnUser: Button;

    protected onInit(): void {
        console.log('game场景onInit');
        this.btnClose = this.viewComponent.getChildByName('btnClose').getComponent(Button);
        this.btnClose.node.on(NodeEventType.TOUCH_END, this.onClickClose, this);

        this.btnBag = this.viewComponent.getChildByName('btnBag').getComponent(Button);
        this.btnBag.node.on(NodeEventType.TOUCH_END, this.onClickBag, this);

        this.btnUser = this.viewComponent.getChildByName('btnUser').getComponent(Button);
        this.btnUser.node.on(NodeEventType.TOUCH_END, this.onClickUser, this);
    }

    protected onShow(): void {
        console.log('game场景onShow');
    }

    protected onHide(): void {
        console.log('game场景onHide');
    }

    private onClickClose(): void {
        GRoot.showScene(LoadScene);
    }

    private onClickBag(): void {
        GRoot.showWindow(BagWin);
    }

    private onClickUser(): void {
        GRoot.showWindow(UserWin);
    }
}