import { director, Node, Scene } from "cc";
import { BaseScene } from "./base/BaseScene";
import BaseWindow from "./base/BaseWindow";

/** UI层级 */
export enum UILayer {
    scene,
    window,
    alert
}

class Root {
    private layerList: Node[];
    private curScene: BaseScene;
    init(root): void {
        this.layerList = [];
        for (let key in UILayer) {
            const index = parseInt(key);
            if (!isNaN(index)) {
                const layer = new Node;
                // layer.setSize(this._root.width, this._root.height);
                // layer.addRelation(this._root, fgui.RelationType.Size);
                this.root.addChild(layer);
                this.layerList.push(layer);
            }
        }
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
        _view.init();
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
            _scene.init();
            _scene.openData = param;
        } else if (this.curScene == null) {
            this.curScene = _scene;
            this.root.addChild(_scene);
            _scene.init();
            _scene.openData = param;
        } else {
            this.curScene.hide();
            this.curScene = _scene;
            this.root.addChild(_scene);
            _scene.init();
            _scene.openData = param;
        }
    }

    private get root(): Scene {
        return director.getScene().getChildByName('Canvas');
    }
}

/** 游戏主容器 */
export const GRoot = new Root();