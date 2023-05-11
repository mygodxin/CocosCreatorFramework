import { Button, NodeEventType, _decorator } from "cc";
import { UIRoot } from "../../core/ui/UIRoot";
import { UIScene } from "../../core/ui/UIScene";
import { BagWin } from "../window/BagWin";
import { UserWin } from "../window/UserWin";
import { LoadScene } from "./LoadScene";
const { ccclass, property } = _decorator;

/** 游戏场景 */
@ccclass
export class GameScene extends UIScene
{
    public static get pack(): string
    {
        return `resources`;
    }
    public static get url(): string
    {
        return `ui/scene/GameScene`;
    }
    private btnClose: Button;
    private btnBag: Button;
    private btnUser: Button;

    protected onInit(): void
    {
        console.log('game场景onInit');
        this.btnClose = this.node.getChildByName('btnClose').getComponent(Button);
        this.btnClose.node.on(NodeEventType.TOUCH_END, this.onClickClose, this);

        this.btnBag = this.node.getChildByName('btnBag').getComponent(Button);
        this.btnBag.node.on(NodeEventType.TOUCH_END, this.onClickBag, this);

        this.btnUser = this.node.getChildByName('btnUser').getComponent(Button);
        this.btnUser.node.on(NodeEventType.TOUCH_END, this.onClickUser, this);
    }

    protected onShow(): void
    {
        console.log('game场景onShow');
    }

    protected onHide(): void
    {
        console.log('game场景onHide');
    }

    private onClickClose(): void
    {
        UIRoot.inst.showScene(LoadScene);
    }

    private onClickBag(): void
    {
        UIRoot.inst.showWindow(BagWin);
    }

    private onClickUser(): void
    {
        UIRoot.inst.showWindow(UserWin);
    }
}