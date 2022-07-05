import { sys } from "cc";
import { gameRoot } from "./GameRoot";

class GameApp {
    
    /** 启动 */
    launch(): void {
        this.enterLoading();
    }

    /** 进入Loading */
    private enterLoading(): void {
        gameRoot.showWindow
    }

    get platform() {
        return sys.platform
    }
}

/** 游戏总控 */
export const gameApp = new GameApp();