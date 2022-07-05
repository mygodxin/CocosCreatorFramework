import BaseWindow from "./base/BaseWindow";
import { Asset, director, instantiate, Node, Prefab, Scene } from "cc";
import { BaseScene } from "./base/BaseScene";

/** UI层级 */
export enum UILayer {
    scene,
    window,
    alert
}

class GameRoot {
    private curScene: BaseScene;
    init(root): void {

    }
    /**
     * 显示面板
     * @param view
     * @param param
     */
    showWindow(view: { new(): BaseWindow }, param?: any, layer = UILayer.window): void {
        if (!view) return;

        const _view = new (view as any)() as BaseWindow;
        this.root.addChild(_view);
        _view.openData = param;
        _view.show();
    }

    /**
     * 显示场景
     * @param scene 
     * @param param 
     * @param layer 
     */
    showScene(scene: { new(): BaseScene }, param?: any, layer = UILayer.scene): void {
        if (!scene) return;

        const _scene = new (scene as any)() as BaseScene;
        if (this.curScene === _scene) {
            _scene.openData = param;
            _scene.show();
        } else if (this.curScene === null) {
            this.root.addChild(_scene);
            _scene.openData = param;
            _scene.show();
        } else {
            this.curScene.hide();
            this.curScene = _scene;
            this.root.addChild(_scene);
            _scene.openData = param;
            _scene.show();
        }
    }

    private get root(): Scene {
        return director.getScene();
    }
}

/** 游戏主容器 */
export const gameRoot = new GameRoot();