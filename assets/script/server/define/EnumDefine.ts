/**服务器派发事件协议 */
export enum EventCode
{
/**强制退出游戏 */
    LogOut=0,
/**系统消息 */
    SystemMessage=1,
/**货币变化 <Currency> */
    CurrencyChanged=2,
/**卡片碎片变化 <CardNumber>（包括增加 减少）value 当前的数量 */
    CardDebrisChanged=3,
/**卡片增加  发送Card */
    AddCard=4,
/**领取关卡奖励 */
    GetMissionAward=5,
/**飞行宝箱刷新事件 */
    FeiXingBaoXiangRefesh=6,
/**成为终身会员 */
    VipChange=7,
/**月卡到期时间 */
    VipYueKa=8,
/**日赛季 */
    DaySeason=9,
/**周赛季 */
    WeekSeason=10,
/**月赛季 */
    MonthSeason=11,
/**提示客户端热更新 */
    HotFixClient=12,
/**广告次数变化 */
    AddWatchAD=13,
/**收到邮件 */
    Mail=14,
/**收到道具 */
    AddItem=15,
}

/********************************************************************/

/**请求协议 */
export enum RequestCode
{
/**网关握手 回复 加密通密匙   加密=[False]  是否回复=[True] */
    GateHandShake=0,
/**账号登陆   加密=[True]  是否回复=[True] */
    LoginAccount=1,
/**登陆游戏   加密=[False]  是否回复=[True] */
    LoginGame=2,
/**请求商城商品数据 成功回复<MarktData>   加密=[False]  是否回复=[True] */
    GetCommodity=3,
/**购买请求发送<BuyRequest> 失败回复 <BuyError>  成功 回复 <MarkData>,<Award>   加密=[False]  是否回复=[True] */
    Buy=4,
/**刷新动态区域商品 成功 回复  <MarkData>    加密=[False]  是否回复=[True] */
    RefeshDynamicCommodity=5,
/**卡牌进阶 发送卡牌<ushort>pid (长度2)  成功回复 1(ushort)pid   2<Card>  失败回复string   加密=[False]  是否回复=[True] */
    CardJinjie=6,
/**升级卡牌等级请求 发送1<ushort>pid 发送2生几级 int 成功回复<ushort>CurrentLevel    失败回复string   加密=[False]  是否回复=[True] */
    CardLevelup=7,
/**将卡牌上阵 发送卡牌<BattleCard>失败回复<string>   加密=[False]  是否回复=[True] */
    CardOnBattle=8,
/**将卡牌下阵 发送卡牌<BattleCard>(长度2) 失败回复<string>   加密=[False]  是否回复=[True] */
    CardOffBattle=9,
/**任务完成数量改变 ushort pid 发送 uint 增加数量 成功返回<uint> 新的数量 错误返回字符串    加密=[True]  是否回复=[True] */
    TaskCount=10,
/**获取任务奖励 pid  成功返回<Award>  错误返回<string>    加密=[False]  是否回复=[True] */
    GetTaskAward=11,
/**通关请求 不需要发送数据 成功返回通关后的奖励<Award>  失败<string>   加密=[True]  是否回复=[True] */
    MissionCommplate=12,
/**领取 离线挂机金币请求  发送<bool> 是否看广告，成共返回<int> 增加的金币 失败<string>   加密=[False]  是否回复=[True] */
    GetOutLineGold=13,
/**匹配竞技场玩家 不需要发送数据 成功回复<ArenaEnemy> 失败回复<string>   加密=[False]  是否回复=[True] */
    ArenaMatch=14,
/**竞技场战斗结束请求 发送<bool>（true 为胜利 false 为失败）, 统一回复 <ArenaScoreData> 竞技场的各种分数变化   加密=[False]  是否回复=[True] */
    ArenaMatchResult=15,
/**请求竞技场排行榜 成功回复<SList<ArenaRanking>>   加密=[False]  是否回复=[True] */
    ArenaRankings=16,
/**请求闯关排行榜 成功回复<SList<ArenaRanking>>   加密=[False]  是否回复=[True] */
    MissionRankings=17,
/**获取竞技场段位奖励 成功回复<Award> 失败回复<string>    加密=[False]  是否回复=[True] */
    GetArenaAward=18,
/**改名请求 成功失败恢复<string>   加密=[False]  是否回复=[True] */
    ChangeName=19,
/**更改竞技场卡牌配置(当前竞技场的上阵卡牌配置) 发送<int32> index 成功回复<int32> index 失败回复 string   加密=[False]  是否回复=[True] */
    ArenaCardSetChanged=20,
/**签到 发送<bool> 是否看广告 成功回复 <SignReponse> 失败string   加密=[False]  是否回复=[True] */
    SignIn=21,
/**杀死怪物   加密=[True]  是否回复=[True] */
    KillMonster=22,
/**使用盲盒币 成功返回 <Award>   加密=[False]  是否回复=[True] */
    SpendMangheBi=23,
/**领取多倍奖励发送(int32 Award.TempID)，成功返回<Award>,失败返回string   加密=[False]  是否回复=[True] */
    GetMultipleAward=24,
/**领取兑换码 发送string 输入的兑换码 成功回复<Award> 失败回复string   加密=[True]  是否回复=[True] */
    Duihuanma=25,
/**获取其他玩家的信息 发送<int> UserID 成功回复 GetUserInfo 失败回复string   加密=[False]  是否回复=[True] */
    GetUserInfo=26,
/**添加好友   加密=[False]  是否回复=[True] */
    AddFriend=27,
/**移除好友   加密=[False]  是否回复=[True] */
    RemoveFriend=28,
/**离开游戏   加密=[False]  是否回复=[True] */
    ExitGame=29,
/**升级神器  发送1 <ushort>pid  2<int>升几级 成功回复<ShenQi> 失败回复<string>   加密=[False]  是否回复=[True] */
    ShenQiLevelUp=30,
/**战斗卡牌变化  发送<BattleCardChanege>  回复成功或者失败   加密=[False]  是否回复=[True] */
    BattleCardChanege=31,
/**进入副本 发送ushort pid  失败 回复string   加密=[True]  是否回复=[True] */
    EnterFuben=32,
/**副本通关 发送ushort pid 成功回复Award  失败 回复string   加密=[True]  是否回复=[True] */
    FubenCommplate=33,
/**技能升级   加密=[False]  是否回复=[True] */
    SkillLevelUp=34,
/**锻造神器   加密=[False]  是否回复=[True] */
    ShenQiDuanZao=35,
/**升级天赋   加密=[False]  是否回复=[True] */
    TianfuLevelUp=36,
/**锻造装备 发送 EquipPos   加密=[False]  是否回复=[True] */
    EquipDuanZao=37,
/**合成装备 发送 uint id1  uint id2 uint id3 成功恢复Equip   加密=[False]  是否回复=[True] */
    EquipHeCheng=38,
/**发送ushort cardPid, uint equipID 成功无回复   加密=[False]  是否回复=[True] */
    TakeOnEquip=39,
/**发送ushort cardPid, EquipPos pos 成功无回复   加密=[False]  是否回复=[True] */
    TakeOffEquip=40,
/**发送次数<byte>, 0为免费抽1次   成功回复<Award> 失败回复<String>    加密=[False]  是否回复=[True] */
    ChouJiang=41,
/**抽奖奖励 成功回复<Award> 失败String   加密=[False]  是否回复=[True] */
    GetChouJiangAward=42,
/**领取关卡奖励   加密=[False]  是否回复=[True] */
    GetMissionAward=43,
/**关卡倒退 恢复倒退到的新关卡<uint>   加密=[False]  是否回复=[True] */
    MissionBack=44,
/**货币兑换 发送 花费货币<Currency>  目标货币<CurrencyType>    加密=[False]  是否回复=[True] */
    CurrencyExchange=45,
/**领取通行证奖励 发送<bool>Vip   加密=[False]  是否回复=[True] */
    GetTongXingZhengAward=46,
/**购买通行证   加密=[False]  是否回复=[True] */
    BuyTongXingZheng=47,
/**领取飞行宝箱   加密=[False]  是否回复=[True] */
    GetFeiXingBaoXiangAward=48,
/**购买3倍金币   加密=[False]  是否回复=[True] */
    JinBi3=49,
/**卡牌品质提升 发送ushrot PID   加密=[False]  是否回复=[True] */
    CardPinZhiLevelUp=50,
/**卡牌属性提升   加密=[False]  是否回复=[True] */
    CardPorpertyLevelUp=51,
/**广告观看请求 发送 1<WatchADReson> 2<String>参数   回复true 需要真实观看 回复false 扣除广告卷直接跳过    加密=[True]  是否回复=[True] */
    WatchAD=52,
/**重置卡牌等级   加密=[False]  是否回复=[True] */
    RestCardLevel=53,
/**领取每日月卡奖励   加密=[False]  是否回复=[True] */
    GetYueKaAward=54,
/**领取每日终身卡奖励   加密=[False]  是否回复=[True] */
    GetVipAward=55,
/**校验加速   加密=[True]  是否回复=[False] */
    UpdateSpeed=56,
/**重置神器 发送ushort 神器pid   加密=[False]  是否回复=[True] */
    RestShenQi=57,
/**重置神器 发送ushort Cardpid   加密=[False]  是否回复=[True] */
    RestSkill=58,
/**重置神器 发送 Tianfu   加密=[False]  是否回复=[True] */
    RestTinfu=59,
/**校验在战斗   加密=[True]  是否回复=[False] */
    CheckBattle=60,
/**取消重生   加密=[False]  是否回复=[True] */
    CancleMissionBack=61,
/**假装看广告   加密=[False]  是否回复=[True] */
    WatchADNotReal=62,
/**删除邮件,发送 SList<uint> id  回复成功 失败   加密=[False]  是否回复=[True] */
    DeleteMalil=63,
/**发送ID 无回复   加密=[False]  是否回复=[True] */
    ReadMail=64,
/**获取邮件奖励 成功回复Award 失败回复string   加密=[False]  是否回复=[True] */
    GetMailAward=65,
/**橙装强化   加密=[False]  是否回复=[True] */
    EquipUp=66,
/**请求测试专用 服务器非Dubug模式不管用   加密=[False]  是否回复=[True] */
    Test=255,
}

