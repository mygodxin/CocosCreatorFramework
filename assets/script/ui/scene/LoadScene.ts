import { Button, Label, NodeEventType, Sprite } from "cc";
import { BaseScene } from "../../core/base/BaseScene";
import { gameRoot } from "../../core/GameRoot";
import { GameScene } from "./GameScene";

/** 加载场景 */
export class LoadScene extends BaseScene {
    constructor() {
        super(`ui/scene/LoadScene`,'resources');
    }
    private btnClose: Button;

    protected onInit(): void {
        this.btnClose = this.viewComponent.getChildByName('btnClose').getComponent(Button);
        this.btnClose.node.on(NodeEventType.TOUCH_END, this.onClickClose, this);
    }

    protected onShow(): void {

    }

    protected onHide(): void {

    }

    private onClickClose(): void {
        gameRoot.showScene(GameScene);
    }
}