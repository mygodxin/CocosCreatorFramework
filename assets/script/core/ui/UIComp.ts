import { CCClass, Component, _decorator } from "cc";
const { ccclass, property } = _decorator;

/** 组件基类 */
@ccclass
export default class UIComp extends Component {
    public static path(): string {
        return '';
    }
    /** 组件数据 */
    public data: any;
    onLoad(): void {
        this.onInit();
    }

    onEnable(): void {
        this.onShow();
    }

    onDisable(): void {
        this.onHide();
    }

    /** 初始化 */
    protected onInit(): void {

    }

    /** 打开 */
    protected onShow(): void {

    }

    /** 关闭 */
    protected onHide(): void {

    }

    protected Hide(isDispose: boolean = false): void {
        if (isDispose) {
            this.node.destroy();
        } else
            this.node.removeFromParent();
    }
}