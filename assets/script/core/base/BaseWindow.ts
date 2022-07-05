import { BlockInputEvents, color, Graphics, Node, UIOpacity, UITransform, view } from "cc";
import { event } from "../../support/event/Event";
import BaseComp from "./BaseComp";

/** 弹窗基类 */
export default class BaseWindow extends BaseComp {
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
    /** modal透明度 */
    modalOpacity: number = 127;

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
            if (!this.modal) {
                const viewWidth = view.getVisibleSize().width;
                const viewHeight = view.getVisibleSize().height;
                this.modal = new Node;
                this.modal.addComponent(UITransform).setContentSize(view.getVisibleSize());
                const graphics = this.modal.addComponent(Graphics);
                graphics.fillColor = color(0, 0, 0, 127);
                graphics.fillRect(0, 0, viewWidth, viewHeight);
                // graphics.rect(0, 0, cc.view.getVisibleSize().width, cc.view.getVisibleSize().height);
                this.modal.addComponent(UIOpacity).opacity = 127;
                this.setBlockInput(true);
            }
            this.addChild(this.modal);
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