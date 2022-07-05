import { sys } from "cc";
import { LoadScene } from "../ui/scene/LoadScene";
import { gameRoot } from "./GameRoot";

class GameApp {

    /** 启动 */
    launch(): void {
        this.enterLoading();
    }

    /** 进入Loading */
    private enterLoading(): void {
        gameRoot.showScene(LoadScene);
    }

    get platform() {
        return sys.platform
    }
}

/** 游戏总控 */
export const gameApp = new GameApp();