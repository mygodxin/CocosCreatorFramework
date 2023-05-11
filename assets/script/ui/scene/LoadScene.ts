import { Button, NodeEventType, _decorator } from "cc";
import { UIRoot } from "../../core/ui/UIRoot";
import { UIScene } from "../../core/ui/UIScene";
import { GameScene } from "./GameScene";
const { ccclass, property } = _decorator;

/** 加载场景 */
@ccclass
export class LoadScene extends UIScene
{
    public static get pack(): string
    {
        return `resources`;
    }
    public static get url(): string
    {
        return `ui/scene/LoadScene`;
    }
    private btnClose: Button;

    protected onInit(): void
    {
        console.log('load场景onInit');
        this.btnClose = this.node.getChildByName('btnClose').getComponent(Button);
        this.btnClose.node.on(NodeEventType.TOUCH_END, this.onClickClose, this);
    }

    protected onShow(): void
    {
        console.log('load场景onShow');
    }

    protected onHide(): void
    {
        console.log('load场景onHide');
    }

    private onClickClose(): void
    {
        UIRoot.inst.showScene(GameScene);
    }
}