/********************************************************************/

/**系统消息 */
export enum SystemMessage
{
    None=0,
    请求数据出错=1,
    账号在别处登录=2,
    服务器重启请稍后登录=3,
    作弊嫌疑账号冻结请联系管理员=4,
}

/********************************************************************/

/**请求统一回复 */
export enum ReturnCode
{
    Filed=0,
    Scuess=1,
}

/********************************************************************/

/**货币种类 */
export enum CurrencyType
{
    金币=0,
    宝石=1,
    人民币=2,
    盲盒币=3,
    神器水晶=4,
    天赋药水=5,
    技能石=6,
    头盔碎片=7,
    盔甲碎片=8,
    项链碎片=9,
    武器碎片=10,
    通行证积分=11,
    免广告券=12,
}

/********************************************************************/

/**登录平台 */
export enum Platform
{
    Web=0,
    WeChat=1,
    IOS=2,
    Android=3,
    TapTap=4,
    Daxiang=5,
}

/********************************************************************/

/**商城购买失败回复 */
export enum BuyError
{
    None=0,
    货币不足=1,
    购买次数已达上限=2,
    未找到商品=3,
    今日光看广告次数已达上限=4,
    此商品不允许通过观看广告获得=5,
    此商品不允许你购买=6,
    此商品暂未上架=7,
    广告观看失败=8,
}

