import { _decorator, Component, Node, AudioSource, game } from 'cc';
import { gameApp } from './core/GameApp';
import { audioMgr } from './manager/AudioManager';
import { timer } from './support/util/Timer';
const { ccclass, property } = _decorator;

/** 游戏主入口 */
@ccclass('Main')
export class Main extends Component {
    onLoad(): void {
        // //初始化音频管理器
        // const audioSource = this.node.getComponent(AudioSource);
        // if (!audioSource) throw new Error('please add an AudioSource to the scene!');
        // game.addPersistRootNode(this.node);
        // audioMgr.init(audioSource);
        // //初始化计时器
        // timer.init();
    }

    start(): void {
        //游戏启动
        // gameApp.launch();
    }
}

