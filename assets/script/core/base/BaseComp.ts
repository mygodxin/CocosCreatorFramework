import { Component } from "cc";

/** 组件基类(警告：使用ccc生命周期函数onLoad onEnable onDisable请调用super) */
export default abstract class BaseComp extends Component {
    /** 包名 */
    protected static get pack(): string { return ''; }
    /** url */
    protected static get url(): string { return ''; }

    /** 是否展示模态框 */
    protected isModal: boolean = false;

    /** 打开面板传输的数据 */
    openData: any;

    /** 关闭 */
    hide(): void {
        this.node.destroy();
    }


    /** 是否显示 */
    get isShowing(): boolean {
        return this.node.parent != null;
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

    //适配
    protected onLoad(): void {
        this.onInit();
    }
    protected onEnable(): void {
        this.onShow();
    }
    protected onDisable(): void {
        this.onHide();
    }
}