/********************************************************************/

export enum 兵种职业
{
    None=0,
    刺客=1,
    法师=2,
    游侠=3,
    坦克=4,
}

/********************************************************************/

/**商品位置 */
export enum CommodityPos
{
    每日精选区域1=0,
    每日精选区域2=1,
    每日精选区域3=2,
    每日精选区域4=3,
    每日精选区域5=4,
    每日精选区域6=5,
/**当枚举小于100的时候 表明以上区域是玩家的 动态商品区域（每个玩家看到的商品不一样） */
    兵种宝箱区域1=101,
    兵种宝箱区域2=102,
    兵种宝箱区域3=103,
    钻石区域1=151,
    钻石区域2=152,
    钻石区域3=153,
    宝石区域1=201,
}

/********************************************************************/

export enum 品质
{
    None=0,
    普通=1,
    稀有=2,
    史诗=3,
    传奇=4,
}

/********************************************************************/

export enum 攻击类型
{
    物理=0,
    魔法=1,
    穿刺=2,
}

/********************************************************************/

export enum 防御类型
{
    中甲=0,
    轻甲=1,
    重甲=2,
}

/********************************************************************/

export enum 竞技段位
{
    青铜五阶=0,
    青铜四阶=1,
    青铜三阶=2,
    青铜二阶=3,
    青铜一阶=4,
    白银五阶=5,
    白银四阶=6,
    白银三阶=7,
    白银二阶=8,
    白银一阶=9,
    黄金五阶=10,
    黄金四阶=11,
    黄金三阶=12,
    黄金二阶=13,
    黄金一阶=14,
    钻石五阶=15,
    钻石四阶=16,
    钻石三阶=17,
    钻石二阶=18,
    钻石一阶=19,
    皇冠五阶=20,
    皇冠四阶=21,
    皇冠三阶=22,
    皇冠二阶=23,
    皇冠一阶=24,
    王者=25,
}

/********************************************************************/

export enum 种族
{
    None=0,
    高山据点=1,
    魔法塔楼=2,
    平原城堡=3,
    森林壁垒=4,
    元素生物=5,
    地狱军团=6,
}

/********************************************************************/

