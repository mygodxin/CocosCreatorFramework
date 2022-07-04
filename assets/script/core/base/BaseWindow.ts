import { BlockInputEvents, Graphics, macro, Node } from "cc";
import { event } from "../../support/event/Event";
import BaseComp from "./BaseComp";

/** 弹窗基类 */
export default class BaseWindow extends BaseComp {
    get pack(): string { return; }
    get url(): string { return; }

    /** 打开动画 */
    showAnimation: string = '';
    /** 关闭动画 */
    hideAnimation: string = '';
    /** 当前场景是否唯一 */
    isOnly: boolean = false;
    /** 是否显示modal */
    isModal: boolean = true;
    private modal: Node;
    /** 是否点击modal关闭 */
    isClickModalHide: boolean;
    /** 是否点击穿透 */
    isClickThrough: boolean = false;

    /** 初始化 */
    protected onInit(): void {

    }

    /** 打开 */
    protected onShow(): void {

    }

    /** 关闭 */
    protected onHide(): void {

    }

    protected onEnable(): void {
        this.registerEvents();

        if (this.isModal) {
            // if (!this.modal) {
            //     this.modal = new Node;
            //     const graphics = this.modal.addComponent(Graphics);
            //     graphics.fillColor = cc.color(0, 0, 0, 127);
            //     graphics.fillRect(-GRoot.inst.width / 2, -GRoot.inst.height / 2, GRoot.inst.width, GRoot.inst.height)
            //     // graphics.rect(0, 0, cc.view.getVisibleSize().width, cc.view.getVisibleSize().height);
            //     this.modal.opacity = 127;
            //     this.modal.width = GRoot.inst.width//cc.view.getVisibleSize().width;
            //     this.modal.height = GRoot.inst.height//cc.view.getVisibleSize().height;
            //     this.modal.x = this.modal.width / 2;
            //     this.modal.y = -this.modal.height / 2;
            //     this.setBlockInput(true);
            // }
            // this.node.parent.addChild(this.modal);
        }
    }

    protected onDisable(): void {
        this.removeEvents();

        if (this.modal && this.modal.parent) {
            this.modal.removeFromParent();
        }
    }

    /** 设置是否挡住触摸事件 */
    private _blocker: BlockInputEvents = null;
    public setBlockInput(block: boolean) {
        if (!this._blocker) {
            let node = new Node('block_input_events');
            this._blocker = node.addComponent(BlockInputEvents);
            this.modal.addChild(this._blocker.node);
        }
        this._blocker.node.active = block;
    }

    //---------------------------事件部分-------------------------------/
    protected get eventList(): string[] {
        return [];
    }
    protected onEvent(eventName: string, param?: any) { };

    private registerEvents(): void {
        const len = this.eventList.length;
        for (let i = 0; i < len; i++) {
            event.on(this.eventList[i], this.onEvent, this);
        }
    }
    private removeEvents(): void {
        const len = this.eventList.length;
        for (let i = 0; i < len; i++) {
            event.off(this.eventList[i], this.onEvent, this);
        }
    }
}