import BaseWindow from "./base/BaseWindow";
import { Asset, director, instantiate, Node, Prefab, Scene } from "cc";

export enum UILayer {
    scene,
    window,
    alert
}

class GameRoot {
    /**
     * 显示面板
     * @param view prefab上绑定的脚本类
     * @param param Object可通过this.openData获取,Function则完成后调用
     */
    showWindow(view: BaseWindow, param?: any, layer = UILayer.window): void {
        if (!view) return;

        this.root.addChild(view);
        view.openData = param;
    }

    private get root(): Scene {
        return director.getScene();
    }
}

/** 游戏主容器 */
export const gameRoot = new GameRoot();