export enum 天赋
{
    无畏冲锋=0,
    生命怒吼=1,
    生命虹吸=2,
    坚韧守护=3,
    毁灭打击=4,
    复仇欲望=5,
    迅捷专精=6,
    野蛮打击=7,
    血之狂热=8,
    狂战嗜血=9,
    坚韧不屈=10,
    原始力量=11,
    撕裂打击=12,
    逃命专家=13,
    多重穿透=14,
    自然之力=15,
    森林之血=16,
    鹰眼精通=17,
    狩猎印记=18,
    疾风破击=19,
    灵动之风=20,
    魔力增幅=21,
    魔法本源=22,
    魔力吸取=23,
    魔法抗性=24,
    精准施法=25,
    禁咒魔术=26,
    从容不迫=27,
    杀戮意志=28,
    恶魔血统=29,
    不死掠食=30,
    混乱之盾=31,
    遗忘意志=32,
    死亡缠绕=33,
    时空断裂=34,
    能量吐息=35,
    生命链接=36,
    烈焰之血=37,
    生生不息=38,
    元素领主=39,
    元素震爆=40,
    逃脱大师=41,
}

/********************************************************************/

export enum UserProeprtyType
{
    吸血=0,
    暴击=1,
    免伤=2,
    攻击速度=3,
    闪避=4,
    暴击伤害=5,
    攻击力=6,
    生命值=7,
    技能释放概率=8,
    金币产出=9,
    移动速度=10,
    攻击范围=11,
    攻击克制伤害增加=12,
    护甲被克制伤害减少=13,
    增益效果延长=14,
    减益效果缩短=15,
    对高山据点额外伤害=16,
    对魔法塔楼额外伤害=17,
    对平原城堡额外伤害=18,
    对森林壁垒额外伤害=19,
    对元素生物额外伤害=20,
    对地狱军团额外伤害=21,
    日常副本冷却时间减少=100,
    日常副本收益=101,
    升级金币消耗减少=102,
    盲盒币掉落=103,
    离线金币收益=104,
    战斗加速=105,
    离线闯关速度=106,
    重生关卡掉落增加=107,
    重生跳关概率=108,
    怪物属性减少=109,
    最大离线收益时间=110,
}

/********************************************************************/

export enum 副本类型
{
    日常副本=0,
    种族副本=1,
    征战讨伐=2,
}

/********************************************************************/

export enum BUFF
{
    流血=0,
    灼烧=1,
    眩晕=2,
    中毒=3,
    麻痹=4,
    恐惧=5,
    勇气=6,
    威慑=7,
    沉默=8,
    睡眠=9,
    隐身=10,
    腐蚀=11,
    庇护=12,
    机敏=13,
    护盾=14,
}

/********************************************************************/

export enum BUFFType
{
    BUFF=0,
    DEBUFF=1,
}

/********************************************************************/

export enum ValueType
{
    None=0,
    Time=1,
    Baifenbi=2,
}

/********************************************************************/

export enum ItemType
{
    Item=0,
    Equip=1,
    Consumption=2,
}

/********************************************************************/

export enum EquipPos
{
    头盔=0,
    武器=1,
    项链=2,
    盔甲=3,
}

/********************************************************************/

export enum TaskType
{
    日常任务=0,
    每周任务=1,
}

/********************************************************************/

export enum EntityType
{
    关卡小怪=0,
    关卡Boss=1,
    日常副本小怪=2,
    日常副本Boss=3,
    种族副本Boss=4,
    种族副本小怪=5,
    敌对玩家单位=6,
    玩家单位=7,
}

/********************************************************************/

export enum BattleType
{
    MissionBattle=0,
    Richangfuben=1,
    ZhongZuFuben=2,
    Jingjichang=3,
    ZhengZhanFuben=4,
    QieCuo=5,
}

/********************************************************************/

export enum ServerStatus
{
    关闭=0,
    流畅=1,
    拥挤=2,
    爆满=3,
    拒绝服务=4,
}

/********************************************************************/

export enum KNumber
{
    A=1,
    B=2,
    C=3,
    D=4,
    E=5,
    F=6,
    G=7,
    H=8,
    I=9,
    J=10,
    K=11,
    L=12,
    M=13,
    N=14,
    O=15,
    P=16,
    Q=17,
    R=18,
    S=19,
    T=20,
    U=21,
    V=22,
    W=23,
    X=24,
    Y=25,
    Z=26,
    a=27,
    b=28,
    c=29,
    d=30,
    e=31,
    f=32,
    g=33,
    h=34,
    i=35,
    j=36,
    k=37,
    l=38,
    m=39,
    n=40,
    o=41,
    p=42,
    q=43,
    r=44,
    s=45,
    t=46,
    u=47,
    v=48,
    w=49,
    x=50,
    y=51,
    z=52,
}

/********************************************************************/

