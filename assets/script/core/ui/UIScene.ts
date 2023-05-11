import { _decorator } from "cc";
import UIView from "./UIView";
const { ccclass, property } = _decorator;

/** 场景基类 */
@ccclass
export class UIScene extends UIView {
    onLoad(): void {
        this.isModal = false;
        this.onInit();
    }
}