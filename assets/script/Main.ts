import { _decorator, Component, Node, AudioSource, game, assetManager, resources, instantiate, director, Prefab, ScrollView, Label } from 'cc';
import { GList } from './core/comp/GList';
import { audioMgr } from './manager/AudioManager';
import { timer } from './core/util/Timer';
import { UIRoot } from './core/ui/UIRoot';
import { LoadScene } from './ui/scene/LoadScene';
const { ccclass, property } = _decorator;

/** 游戏主入口 */
@ccclass
export class Main extends Component {
    private list: GList;
    @property(ScrollView)
    private scrollView: ScrollView;
    onLoad(): void {
        //初始化音频管理器
        const audioSource = this.node.getComponent(AudioSource);
        if (!audioSource) throw new Error('please add an AudioSource to the scene!');
        game.addPersistRootNode(this.node);
        audioMgr.init(audioSource);
        //初始化计时器
        timer.init();


        this.list = this.scrollView.getComponent(GList);

        // loader.load('resources/bg.png',(res)=>{
        //     console.log('cha')
        // })
        // resources.load('bg',(err,res)=>{
        //     console.log('下载结果',err,res);
        // });
        // resources.load('Test',(err,res)=>{
        //     const node = instantiate(res as Prefab);
        //     director.getScene().getChildByName('Canvas').addChild(node);
        // })
    }

    start(): void
    {
        // UIRoot.inst.showScene(LoadScene);
        //游戏启动
        // gameApp.launch();
        this.list.itemRenderer = this.onItemRenderer.bind(this);
        this.list.setVirtual();
        this.list.numItems = 50;
    }

    private onItemRenderer(index: number, obj: Node) {
        console.log('查看', index, obj)
        obj.getChildByName('txtIndex').getComponent(Label).string = index + '';
    }
}

