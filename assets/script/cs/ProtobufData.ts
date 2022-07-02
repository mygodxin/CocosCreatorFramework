import { IProtocolSerializable, BufferWriter, BufferReader, UTF8Length, SDictionary, SList, SHashSet, IntedSerType, SerializableType } from "./ProtocolCommon";
import { CurrencyType, Platform, CommodityPos, 品质, 攻击类型, 防御类型, 竞技段位, 种族, 兵种职业, 副本类型, BUFF, BUFFType, ValueType, UserProeprtyType, 天赋, EquipPos, EntityType, TaskType, BattleType, RequestCode, ServerStatus } from "./EnumDefine";

export class FubenSetting implements IProtocolSerializable
{
    cardPos: SDictionary<number, Pos>;

    Serialize(stream: BufferWriter): void
    {
        stream.writeSerializable(this.cardPos);
    }
    Deserialize(stream: BufferReader): void
    {
        this.cardPos = stream.readSerializable(SDictionary,SerializableType.UInt16, SerializableType.Serializable,Pos);
    }
}

export class UserSetting implements IProtocolSerializable
{
    public soundOn: boolean = true;
    public musicOn: boolean = true;
    public fubenDatas: SDictionary<number, FubenSetting>;
    public newPlayer: boolean = true;
    public autoMissionBack: boolean = false;
    public battleEffect: boolean = true;
    BufferLength(): number
    {
        return 1;
    }
    Serialize(stream: BufferWriter): void
    {
        stream.writeBoolean(this.soundOn);
        stream.writeBoolean(this.musicOn);
        stream.writeSerializable(this.fubenDatas);
        stream.writeBoolean(this.newPlayer);
        stream.writeBoolean(this.autoMissionBack);
        stream.writeBoolean(this.battleEffect);
    }
    Deserialize(stream: BufferReader): void
    {
        this.soundOn = stream.readBoolean();
        this.musicOn = stream.readBoolean();
        this.fubenDatas = stream.readSerializable( SDictionary,SerializableType.UInt16, SerializableType.Serializable, FubenSetting);
        this.newPlayer = stream.readBoolean();
        this.autoMissionBack = stream.isReadToEnd ? false : stream.readBoolean();
        this.battleEffect = stream.isReadToEnd ? true : stream.readBoolean();
    }

}
//**********************************AutoProtocol************************************
/***************************************************************************************************************************************/
export class AMoldeDataBase  implements IProtocolSerializable
{
    /**注释：数据PID    类型：UInt16  长度：2  */
    Pid:number;
    /**注释：数据的解释 一般为UI界面为玩家的解释   类型：String   */
    Explain:string;
    /**注释：数据的名称    类型：String   */
    Name:string;
    /**注释：数据指向的美术资源ID    类型：UInt16  长度：2  */
    TextureID:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt16(this.Pid);
       stream.writeString(this.Explain);
       stream.writeString(this.Name);
       stream.writeUInt16(this.TextureID);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Pid=stream.readUInt16();
       this.Explain=stream.readString();
       this.Name=stream.readString();
       this.TextureID=stream.readUInt16();
    }

}


/***************************************************************************************************************************************/
/**卡片的战斗属性*/
export class CardBattleProperty  implements IProtocolSerializable
{
    /**注释：攻击系数   类型：Single  长度：4  */
    Attack:number;
    /**注释：生命值系数   类型：Single  长度：4  */
    Health:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSingle(this.Attack);
       stream.writeSingle(this.Health);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Attack=stream.readSingle();
       this.Health=stream.readSingle();
    }

}


/***************************************************************************************************************************************/
export class CardModle  extends AMoldeDataBase implements IProtocolSerializable
{
    兵种职业:兵种职业;
    攻击类型:攻击类型;
    防御类型:防御类型;
    品质:品质;
    种族:种族;
    攻击速度:number;
    攻击范围:number;
    移动速度:number;
    /**注释：基础属性   */
    BaseProperty:CardBattleProperty;
    /**注释：品质属性升级数值   */
    PinZhiProperty:SDictionary<品质,CardBattleProperty>;
    /**注释：携带的技能   */
    Skills:SList<number>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.兵种职业);
       stream.writeByte(this.攻击类型);
       stream.writeByte(this.防御类型);
       stream.writeByte(this.品质);
       stream.writeByte(this.种族);
       stream.writeSingle(this.攻击速度);
       stream.writeSingle(this.攻击范围);
       stream.writeSingle(this.移动速度);
       stream.writeSerializable(this.BaseProperty);
       stream.writeSerializable(this.PinZhiProperty);
       stream.writeSerializable(this.Skills);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.兵种职业=stream.readByte();
       this.攻击类型=stream.readByte();
       this.防御类型=stream.readByte();
       this.品质=stream.readByte();
       this.种族=stream.readByte();
       this.攻击速度=stream.readSingle();
       this.攻击范围=stream.readSingle();
       this.移动速度=stream.readSingle();
       this.BaseProperty=stream.readSerializable(CardBattleProperty);
       this.PinZhiProperty=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Serializable,CardBattleProperty);
       this.Skills=stream.readSerializable(SList,SerializableType.UInt16);
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
export class TaskModle  extends AMoldeDataBase implements IProtocolSerializable
{
    Currencies:SList<Currency>;
    TaskType:TaskType;
    CompalteCount:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Currencies);
       stream.writeByte(this.TaskType);
       stream.writeUInt32(this.CompalteCount);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Currencies=stream.readSerializable(SList,SerializableType.Serializable,Currency);
       this.TaskType=stream.readByte();
       this.CompalteCount=stream.readUInt32();
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
export class LevelUpNumber  implements IProtocolSerializable
{
    Type:ValueType;
    BaseNumber:number;
    UpNumber:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.Type);
       stream.writeSingle(this.BaseNumber);
       stream.writeSingle(this.UpNumber);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Type=stream.readByte();
       this.BaseNumber=stream.readSingle();
       this.UpNumber=stream.readSingle();
    }

}


/***************************************************************************************************************************************/
export class BuffModle  extends AMoldeDataBase implements IProtocolSerializable
{
    BUFF:BUFF;
    Type:BUFFType;
    Animation:string;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.BUFF);
       stream.writeByte(this.Type);
       stream.writeString(this.Animation);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.BUFF=stream.readByte();
       this.Type=stream.readByte();
       this.Animation=stream.readString();
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
export class SkillBuff  implements IProtocolSerializable
{
    BUFFType:BUFF;
    Duration:LevelUpNumber;
    Value:SList<LevelUpNumber>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.BUFFType);
       stream.writeSerializable(this.Duration);
       stream.writeSerializable(this.Value);
    }
    Deserialize(stream: BufferReader): void
    {
       this.BUFFType=stream.readByte();
       this.Duration=stream.readSerializable(LevelUpNumber);
       this.Value=stream.readSerializable(SList,SerializableType.Serializable,LevelUpNumber);
    }

}


/***************************************************************************************************************************************/
export class SkillModle  extends AMoldeDataBase implements IProtocolSerializable
{
    /**注释：触发概率   类型：Single  长度：4  */
    GaiLv:number;
    /**注释：技能权重值   类型：Int32  长度：4  */
    Weight:number;
    /**注释：技能数据   */
    Numbers:SList<LevelUpNumber>;
    SkillBuffs:SList<SkillBuff>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSingle(this.GaiLv);
       stream.writeInt32(this.Weight);
       stream.writeSerializable(this.Numbers);
       stream.writeSerializable(this.SkillBuffs);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.GaiLv=stream.readSingle();
       this.Weight=stream.readInt32();
       this.Numbers=stream.readSerializable(SList,SerializableType.Serializable,LevelUpNumber);
       this.SkillBuffs=stream.readSerializable(SList,SerializableType.Serializable,SkillBuff);
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
export class TianfuModle  extends AMoldeDataBase implements IProtocolSerializable
{
    Tianfu:天赋;
    Target:种族;
    Tiaojian:SDictionary<天赋,number>;
    ProeprtyType:UserProeprtyType;
    PropertyNumber:LevelUpNumber;
    Cast:LevelUpNumber;
    CengJi:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.Tianfu);
       stream.writeByte(this.Target);
       stream.writeSerializable(this.Tiaojian);
       stream.writeByte(this.ProeprtyType);
       stream.writeSerializable(this.PropertyNumber);
       stream.writeSerializable(this.Cast);
       stream.writeByte(this.CengJi);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Tianfu=stream.readByte();
       this.Target=stream.readByte();
       this.Tiaojian=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.UInt16);
       this.ProeprtyType=stream.readByte();
       this.PropertyNumber=stream.readSerializable(LevelUpNumber);
       this.Cast=stream.readSerializable(LevelUpNumber);
       this.CengJi=stream.readByte();
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
export class EquipModle  extends AMoldeDataBase implements IProtocolSerializable
{
    Propertise:SDictionary<UserProeprtyType,number>;
    Pinzhi:品质;
    Limit:兵种职业;
    PropertyCount:number;
    Pos:EquipPos;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Propertise);
       stream.writeByte(this.Pinzhi);
       stream.writeByte(this.Limit);
       stream.writeByte(this.PropertyCount);
       stream.writeByte(this.Pos);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Propertise=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Single);
       this.Pinzhi=stream.readByte();
       this.Limit=stream.readByte();
       this.PropertyCount=stream.readByte();
       this.Pos=stream.readByte();
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
export class MyRank  implements IProtocolSerializable
{
    Score:number;
    Rank:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.Score);
       stream.writeUInt32(this.Rank);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Score=stream.readUInt32();
       this.Rank=stream.readUInt32();
    }

}


/***************************************************************************************************************************************/
export class UserRanking  implements IProtocolSerializable
{
    /**注释：玩家的ID(数据库唯一标识 如果为0 表明是机器人 )   类型：UInt32  长度：4  */
    ID:number;
    /**注释：分数   类型：UInt32  长度：4  */
    Score:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.ID);
       stream.writeUInt32(this.Score);
    }
    Deserialize(stream: BufferReader): void
    {
       this.ID=stream.readUInt32();
       this.Score=stream.readUInt32();
    }

}


/***************************************************************************************************************************************/
export class UserArena  implements IProtocolSerializable
{
    /**注释：竞技场段位等级   类型：UInt32  长度：4  */
    ArenaScore:number;
    /**注释：历史最高分数   类型：UInt32  长度：4  */
    HightestScore:number;
    /**注释：竞技场总场次   类型：UInt32  长度：4  */
    ArenaMatchCount:number;
    /**注释：竞技场胜利场次   类型：UInt32  长度：4  */
    ArenaMatchWinCount:number;
    /**注释：竞技场失败场次   类型：UInt32  长度：4  */
    ArenaMatchFiledCount:number;
    /**注释：最高连胜   类型：UInt32  长度：4  */
    ArenaWinStreakHightest:number;
    /**注释：当前连胜   类型：UInt32  长度：4  */
    ArenaWinStreakCurrent:number;
    /**注释：领取的奖励次数   类型：UInt16  长度：2  */
    AwardIndex:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.ArenaScore);
       stream.writeUInt32(this.HightestScore);
       stream.writeUInt32(this.ArenaMatchCount);
       stream.writeUInt32(this.ArenaMatchWinCount);
       stream.writeUInt32(this.ArenaMatchFiledCount);
       stream.writeUInt32(this.ArenaWinStreakHightest);
       stream.writeUInt32(this.ArenaWinStreakCurrent);
       stream.writeUInt16(this.AwardIndex);
    }
    Deserialize(stream: BufferReader): void
    {
       this.ArenaScore=stream.readUInt32();
       this.HightestScore=stream.readUInt32();
       this.ArenaMatchCount=stream.readUInt32();
       this.ArenaMatchWinCount=stream.readUInt32();
       this.ArenaMatchFiledCount=stream.readUInt32();
       this.ArenaWinStreakHightest=stream.readUInt32();
       this.ArenaWinStreakCurrent=stream.readUInt32();
       this.AwardIndex=stream.readUInt16();
    }

}


/***************************************************************************************************************************************/
/**竞技场卡牌操作请求*/
export class ChangeArenaCrad  implements IProtocolSerializable
{
    /**注释：操作的那组卡牌（下标）   类型：Int32  长度：4  */
    ArrayIndex:number;
    /**注释：卡牌PID   类型：UInt16  长度：2  */
    CardPid:number;
    /**注释：上阵卡牌还是下阵卡牌   类型：Boolean  长度：1  */
    Up:boolean;
    Serialize(stream: BufferWriter): void
    {
       stream.writeInt32(this.ArrayIndex);
       stream.writeUInt16(this.CardPid);
       stream.writeBoolean(this.Up);
    }
    Deserialize(stream: BufferReader): void
    {
       this.ArrayIndex=stream.readInt32();
       this.CardPid=stream.readUInt16();
       this.Up=stream.readBoolean();
    }

}


/***************************************************************************************************************************************/
export class BattleCheck  implements IProtocolSerializable
{
    Cards:SList<Card>;
    Speed:number;
    BattleType:BattleType;
    UserProperty:UserProperty;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Cards);
       stream.writeSingle(this.Speed);
       stream.writeByte(this.BattleType);
       stream.writeSerializable(this.UserProperty);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Cards=stream.readSerializable(SList,SerializableType.Serializable,Card);
       this.Speed=stream.readSingle();
       this.BattleType=stream.readByte();
       this.UserProperty=stream.readSerializable(UserProperty);
    }

}


/***************************************************************************************************************************************/
/**未知卡牌碎片*/
export class UnknowSuipian  implements IProtocolSerializable
{
    PinZhi:品质;
    Count:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.PinZhi);
       stream.writeUInt16(this.Count);
    }
    Deserialize(stream: BufferReader): void
    {
       this.PinZhi=stream.readByte();
       this.Count=stream.readUInt16();
    }

}


/***************************************************************************************************************************************/
export class ArenaAward  implements IProtocolSerializable
{
    /**注释：奖励的货币   */
    Currency:Currency;
    /**注释：奖励的碎片 RandomCard.Pid 为品质 RandomCard.Value为数量    */
    RandomCard:CardValue;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Currency);
       stream.writeSerializable(this.RandomCard);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Currency=stream.readSerializable(Currency);
       this.RandomCard=stream.readSerializable(CardValue);
    }

}


/***************************************************************************************************************************************/
export class ArenaData  implements IProtocolSerializable
{
    /**注释：最小分数   类型：UInt32  长度：4  */
    ScoreMin:number;
    /**注释：最大分数   类型：UInt32  长度：4  */
    ScoreMax:number;
    /**注释：段位   类型：System.Byte  长度：1  */
    Level:竞技段位;
    /**注释：胜利分数   类型：UInt32  长度：4  */
    WinScore:number;
    /**注释：失败分数   类型：UInt32  长度：4  */
    FailedScore:number;
    /**注释：机器人卡牌的最大等级   类型：UInt32  长度：4  */
    MaxCradLevel:number;
    /**注释：机器人卡牌的最小等级   类型：UInt32  长度：4  */
    MinCardLevel:number;
    /**注释：机器人卡牌的最大品质   类型：System.Byte  长度：1  */
    MaxPinzhi:品质;
    /**注释：机器人卡牌的最小品质   类型：System.Byte  长度：1  */
    MinPinzhi:品质;
    /**注释：机器人卡牌的最小星级   类型：Byte  长度：1  */
    MinXingJI:number;
    /**注释：机器人卡牌的最大星级   类型：Byte  长度：1  */
    MaxXingJi:number;
    /**注释：机器人的最大胜率   类型：Single  长度：4  */
    MaxShenglv:number;
    /**注释：机器人的最小胜率   类型：Single  长度：4  */
    MinShenglv:number;
    /**注释：当前等级最大上阵卡牌数量   类型：UInt32  长度：4  */
    MaxCardCount:number;
    /**注释：竞技场段位对应图片ID(地图 及UI表现的一些图片)   类型：UInt32  长度：4  */
    TextureID:number;
    Award:SList<ArenaAward>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.ScoreMin);
       stream.writeUInt32(this.ScoreMax);
       stream.writeByte(this.Level);
       stream.writeUInt32(this.WinScore);
       stream.writeUInt32(this.FailedScore);
       stream.writeUInt32(this.MaxCradLevel);
       stream.writeUInt32(this.MinCardLevel);
       stream.writeByte(this.MaxPinzhi);
       stream.writeByte(this.MinPinzhi);
       stream.writeByte(this.MinXingJI);
       stream.writeByte(this.MaxXingJi);
       stream.writeSingle(this.MaxShenglv);
       stream.writeSingle(this.MinShenglv);
       stream.writeUInt32(this.MaxCardCount);
       stream.writeUInt32(this.TextureID);
       stream.writeSerializable(this.Award);
    }
    Deserialize(stream: BufferReader): void
    {
       this.ScoreMin=stream.readUInt32();
       this.ScoreMax=stream.readUInt32();
       this.Level=stream.readByte();
       this.WinScore=stream.readUInt32();
       this.FailedScore=stream.readUInt32();
       this.MaxCradLevel=stream.readUInt32();
       this.MinCardLevel=stream.readUInt32();
       this.MaxPinzhi=stream.readByte();
       this.MinPinzhi=stream.readByte();
       this.MinXingJI=stream.readByte();
       this.MaxXingJi=stream.readByte();
       this.MaxShenglv=stream.readSingle();
       this.MinShenglv=stream.readSingle();
       this.MaxCardCount=stream.readUInt32();
       this.TextureID=stream.readUInt32();
       this.Award=stream.readSerializable(SList,SerializableType.Serializable,ArenaAward);
    }

}


/***************************************************************************************************************************************/
export class ArenaConfig  implements IProtocolSerializable
{
    /**注释：竞技等级对应数据   */
    ArenaDatas:SDictionary<竞技段位,ArenaData>;
    /**注释：最小的竞技场排行榜上榜分数   类型：UInt32  长度：4  */
    最小竞技场排行榜上榜分数:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.ArenaDatas);
       stream.writeUInt32(this.最小竞技场排行榜上榜分数);
    }
    Deserialize(stream: BufferReader): void
    {
       this.ArenaDatas=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Serializable,ArenaData);
       this.最小竞技场排行榜上榜分数=stream.readUInt32();
    }

}


/***************************************************************************************************************************************/
export class BattleCardChange  implements IProtocolSerializable
{
    Pos:Pos;
    Pid:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Pos);
       stream.writeUInt16(this.Pid);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Pos=stream.readSerializable(Pos);
       this.Pid=stream.readUInt16();
    }

}


/***************************************************************************************************************************************/
export class ShenQiModle  extends AMoldeDataBase implements IProtocolSerializable
{
    品质:品质;
    PropertyType:UserProeprtyType;
    Target:string;
    Value:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.品质);
       stream.writeByte(this.PropertyType);
       stream.writeString(this.Target);
       stream.writeSingle(this.Value);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.品质=stream.readByte();
       this.PropertyType=stream.readByte();
       this.Target=stream.readString();
       this.Value=stream.readSingle();
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
export class ShenQi  implements IProtocolSerializable
{
    Pid:number;
    Level:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt16(this.Pid);
       stream.writeUInt16(this.Level);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Pid=stream.readUInt16();
       this.Level=stream.readUInt16();
    }

}


/***************************************************************************************************************************************/
export class Pos  implements IProtocolSerializable
{
    X:number;
    Y:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.X);
       stream.writeByte(this.Y);
    }
    Deserialize(stream: BufferReader): void
    {
       this.X=stream.readByte();
       this.Y=stream.readByte();
    }

}


/***************************************************************************************************************************************/
export class Card  implements IProtocolSerializable
{
    Pid:number;
    Jinjie:number;
    Level:number;
    PinZhiPlus:number;
    /**注释：奇数是+攻击 偶数是+血量   类型：Byte  长度：1  */
    PropertyLevelUp:number;
    Pos:Pos;
    /**注释：技能等级   */
    SkillLevel:SDictionary<number,number>;
    /**注释：装备   */
    Equips:SDictionary<EquipPos,Equip>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt16(this.Pid);
       stream.writeByte(this.Jinjie);
       stream.writeUInt16(this.Level);
       stream.writeByte(this.PinZhiPlus);
       stream.writeByte(this.PropertyLevelUp);
       stream.writeSerializable(this.Pos);
       stream.writeSerializable(this.SkillLevel);
       stream.writeSerializable(this.Equips);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Pid=stream.readUInt16();
       this.Jinjie=stream.readByte();
       this.Level=stream.readUInt16();
       this.PinZhiPlus=stream.readByte();
       this.PropertyLevelUp=stream.readByte();
       this.Pos=stream.readSerializable(Pos);
       this.SkillLevel=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Byte);
       this.Equips=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Serializable,Equip);
    }

}


/***************************************************************************************************************************************/
export class Tianfu  implements IProtocolSerializable
{
    TinfuType:天赋;
    Level:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.TinfuType);
       stream.writeUInt16(this.Level);
    }
    Deserialize(stream: BufferReader): void
    {
       this.TinfuType=stream.readByte();
       this.Level=stream.readUInt16();
    }

}


/***************************************************************************************************************************************/
/**卡牌数据变化*/
export class CardValue  implements IProtocolSerializable
{
    /**注释：卡片的PID   类型：UInt16  长度：2  */
    Pid:number;
    Value:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt16(this.Pid);
       stream.writeInt32(this.Value);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Pid=stream.readUInt16();
       this.Value=stream.readInt32();
    }

}


/***************************************************************************************************************************************/
/**卡牌进阶数据*/
export class CardJinJieData  implements IProtocolSerializable
{
    /**注释：升级的货币消耗   */
    Currency:Currency;
    /**注释：升级的碎片消耗   类型：Int32  长度：4  */
    Debris:number;
    /**注释：品质最大等级限制   */
    MaxLevel:SDictionary<品质,number>;
    /**注释：品质升级概率   类型：Single  长度：4  */
    EquipUpGaiLv:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Currency);
       stream.writeInt32(this.Debris);
       stream.writeSerializable(this.MaxLevel);
       stream.writeSingle(this.EquipUpGaiLv);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Currency=stream.readSerializable(Currency);
       this.Debris=stream.readInt32();
       this.MaxLevel=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.UInt32);
       this.EquipUpGaiLv=stream.readSingle();
    }

}


/***************************************************************************************************************************************/
export class JiBanProperty  implements IProtocolSerializable
{
    PropertyType:UserProeprtyType;
    PropertyValues:SList<number>;
    ShanZhenShuLiang:SList<number>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.PropertyType);
       stream.writeSerializable(this.PropertyValues);
       stream.writeSerializable(this.ShanZhenShuLiang);
    }
    Deserialize(stream: BufferReader): void
    {
       this.PropertyType=stream.readByte();
       this.PropertyValues=stream.readSerializable(SList,SerializableType.Single);
       this.ShanZhenShuLiang=stream.readSerializable(SList,SerializableType.Byte);
    }

}


/***************************************************************************************************************************************/
/**卡片配置文件*/
export class CardConfig  implements IProtocolSerializable
{
    卡牌最大进阶:number;
    属性增长系数:number;
    神器最大等级:number;
    技能最大等级:number;
    普通神器几率:number;
    稀有神器几率:number;
    史诗神器几率:number;
    传奇神器几率:number;
    神器消耗底数:number;
    天赋最大等级:number;
    普通装备几率:number;
    稀有装备几率:number;
    史诗装备几率:number;
    传奇装备几率:number;
    装备打造消耗:number;
    普通装备合成概率:number;
    稀有装备合成概率:number;
    史诗装备合成概率:number;
    传奇装备合成概率:number;
    普通卡牌进阶属性提升系数:number;
    稀有卡牌进阶属性提升系数:number;
    史诗卡牌进阶属性提升系数:number;
    传奇卡牌进阶属性提升系数:number;
    品质属性最大提升次数:number;
    普通品质属性提升消耗:number;
    稀有品质属性提升消耗:number;
    史诗品质属性提升消耗:number;
    传奇品质属性提升消耗:number;
    征战讨伐最高等级:number;
    /**注释：所有的卡片信息 key 卡片PID  value 卡片信息   */
    AllCards:SDictionary<number,CardModle>;
    /**注释：额外的特殊卡片信息 key 卡片PID  value 卡片信息   */
    ExtraCards:SDictionary<number,CardModle>;
    /**注释：卡片进阶数据 key 进阶等级 vluae 数据   */
    CardJinJieDatas:SDictionary<number,CardJinJieData>;
    /**注释：技能数据   */
    SkillModle:SDictionary<number,SkillModle>;
    /**注释：预计升级时间消耗  key 当前等级 value 时间消耗(秒)   */
    LevelUpTimeCast:SDictionary<number,number>;
    /**注释：key=等级 value=卡牌品质对应的金币产出   */
    JinBiChanChu:SDictionary<number,SDictionary<品质,number>>;
    /**注释：神奇数据   */
    ShenQiModles:SDictionary<number,ShenQiModle>;
    /**注释：key=等级 value=神奇品质对应碎片消耗   */
    ShenQiUpData:SDictionary<number,SDictionary<品质,number>>;
    ZhiYeJiBanData:SDictionary<兵种职业,JiBanProperty>;
    ZhongZuJiBanData:SDictionary<种族,JiBanProperty>;
    AllBuff:SDictionary<BUFF,BuffModle>;
    /**注释：技能升级花费   */
    SkillExpend:SDictionary<number,number>;
    TinfuModles:SDictionary<天赋,TianfuModle>;
    EquipModles:SDictionary<number,EquipModle>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeInt32(this.卡牌最大进阶);
       stream.writeSingle(this.属性增长系数);
       stream.writeInt32(this.神器最大等级);
       stream.writeInt32(this.技能最大等级);
       stream.writeSingle(this.普通神器几率);
       stream.writeSingle(this.稀有神器几率);
       stream.writeSingle(this.史诗神器几率);
       stream.writeSingle(this.传奇神器几率);
       stream.writeUInt32(this.神器消耗底数);
       stream.writeUInt16(this.天赋最大等级);
       stream.writeSingle(this.普通装备几率);
       stream.writeSingle(this.稀有装备几率);
       stream.writeSingle(this.史诗装备几率);
       stream.writeSingle(this.传奇装备几率);
       stream.writeUInt32(this.装备打造消耗);
       stream.writeSingle(this.普通装备合成概率);
       stream.writeSingle(this.稀有装备合成概率);
       stream.writeSingle(this.史诗装备合成概率);
       stream.writeSingle(this.传奇装备合成概率);
       stream.writeSingle(this.普通卡牌进阶属性提升系数);
       stream.writeSingle(this.稀有卡牌进阶属性提升系数);
       stream.writeSingle(this.史诗卡牌进阶属性提升系数);
       stream.writeSingle(this.传奇卡牌进阶属性提升系数);
       stream.writeByte(this.品质属性最大提升次数);
       stream.writeInt32(this.普通品质属性提升消耗);
       stream.writeInt32(this.稀有品质属性提升消耗);
       stream.writeInt32(this.史诗品质属性提升消耗);
       stream.writeInt32(this.传奇品质属性提升消耗);
       stream.writeInt32(this.征战讨伐最高等级);
       stream.writeSerializable(this.AllCards);
       stream.writeSerializable(this.ExtraCards);
       stream.writeSerializable(this.CardJinJieDatas);
       stream.writeSerializable(this.SkillModle);
       stream.writeSerializable(this.LevelUpTimeCast);
       stream.writeSerializable(this.JinBiChanChu);
       stream.writeSerializable(this.ShenQiModles);
       stream.writeSerializable(this.ShenQiUpData);
       stream.writeSerializable(this.ZhiYeJiBanData);
       stream.writeSerializable(this.ZhongZuJiBanData);
       stream.writeSerializable(this.AllBuff);
       stream.writeSerializable(this.SkillExpend);
       stream.writeSerializable(this.TinfuModles);
       stream.writeSerializable(this.EquipModles);
    }
    Deserialize(stream: BufferReader): void
    {
       this.卡牌最大进阶=stream.readInt32();
       this.属性增长系数=stream.readSingle();
       this.神器最大等级=stream.readInt32();
       this.技能最大等级=stream.readInt32();
       this.普通神器几率=stream.readSingle();
       this.稀有神器几率=stream.readSingle();
       this.史诗神器几率=stream.readSingle();
       this.传奇神器几率=stream.readSingle();
       this.神器消耗底数=stream.readUInt32();
       this.天赋最大等级=stream.readUInt16();
       this.普通装备几率=stream.readSingle();
       this.稀有装备几率=stream.readSingle();
       this.史诗装备几率=stream.readSingle();
       this.传奇装备几率=stream.readSingle();
       this.装备打造消耗=stream.readUInt32();
       this.普通装备合成概率=stream.readSingle();
       this.稀有装备合成概率=stream.readSingle();
       this.史诗装备合成概率=stream.readSingle();
       this.传奇装备合成概率=stream.readSingle();
       this.普通卡牌进阶属性提升系数=stream.readSingle();
       this.稀有卡牌进阶属性提升系数=stream.readSingle();
       this.史诗卡牌进阶属性提升系数=stream.readSingle();
       this.传奇卡牌进阶属性提升系数=stream.readSingle();
       this.品质属性最大提升次数=stream.readByte();
       this.普通品质属性提升消耗=stream.readInt32();
       this.稀有品质属性提升消耗=stream.readInt32();
       this.史诗品质属性提升消耗=stream.readInt32();
       this.传奇品质属性提升消耗=stream.readInt32();
       this.征战讨伐最高等级=stream.readInt32();
       this.AllCards=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,CardModle);
       this.ExtraCards=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,CardModle);
       this.CardJinJieDatas=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Serializable,CardJinJieData);
       this.SkillModle=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,SkillModle);
       this.LevelUpTimeCast=stream.readSerializable(SDictionary,SerializableType.Int32,SerializableType.Int32);
       this.JinBiChanChu=stream.readSerializable(SDictionary,SerializableType.Int32,SerializableType.Serializable,SDictionary,SerializableType.Byte,SerializableType.Double);
       this.ShenQiModles=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,ShenQiModle);
       this.ShenQiUpData=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,SDictionary,SerializableType.Byte,SerializableType.UInt32);
       this.ZhiYeJiBanData=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Serializable,JiBanProperty);
       this.ZhongZuJiBanData=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Serializable,JiBanProperty);
       this.AllBuff=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Serializable,BuffModle);
       this.SkillExpend=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.UInt16);
       this.TinfuModles=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Serializable,TianfuModle);
       this.EquipModles=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,EquipModle);
    }

}


/***************************************************************************************************************************************/
/**商城商品*/
export class CommodityModle  extends AMoldeDataBase implements IProtocolSerializable
{
    /**注释：价格   */
    Currency:Currency;
    /**注释：购买次数   类型：UInt16  长度：2  */
    PurchaseTime:number;
    /**注释：商品所在商城的位置   类型：System.Byte  长度：1  */
    Postion:CommodityPos;
    /**注释：货物数量   类型：UInt32  长度：4  */
    Count:number;
    /**注释：商品品质  None 为不需要品质   类型：System.Byte  长度：1  */
    Quality:品质;
    /**注释：表格自定义数据 后端使用 前端不需要   类型：String   */
    CustomData:string;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Currency);
       stream.writeUInt16(this.PurchaseTime);
       stream.writeByte(this.Postion);
       stream.writeUInt32(this.Count);
       stream.writeByte(this.Quality);
       stream.writeString(this.CustomData);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Currency=stream.readSerializable(Currency);
       this.PurchaseTime=stream.readUInt16();
       this.Postion=stream.readByte();
       this.Count=stream.readUInt32();
       this.Quality=stream.readByte();
       this.CustomData=stream.readString();
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
export class ChouJiangItem  implements IProtocolSerializable
{
    GaiLv:number;
    Currency:Currency;
    SuiPianPinZhi:品质;
    SuiPianCount:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSingle(this.GaiLv);
       stream.writeSerializable(this.Currency);
       stream.writeByte(this.SuiPianPinZhi);
       stream.writeUInt16(this.SuiPianCount);
    }
    Deserialize(stream: BufferReader): void
    {
       this.GaiLv=stream.readSingle();
       this.Currency=stream.readSerializable(Currency);
       this.SuiPianPinZhi=stream.readByte();
       this.SuiPianCount=stream.readUInt16();
    }

}


/***************************************************************************************************************************************/
/**商城配置表*/
export class MarktConfig  implements IProtocolSerializable
{
    /**注释：1宝石兑换多少盲盒币   类型：Single  长度：4  */
    宝石对盲盒币比例:number;
    每日金币推广次数:number;
    抽奖1次消耗:number;
    抽奖10次消耗:number;
    抽奖奖励次数:number;
    /**注释：商城每天可看广告的最大次数 key 商城的商品位置 value 可看广告的最大次数   */
    CommodityADTime:SDictionary<CommodityPos,number>;
    /**注释：商品数据   */
    CommodityData:SDictionary<number,CommodityModle>;
    /**注释：金币价格   */
    JinbiPrise:SDictionary<number,Currency>;
    ChouJiangItems:SList<ChouJiangItem>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSingle(this.宝石对盲盒币比例);
       stream.writeInt32(this.每日金币推广次数);
       stream.writeInt32(this.抽奖1次消耗);
       stream.writeInt32(this.抽奖10次消耗);
       stream.writeInt32(this.抽奖奖励次数);
       stream.writeSerializable(this.CommodityADTime);
       stream.writeSerializable(this.CommodityData);
       stream.writeSerializable(this.JinbiPrise);
       stream.writeSerializable(this.ChouJiangItems);
    }
    Deserialize(stream: BufferReader): void
    {
       this.宝石对盲盒币比例=stream.readSingle();
       this.每日金币推广次数=stream.readInt32();
       this.抽奖1次消耗=stream.readInt32();
       this.抽奖10次消耗=stream.readInt32();
       this.抽奖奖励次数=stream.readInt32();
       this.CommodityADTime=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.UInt16);
       this.CommodityData=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,CommodityModle);
       this.JinbiPrise=stream.readSerializable(SDictionary,SerializableType.Int32,SerializableType.Serializable,Currency);
       this.ChouJiangItems=stream.readSerializable(SList,SerializableType.Serializable,ChouJiangItem);
    }

}


/***************************************************************************************************************************************/
export class MonserMessage  implements IProtocolSerializable
{
    Pid:number;
    Type:EntityType;
    Level:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt16(this.Pid);
       stream.writeByte(this.Type);
       stream.writeUInt32(this.Level);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Pid=stream.readUInt16();
       this.Type=stream.readByte();
       this.Level=stream.readUInt32();
    }

}


/***************************************************************************************************************************************/
/**关卡数据*/
export class MissionModle  extends AMoldeDataBase implements IProtocolSerializable
{
    Level:number;
    /**注释：所有怪物   */
    MissionMosters:SList<number>;
    /**注释：玩家最大的上阵数量   类型：Byte  长度：1  */
    MaxEntityCount:number;
    /**注释：关卡标题   类型：String   */
    MissionTitle:string;
    /**注释：关卡介绍   类型：String   */
    MissionContent:string;
    /**注释：盲盒币产出   类型：UInt32  长度：4  */
    ManghebiAdd:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.Level);
       stream.writeSerializable(this.MissionMosters);
       stream.writeByte(this.MaxEntityCount);
       stream.writeString(this.MissionTitle);
       stream.writeString(this.MissionContent);
       stream.writeUInt32(this.ManghebiAdd);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Level=stream.readUInt32();
       this.MissionMosters=stream.readSerializable(SList,SerializableType.UInt16);
       this.MaxEntityCount=stream.readByte();
       this.MissionTitle=stream.readString();
       this.MissionContent=stream.readString();
       this.ManghebiAdd=stream.readUInt32();
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
export class FubenCurrencyAward  implements IProtocolSerializable
{
    BaseNumber:number;
    CurrencyType:CurrencyType;
    PlusNumber:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.BaseNumber);
       stream.writeByte(this.CurrencyType);
       stream.writeUInt32(this.PlusNumber);
    }
    Deserialize(stream: BufferReader): void
    {
       this.BaseNumber=stream.readUInt32();
       this.CurrencyType=stream.readByte();
       this.PlusNumber=stream.readUInt32();
    }

}


/***************************************************************************************************************************************/
export class FubenModle  extends AMoldeDataBase implements IProtocolSerializable
{
    /**注释：副本的货币奖励   */
    FubenCurrencyAwards:SList<FubenCurrencyAward>;
    /**注释：随机碎片获得 125关品质+1   类型：UInt32  长度：4  */
    RandomSupianCount:number;
    /**注释：对应关卡的等级   类型：Int32  长度：4  */
    ByMissionLevel:number;
    ZhongZuLimit:种族;
    ZhiYeLimit:兵种职业;
    CountLimit:number;
    EnterCountMax:number;
    RefeshEnterTimeMin:number;
    MonsterCount:number;
    Type:副本类型;
    BattleTime:number;
    /**注释：开放日 (星期)   */
    OpenDay:SHashSet<number>;
    CustomData:SList<string>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.FubenCurrencyAwards);
       stream.writeUInt32(this.RandomSupianCount);
       stream.writeInt32(this.ByMissionLevel);
       stream.writeByte(this.ZhongZuLimit);
       stream.writeByte(this.ZhiYeLimit);
       stream.writeByte(this.CountLimit);
       stream.writeByte(this.EnterCountMax);
       stream.writeInt32(this.RefeshEnterTimeMin);
       stream.writeByte(this.MonsterCount);
       stream.writeByte(this.Type);
       stream.writeUInt16(this.BattleTime);
       stream.writeSerializable(this.OpenDay);
       stream.writeSerializable(this.CustomData);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.FubenCurrencyAwards=stream.readSerializable(SList,SerializableType.Serializable,FubenCurrencyAward);
       this.RandomSupianCount=stream.readUInt32();
       this.ByMissionLevel=stream.readInt32();
       this.ZhongZuLimit=stream.readByte();
       this.ZhiYeLimit=stream.readByte();
       this.CountLimit=stream.readByte();
       this.EnterCountMax=stream.readByte();
       this.RefeshEnterTimeMin=stream.readInt32();
       this.MonsterCount=stream.readByte();
       this.Type=stream.readByte();
       this.BattleTime=stream.readUInt16();
       this.OpenDay=stream.readSerializable(SHashSet,SerializableType.Byte);
       this.CustomData=stream.readSerializable(SList,SerializableType.String);
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
/**关卡配置数据*/
export class MissionConfig  implements IProtocolSerializable
{
    /**注释：关卡剧情   */
    JuQing:SList<string>;
    /**注释：关卡奖励   */
    MissionAward:SList<MissionAward>;
    Fuben:SDictionary<number,FubenModle>;
    /**注释：关卡排行榜上榜最小值   类型：UInt32  长度：4  */
    关卡排行榜上榜最小值:number;
    怪物等级增长:number;
    怪物进阶增长:number;
    BOSS关卡等级增加:number;
    BOSS血量倍数:number;
    飞行宝箱最小刷新时间:number;
    飞行宝箱最大刷新时间:number;
    飞行宝箱最小金币数量:number;
    飞行宝箱最大金币数量:number;
    飞行宝箱飞行时间:number;
    三倍金币价格:number;
    三倍金币时间:number;
    征战讨伐最高等级:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.JuQing);
       stream.writeSerializable(this.MissionAward);
       stream.writeSerializable(this.Fuben);
       stream.writeUInt32(this.关卡排行榜上榜最小值);
       stream.writeSingle(this.怪物等级增长);
       stream.writeSingle(this.怪物进阶增长);
       stream.writeByte(this.BOSS关卡等级增加);
       stream.writeByte(this.BOSS血量倍数);
       stream.writeInt32(this.飞行宝箱最小刷新时间);
       stream.writeInt32(this.飞行宝箱最大刷新时间);
       stream.writeInt32(this.飞行宝箱最小金币数量);
       stream.writeInt32(this.飞行宝箱最大金币数量);
       stream.writeInt32(this.飞行宝箱飞行时间);
       stream.writeInt32(this.三倍金币价格);
       stream.writeInt32(this.三倍金币时间);
       stream.writeInt32(this.征战讨伐最高等级);
    }
    Deserialize(stream: BufferReader): void
    {
       this.JuQing=stream.readSerializable(SList,SerializableType.String);
       this.MissionAward=stream.readSerializable(SList,SerializableType.Serializable,MissionAward);
       this.Fuben=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,FubenModle);
       this.关卡排行榜上榜最小值=stream.readUInt32();
       this.怪物等级增长=stream.readSingle();
       this.怪物进阶增长=stream.readSingle();
       this.BOSS关卡等级增加=stream.readByte();
       this.BOSS血量倍数=stream.readByte();
       this.飞行宝箱最小刷新时间=stream.readInt32();
       this.飞行宝箱最大刷新时间=stream.readInt32();
       this.飞行宝箱最小金币数量=stream.readInt32();
       this.飞行宝箱最大金币数量=stream.readInt32();
       this.飞行宝箱飞行时间=stream.readInt32();
       this.三倍金币价格=stream.readInt32();
       this.三倍金币时间=stream.readInt32();
       this.征战讨伐最高等级=stream.readInt32();
    }

}


/***************************************************************************************************************************************/
export class MissionAward  implements IProtocolSerializable
{
    /**注释：Boss的装备碎片掉落数量   类型：UInt16  长度：2  */
    BossEquipSuipian:number;
    /**注释：小怪掉落   */
    XiaoGuaiDiaoLuo:SList<Currency>;
    MinLevel:number;
    MaxLevel:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt16(this.BossEquipSuipian);
       stream.writeSerializable(this.XiaoGuaiDiaoLuo);
       stream.writeUInt32(this.MinLevel);
       stream.writeUInt32(this.MaxLevel);
    }
    Deserialize(stream: BufferReader): void
    {
       this.BossEquipSuipian=stream.readUInt16();
       this.XiaoGuaiDiaoLuo=stream.readSerializable(SList,SerializableType.Serializable,Currency);
       this.MinLevel=stream.readUInt32();
       this.MaxLevel=stream.readUInt32();
    }

}


/***************************************************************************************************************************************/
/**用户的副本数据*/
export class FubenData  implements IProtocolSerializable
{
    Pid:number;
    /**注释：进入的次数   类型：Byte  长度：1  */
    EnterCount:number;
    /**注释：最后进入的时间   类型：DateTime  长度：8  */
    EnterTime:Date;
    /**注释：副本等级   类型：UInt16  长度：2  */
    Level:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt16(this.Pid);
       stream.writeByte(this.EnterCount);
       stream.writeDateTime(this.EnterTime);
       stream.writeUInt16(this.Level);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Pid=stream.readUInt16();
       this.EnterCount=stream.readByte();
       this.EnterTime=stream.readDateTime();
       this.Level=stream.readUInt16();
    }

}


/***************************************************************************************************************************************/
/**签到数据*/
export class SignData  implements IProtocolSerializable
{
    /**注释：奖励的货币   */
    Currencies:SList<Currency>;
    /**注释：奖励卡牌碎片的品质   类型：System.Byte  长度：1  */
    SuiPianPinZhi:品质;
    /**注释：奖励的碎片数量   类型：UInt32  长度：4  */
    SuiPianCount:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Currencies);
       stream.writeByte(this.SuiPianPinZhi);
       stream.writeUInt32(this.SuiPianCount);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Currencies=stream.readSerializable(SList,SerializableType.Serializable,Currency);
       this.SuiPianPinZhi=stream.readByte();
       this.SuiPianCount=stream.readUInt32();
    }

}


/***************************************************************************************************************************************/
export class LiBaoMaAawrd  implements IProtocolSerializable
{
    Award:Award;
    Name:string;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Award);
       stream.writeString(this.Name);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Award=stream.readSerializable(Award);
       this.Name=stream.readString();
    }

}


/***************************************************************************************************************************************/
/**签到配置*/
export class SignConfig  implements IProtocolSerializable
{
    /**注释：签到数据 key签到的天数    */
    SingDatas:SDictionary<number,SignData>;
    Duihuanma:SDictionary<string,Award>;
    LiBaoMa:SDictionary<number,LiBaoMaAawrd>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.SingDatas);
       stream.writeSerializable(this.Duihuanma);
       stream.writeSerializable(this.LiBaoMa);
    }
    Deserialize(stream: BufferReader): void
    {
       this.SingDatas=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,SignData);
       this.Duihuanma=stream.readSerializable(SDictionary,SerializableType.String,SerializableType.Serializable,Award);
       this.LiBaoMa=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,LiBaoMaAawrd);
    }

}


/***************************************************************************************************************************************/
export class TongXingZhengAward  implements IProtocolSerializable
{
    CurrencyAward:Currency;
    SuiPianAward:UnknowSuipian;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.CurrencyAward);
       stream.writeSerializable(this.SuiPianAward);
    }
    Deserialize(stream: BufferReader): void
    {
       this.CurrencyAward=stream.readSerializable(Currency);
       this.SuiPianAward=stream.readSerializable(UnknowSuipian);
    }

}


/***************************************************************************************************************************************/
export class TongXiongZheng  implements IProtocolSerializable
{
    Min:number;
    Max:number;
    Hight:TongXingZhengAward;
    Low:TongXingZhengAward;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.Min);
       stream.writeUInt32(this.Max);
       stream.writeSerializable(this.Hight);
       stream.writeSerializable(this.Low);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Min=stream.readUInt32();
       this.Max=stream.readUInt32();
       this.Hight=stream.readSerializable(TongXingZhengAward);
       this.Low=stream.readSerializable(TongXingZhengAward);
    }

}


/***************************************************************************************************************************************/
export class TaskConfig  implements IProtocolSerializable
{
    Tasks:SDictionary<number,TaskModle>;
    TongXingZhengAwards:SDictionary<number,TongXiongZheng>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Tasks);
       stream.writeSerializable(this.TongXingZhengAwards);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Tasks=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,TaskModle);
       this.TongXingZhengAwards=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,TongXiongZheng);
    }

}


/***************************************************************************************************************************************/
export class VIPAward  implements IProtocolSerializable
{
    Award:Award;
    Property:GameProperty;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Award);
       stream.writeSerializable(this.Property);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Award=stream.readSerializable(Award);
       this.Property=stream.readSerializable(GameProperty,SerializableType.Byte,SerializableType.Single);
    }

}


/***************************************************************************************************************************************/
export class UserConfig  implements IProtocolSerializable
{
    初始货币:SList<Currency>;
    初始兵种:SList<CardValue>;
    YueKaAward:VIPAward;
    VipAward:VIPAward;
    竞技场初始奖杯数量:number;
    上阵最大数量:number;
    /**注释：秒   类型：Int32  长度：4  */
    宝石兑换金币比例:number;
    宝石兑换盲盒币比例:number;
    /**注释：秒   类型：Int32  长度：4  */
    最大离线收益时间秒:number;
    /**注释：秒   类型：Int32  长度：4  */
    最小离线收益时间秒:number;
    离线闯关速度秒:number;
    Vip自动重生次数:number;
    月卡自动重生次数:number;
    默认自动重生次数:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.初始货币);
       stream.writeSerializable(this.初始兵种);
       stream.writeSerializable(this.YueKaAward);
       stream.writeSerializable(this.VipAward);
       stream.writeUInt32(this.竞技场初始奖杯数量);
       stream.writeInt32(this.上阵最大数量);
       stream.writeInt32(this.宝石兑换金币比例);
       stream.writeInt32(this.宝石兑换盲盒币比例);
       stream.writeInt32(this.最大离线收益时间秒);
       stream.writeInt32(this.最小离线收益时间秒);
       stream.writeInt32(this.离线闯关速度秒);
       stream.writeInt32(this.Vip自动重生次数);
       stream.writeInt32(this.月卡自动重生次数);
       stream.writeInt32(this.默认自动重生次数);
    }
    Deserialize(stream: BufferReader): void
    {
       this.初始货币=stream.readSerializable(SList,SerializableType.Serializable,Currency);
       this.初始兵种=stream.readSerializable(SList,SerializableType.Serializable,CardValue);
       this.YueKaAward=stream.readSerializable(VIPAward);
       this.VipAward=stream.readSerializable(VIPAward);
       this.竞技场初始奖杯数量=stream.readUInt32();
       this.上阵最大数量=stream.readInt32();
       this.宝石兑换金币比例=stream.readInt32();
       this.宝石兑换盲盒币比例=stream.readInt32();
       this.最大离线收益时间秒=stream.readInt32();
       this.最小离线收益时间秒=stream.readInt32();
       this.离线闯关速度秒=stream.readInt32();
       this.Vip自动重生次数=stream.readInt32();
       this.月卡自动重生次数=stream.readInt32();
       this.默认自动重生次数=stream.readInt32();
    }

}


/***************************************************************************************************************************************/
/**货币*/
export class Currency  implements IProtocolSerializable
{
    CurrencyType:CurrencyType;
    Value:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.CurrencyType);
       stream.writeDouble(this.Value);
    }
    Deserialize(stream: BufferReader): void
    {
       this.CurrencyType=stream.readByte();
       this.Value=stream.readDouble();
    }

}


/***************************************************************************************************************************************/
export class Friend  implements IProtocolSerializable
{
    ID:number;
    AvatarUrl:string;
    Name:string;
    Mission:number;
    AreanScore:number;
    IsOnline:boolean;
    Serialize(stream: BufferWriter): void
    {
       stream.writeInt32(this.ID);
       stream.writeString(this.AvatarUrl);
       stream.writeString(this.Name);
       stream.writeInt32(this.Mission);
       stream.writeInt32(this.AreanScore);
       stream.writeBoolean(this.IsOnline);
    }
    Deserialize(stream: BufferReader): void
    {
       this.ID=stream.readInt32();
       this.AvatarUrl=stream.readString();
       this.Name=stream.readString();
       this.Mission=stream.readInt32();
       this.AreanScore=stream.readInt32();
       this.IsOnline=stream.readBoolean();
    }

}


/***************************************************************************************************************************************/
export class GameServerInfo  implements IProtocolSerializable
{
    ServerID:number;
    ServerName:string;
    GateIp:string;
    ConnectCode:string;
    ServerState:ServerStatus;
    Serialize(stream: BufferWriter): void
    {
       stream.writeInt32(this.ServerID);
       stream.writeString(this.ServerName);
       stream.writeString(this.GateIp);
       stream.writeString(this.ConnectCode);
       stream.writeByte(this.ServerState);
    }
    Deserialize(stream: BufferReader): void
    {
       this.ServerID=stream.readInt32();
       this.ServerName=stream.readString();
       this.GateIp=stream.readString();
       this.ConnectCode=stream.readString();
       this.ServerState=stream.readByte();
    }

}


/***************************************************************************************************************************************/
@IntedSerType(() => { return {0:Item, 1:Equip, 2:Consumption, } })
export abstract class Item  implements IProtocolSerializable
{
    ID:number;
    Pid:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.ID);
       stream.writeUInt16(this.Pid);
    }
    Deserialize(stream: BufferReader): void
    {
       this.ID=stream.readUInt32();
       this.Pid=stream.readUInt16();
    }

}


/***************************************************************************************************************************************/
export class Equip  extends Item implements IProtocolSerializable
{
    Property:SDictionary<UserProeprtyType,number>;
    Skills:SDictionary<number,number>;
    JinJieUp:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Property);
       stream.writeSerializable(this.Skills);
       stream.writeByte(this.JinJieUp);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Property=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Single);
       this.Skills=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Byte);
       this.JinJieUp=stream.readByte();
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
export class Consumption  extends Item implements IProtocolSerializable
{
    Pile:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.Pile);
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Pile=stream.readUInt32();
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
/**网关握手消息*/
export class GateHandShake  implements IProtocolSerializable
{
    /**注释：请求加密密匙   */
    EncryptKeys:SList<number>;
    /**注释：请求加密签名   */
    RequestEncrytSign:SDictionary<number,number>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.EncryptKeys);
       stream.writeSerializable(this.RequestEncrytSign);
    }
    Deserialize(stream: BufferReader): void
    {
       this.EncryptKeys=stream.readSerializable(SList,SerializableType.Int32);
       this.RequestEncrytSign=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Int32);
    }

}


/***************************************************************************************************************************************/
export class LoginAccount  implements IProtocolSerializable
{
    /**注释：邀请者的邀请码 为空则没有邀请者   类型：String   */
    InvitationCode:string;
    /**注释：账号  如果是微信平台为 微信code   类型：String   */
    Account:string;
    /**注释：密码   类型：String   */
    Password:string;
    /**注释：登陆平台   类型：System.Byte  长度：1  */
    Platform:Platform;
    /**注释：平台用户的昵称   类型：String   */
    Name:string;
    /**注释：平台用户头像URL   类型：String   */
    AvatarUrl:string;
    Serialize(stream: BufferWriter): void
    {
       stream.writeString(this.InvitationCode);
       stream.writeString(this.Account);
       stream.writeString(this.Password);
       stream.writeByte(this.Platform);
       stream.writeString(this.Name);
       stream.writeString(this.AvatarUrl);
    }
    Deserialize(stream: BufferReader): void
    {
       this.InvitationCode=stream.readString();
       this.Account=stream.readString();
       this.Password=stream.readString();
       this.Platform=stream.readByte();
       this.Name=stream.readString();
       this.AvatarUrl=stream.readString();
    }

}


/***************************************************************************************************************************************/
export class Mail  implements IProtocolSerializable
{
    ID:number;
    Tittle:string;
    SenderID:number;
    CreatTime:Date;
    Message:string;
    Award:Award;
    Geted:boolean;
    Readed:boolean;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.ID);
       stream.writeString(this.Tittle);
       stream.writeUInt32(this.SenderID);
       stream.writeDateTime(this.CreatTime);
       stream.writeString(this.Message);
       stream.writeSerializable(this.Award);
       stream.writeBoolean(this.Geted);
       stream.writeBoolean(this.Readed);
    }
    Deserialize(stream: BufferReader): void
    {
       this.ID=stream.readUInt32();
       this.Tittle=stream.readString();
       this.SenderID=stream.readUInt32();
       this.CreatTime=stream.readDateTime();
       this.Message=stream.readString();
       this.Award=stream.readSerializable(Award);
       this.Geted=stream.readBoolean();
       this.Readed=stream.readBoolean();
    }

}


/***************************************************************************************************************************************/
/**商城数据*/
export class MarktData  implements IProtocolSerializable
{
    /**注释：玩家已购买商品的次数  key 商品pid  value 买次数   */
    CommodityBuyTime:SDictionary<number,number>;
    /**注释：动态区域的商品 key 商品的Pid  value 商品的数量   */
    DynamicCommodity:SDictionary<number,number>;
    /**注释：动态区域已刷新的次数   类型：Byte  长度：1  */
    RefeshTime:number;
    /**注释：动态区域最大刷新次数   类型：Byte  长度：1  */
    MaxRefeshTime:number;
    /**注释：今天可观看广告次数 key 商品位置 value 看的次数   */
    ADCount:SDictionary<CommodityPos,number>;
    /**注释：历史抽奖次数   类型：UInt16  长度：2  */
    ChouJiangCount:number;
    /**注释：上次广告观看时间   类型：DateTime  长度：8  */
    WatchAdTime:Date;
    /**注释：是否是第一次免费抽奖   类型：Boolean  长度：1  */
    IsFirstFreeChouJiang:boolean;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.CommodityBuyTime);
       stream.writeSerializable(this.DynamicCommodity);
       stream.writeByte(this.RefeshTime);
       stream.writeByte(this.MaxRefeshTime);
       stream.writeSerializable(this.ADCount);
       stream.writeUInt16(this.ChouJiangCount);
       stream.writeDateTime(this.WatchAdTime);
       stream.writeBoolean(this.IsFirstFreeChouJiang);
    }
    Deserialize(stream: BufferReader): void
    {
       this.CommodityBuyTime=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.UInt16);
       this.DynamicCommodity=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.UInt16);
       this.RefeshTime=stream.readByte();
       this.MaxRefeshTime=stream.readByte();
       this.ADCount=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.UInt16);
       this.ChouJiangCount=stream.readUInt16();
       this.WatchAdTime=stream.readDateTime();
       this.IsFirstFreeChouJiang=stream.readBoolean();
    }

}


/***************************************************************************************************************************************/
/**买商品请求*/
export class BuyRequest  implements IProtocolSerializable
{
    /**注释：商品PID   类型：UInt16  长度：2  */
    Pid:number;
    /**注释：是否是看广告购买   类型：Boolean  长度：1  */
    WatchAD:boolean;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt16(this.Pid);
       stream.writeBoolean(this.WatchAD);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Pid=stream.readUInt16();
       this.WatchAD=stream.readBoolean();
    }

}


/***************************************************************************************************************************************/
export class RandomCard  implements IProtocolSerializable
{
    Count:number;
    PinZhi:品质;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.Count);
       stream.writeByte(this.PinZhi);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Count=stream.readUInt32();
       this.PinZhi=stream.readByte();
    }

}


/***************************************************************************************************************************************/
/**奖励类*/
export class Award  implements IProtocolSerializable
{
    /**注释：奖励的货币   */
    Currencies:SDictionary<CurrencyType,number>;
    /**注释：奖励的卡牌碎片   */
    CardDebris:SDictionary<number,number>;
    /**注释：神器的获得   */
    ShenQi:SList<ShenQi>;
    /**注释：随机卡牌奖励获得   */
    RandomCards:SList<RandomCard>;
    /**注释：装备   */
    Equips:SList<Equip>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.Currencies);
       stream.writeSerializable(this.CardDebris);
       stream.writeSerializable(this.ShenQi);
       stream.writeSerializable(this.RandomCards);
       stream.writeSerializable(this.Equips);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Currencies=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Double);
       this.CardDebris=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.UInt16);
       this.ShenQi=stream.readSerializable(SList,SerializableType.Serializable,ShenQi);
       this.RandomCards=stream.readSerializable(SList,SerializableType.Serializable,RandomCard);
       this.Equips=stream.readSerializable(SList,SerializableType.Serializable,Equip);
    }

}


/***************************************************************************************************************************************/
/**卡牌限制*/
export class CardLimit  implements IProtocolSerializable
{
    Type:兵种职业;
    Quality:品质;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.Type);
       stream.writeByte(this.Quality);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Type=stream.readByte();
       this.Quality=stream.readByte();
    }

}


/***************************************************************************************************************************************/
/**玩家的任务数据*/
export class TaskData  implements IProtocolSerializable
{
    /**注释：日常   */
    DayTask:SList<GameTask>;
    /**注释：周常   */
    WeekTask:SList<GameTask>;
    /**注释：已完成的UI任务   */
    UITask:SHashSet<number>;
    VIP:boolean;
    TongXingZhengAwardLevel:number;
    VipTongXingZhengAwardLevel:number;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.DayTask);
       stream.writeSerializable(this.WeekTask);
       stream.writeSerializable(this.UITask);
       stream.writeBoolean(this.VIP);
       stream.writeUInt16(this.TongXingZhengAwardLevel);
       stream.writeUInt16(this.VipTongXingZhengAwardLevel);
    }
    Deserialize(stream: BufferReader): void
    {
       this.DayTask=stream.readSerializable(SList,SerializableType.Serializable,GameTask);
       this.WeekTask=stream.readSerializable(SList,SerializableType.Serializable,GameTask);
       this.UITask=stream.readSerializable(SHashSet,SerializableType.UInt16);
       this.VIP=stream.readBoolean();
       this.TongXingZhengAwardLevel=stream.readUInt16();
       this.VipTongXingZhengAwardLevel=stream.readUInt16();
    }

}


/***************************************************************************************************************************************/
export class GameTask  implements IProtocolSerializable
{
    Pid:number;
    CommplateCount:number;
    GetAward:boolean;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt16(this.Pid);
       stream.writeUInt32(this.CommplateCount);
       stream.writeBoolean(this.GetAward);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Pid=stream.readUInt16();
       this.CommplateCount=stream.readUInt32();
       this.GetAward=stream.readBoolean();
    }

}


/***************************************************************************************************************************************/
export class VipData  implements IProtocolSerializable
{
    /**注释：用户的终身VIP等级   类型：Byte  长度：1  */
    VIPLevel:number;
    /**注释：终身VIP奖励领取时间   类型：DateTime  长度：8  */
    VIPAwardTime:Date;
    /**注释：月卡到期时间   类型：DateTime  长度：8  */
    VipYueKa:Date;
    /**注释：月卡奖励领取时间   类型：DateTime  长度：8  */
    YueKaAwardTime:Date;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.VIPLevel);
       stream.writeDateTime(this.VIPAwardTime);
       stream.writeDateTime(this.VipYueKa);
       stream.writeDateTime(this.YueKaAwardTime);
    }
    Deserialize(stream: BufferReader): void
    {
       this.VIPLevel=stream.readByte();
       this.VIPAwardTime=stream.readDateTime();
       this.VipYueKa=stream.readDateTime();
       this.YueKaAwardTime=stream.readDateTime();
    }

}


/***************************************************************************************************************************************/
export class User  implements IProtocolSerializable
{
    Platform:Platform;
    /**注释：此游戏的用户数据库唯一ID   类型：UInt32  长度：4  */
    UserID:number;
    /**注释：昵称   类型：String   */
    Name:string;
    /**注释：头像URL 如果为空 为默认头像   类型：String   */
    AvatarUrl:string;
    /**注释：下线时间   类型：DateTime  长度：8  */
    OutlineTime:Date;
    /**注释：玩家的所有货币 key 是货币类型 value 是数量   */
    UserCurrency:SDictionary<CurrencyType,number>;
    /**注释：玩家拥有的所有卡片 key pid    */
    Cards:SDictionary<number,Card>;
    /**注释：卡牌碎片 key pid value 数量   */
    CardDebris:SDictionary<number,number>;
    TaskData:TaskData;
    MarktData:MarktData;
    /**注释：关卡等级   类型：UInt32  长度：4  */
    CurrentMissionLevel:number;
    /**注释：历史最高等级   类型：UInt32  长度：4  */
    HightestMissionLevel:number;
    /**注释：关卡获得的奖励   */
    MissionAward:Award;
    /**注释：关卡倒退时间   类型：DateTime  长度：8  */
    MissionBackTime:Date;
    /**注释：离线金币收益   类型：Double  长度：8  */
    OulineGold:number;
    UserArena:UserArena;
    /**注释：签到次数   类型：UInt16  长度：2  */
    SignValue:number;
    /**注释：已经领取过的兑换码   */
    Duihuanma:SHashSet<string>;
    /**注释：当天是否已签到   类型：Boolean  长度：1  */
    Signed:boolean;
    /**注释：礼包码兑换时间   类型：DateTime  长度：8  */
    DuiHuanMaTime:Date;
    /**注释：当前战斗已上阵的卡牌   */
    BattleCards:SHashSet<number>;
    /**注释：断线重连的加密字符串   类型：String   */
    ReconnectCode:string;
    /**注释：好友   */
    Friends:SHashSet<number>;
    /**注释：拥有的神器   */
    ShengQi:SDictionary<number,ShenQi>;
    /**注释：用户的副本数据   */
    FubenDatas:SDictionary<number,FubenData>;
    /**注释：用户天赋等级   */
    Tianfu:SDictionary<天赋,Tianfu>;
    /**注释：道具   */
    Bag:SDictionary<number,Item>;
    /**注释：三倍金币到时时间   类型：DateTime  长度：8  */
    JinBiSanBeiTime:Date;
    /**注释：VIP数据   */
    VipData:VipData;
    /**注释：关卡奖励双倍领取次数   类型：Byte  长度：1  */
    MissionAwardAdTimes:number;
    /**注释：离线过关   类型：UInt32  长度：4  */
    OutLineMissionLevel:number;
    /**注释：对应品质道具合成失败次数   */
    HeChengFildCount:SDictionary<品质,number>;
    /**注释：每天各种广告的观看次数   */
    WatchADCountDay:SDictionary<RequestCode,number>;
    /**注释：自动重生次数   类型：Byte  长度：1  */
    AutoChongShengTime:number;
    Mails:SDictionary<number,Mail>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeByte(this.Platform);
       stream.writeUInt32(this.UserID);
       stream.writeString(this.Name);
       stream.writeString(this.AvatarUrl);
       stream.writeDateTime(this.OutlineTime);
       stream.writeSerializable(this.UserCurrency);
       stream.writeSerializable(this.Cards);
       stream.writeSerializable(this.CardDebris);
       stream.writeSerializable(this.TaskData);
       stream.writeSerializable(this.MarktData);
       stream.writeUInt32(this.CurrentMissionLevel);
       stream.writeUInt32(this.HightestMissionLevel);
       stream.writeSerializable(this.MissionAward);
       stream.writeDateTime(this.MissionBackTime);
       stream.writeDouble(this.OulineGold);
       stream.writeSerializable(this.UserArena);
       stream.writeUInt16(this.SignValue);
       stream.writeSerializable(this.Duihuanma);
       stream.writeBoolean(this.Signed);
       stream.writeDateTime(this.DuiHuanMaTime);
       stream.writeSerializable(this.BattleCards);
       stream.writeString(this.ReconnectCode);
       stream.writeSerializable(this.Friends);
       stream.writeSerializable(this.ShengQi);
       stream.writeSerializable(this.FubenDatas);
       stream.writeSerializable(this.Tianfu);
       stream.writeSerializable(this.Bag);
       stream.writeDateTime(this.JinBiSanBeiTime);
       stream.writeSerializable(this.VipData);
       stream.writeByte(this.MissionAwardAdTimes);
       stream.writeUInt32(this.OutLineMissionLevel);
       stream.writeSerializable(this.HeChengFildCount);
       stream.writeSerializable(this.WatchADCountDay);
       stream.writeByte(this.AutoChongShengTime);
       stream.writeSerializable(this.Mails);
    }
    Deserialize(stream: BufferReader): void
    {
       this.Platform=stream.readByte();
       this.UserID=stream.readUInt32();
       this.Name=stream.readString();
       this.AvatarUrl=stream.readString();
       this.OutlineTime=stream.readDateTime();
       this.UserCurrency=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Double);
       this.Cards=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,Card);
       this.CardDebris=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Int32);
       this.TaskData=stream.readSerializable(TaskData);
       this.MarktData=stream.readSerializable(MarktData);
       this.CurrentMissionLevel=stream.readUInt32();
       this.HightestMissionLevel=stream.readUInt32();
       this.MissionAward=stream.readSerializable(Award);
       this.MissionBackTime=stream.readDateTime();
       this.OulineGold=stream.readDouble();
       this.UserArena=stream.readSerializable(UserArena);
       this.SignValue=stream.readUInt16();
       this.Duihuanma=stream.readSerializable(SHashSet,SerializableType.String);
       this.Signed=stream.readBoolean();
       this.DuiHuanMaTime=stream.readDateTime();
       this.BattleCards=stream.readSerializable(SHashSet,SerializableType.UInt16);
       this.ReconnectCode=stream.readString();
       this.Friends=stream.readSerializable(SHashSet,SerializableType.UInt32);
       this.ShengQi=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,ShenQi);
       this.FubenDatas=stream.readSerializable(SDictionary,SerializableType.UInt16,SerializableType.Serializable,FubenData);
       this.Tianfu=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Serializable,Tianfu);
       this.Bag=stream.readSerializable(SDictionary,SerializableType.UInt32,SerializableType.Serializable,Item);
       this.JinBiSanBeiTime=stream.readDateTime();
       this.VipData=stream.readSerializable(VipData);
       this.MissionAwardAdTimes=stream.readByte();
       this.OutLineMissionLevel=stream.readUInt32();
       this.HeChengFildCount=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.UInt16);
       this.WatchADCountDay=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.UInt16);
       this.AutoChongShengTime=stream.readByte();
       this.Mails=stream.readSerializable(SDictionary,SerializableType.UInt32,SerializableType.Serializable,Mail);
    }

}


/***************************************************************************************************************************************/
/**用户信息*/
export class UserInfo  implements IProtocolSerializable
{
    /**注释：此游戏的用户数据库唯一ID   类型：UInt32  长度：4  */
    UserID:number;
    /**注释：昵称   类型：String   */
    Name:string;
    /**注释：头像URL 如果为空 为默认头像   类型：String   */
    AvatarUrl:string;
    /**注释：关卡等级   类型：UInt32  长度：4  */
    MissionLevel:number;
    /**注释：竞技场段位等级   类型：UInt32  长度：4  */
    ArenaScore:number;
    /**注释：历史最高分数   类型：UInt32  长度：4  */
    ArenaWinStreakHightest:number;
    /**注释：竞技场总场次   类型：UInt32  长度：4  */
    ArenaMatchCount:number;
    /**注释：竞技场胜利场次   类型：UInt32  长度：4  */
    ArenaMatchWinCount:number;
    /**注释：竞技场失败场次   类型：UInt32  长度：4  */
    ArenaMatchFiledCount:number;
    /**注释：战斗卡牌   */
    BattleCards:SList<Card>;
    IsOnline:boolean;
    UserProperty:UserProperty;
    Serialize(stream: BufferWriter): void
    {
       stream.writeUInt32(this.UserID);
       stream.writeString(this.Name);
       stream.writeString(this.AvatarUrl);
       stream.writeUInt32(this.MissionLevel);
       stream.writeUInt32(this.ArenaScore);
       stream.writeUInt32(this.ArenaWinStreakHightest);
       stream.writeUInt32(this.ArenaMatchCount);
       stream.writeUInt32(this.ArenaMatchWinCount);
       stream.writeUInt32(this.ArenaMatchFiledCount);
       stream.writeSerializable(this.BattleCards);
       stream.writeBoolean(this.IsOnline);
       stream.writeSerializable(this.UserProperty);
    }
    Deserialize(stream: BufferReader): void
    {
       this.UserID=stream.readUInt32();
       this.Name=stream.readString();
       this.AvatarUrl=stream.readString();
       this.MissionLevel=stream.readUInt32();
       this.ArenaScore=stream.readUInt32();
       this.ArenaWinStreakHightest=stream.readUInt32();
       this.ArenaMatchCount=stream.readUInt32();
       this.ArenaMatchWinCount=stream.readUInt32();
       this.ArenaMatchFiledCount=stream.readUInt32();
       this.BattleCards=stream.readSerializable(SList,SerializableType.Serializable,Card);
       this.IsOnline=stream.readBoolean();
       this.UserProperty=stream.readSerializable(UserProperty);
    }

}


/***************************************************************************************************************************************/
export class UserProperty  implements IProtocolSerializable
{
    GloabProperty:GameProperty;
    ZhongZuPerproty:SDictionary<种族,GameProperty>;
    ZhiYePerproty:SDictionary<兵种职业,GameProperty>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.GloabProperty);
       stream.writeSerializable(this.ZhongZuPerproty);
       stream.writeSerializable(this.ZhiYePerproty);
    }
    Deserialize(stream: BufferReader): void
    {
       this.GloabProperty=stream.readSerializable(GameProperty,SerializableType.Byte,SerializableType.Single);
       this.ZhongZuPerproty=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Serializable,GameProperty,SerializableType.Byte,SerializableType.Single);
       this.ZhiYePerproty=stream.readSerializable(SDictionary,SerializableType.Byte,SerializableType.Serializable,GameProperty,SerializableType.Byte,SerializableType.Single);
    }

}


/***************************************************************************************************************************************/
export class GameProperty  extends SDictionary<UserProeprtyType,number> implements IProtocolSerializable
{
    Serialize(stream: BufferWriter): void
    {
       super.Serialize(stream);
    }
    Deserialize(stream: BufferReader): void
    {
       super.Deserialize(stream);
    }

}


/***************************************************************************************************************************************/
export class DaySeaonData  implements IProtocolSerializable
{
    MarktData:MarktData;
    TaskDatas:SList<GameTask>;
    FubenDatas:SList<FubenData>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.MarktData);
       stream.writeSerializable(this.TaskDatas);
       stream.writeSerializable(this.FubenDatas);
    }
    Deserialize(stream: BufferReader): void
    {
       this.MarktData=stream.readSerializable(MarktData);
       this.TaskDatas=stream.readSerializable(SList,SerializableType.Serializable,GameTask);
       this.FubenDatas=stream.readSerializable(SList,SerializableType.Serializable,FubenData);
    }

}


/***************************************************************************************************************************************/
export class WeekSeaonData  implements IProtocolSerializable
{
    FubenDatas:SList<FubenData>;
    TaskDatas:SList<GameTask>;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.FubenDatas);
       stream.writeSerializable(this.TaskDatas);
    }
    Deserialize(stream: BufferReader): void
    {
       this.FubenDatas=stream.readSerializable(SList,SerializableType.Serializable,FubenData);
       this.TaskDatas=stream.readSerializable(SList,SerializableType.Serializable,GameTask);
    }

}


/***************************************************************************************************************************************/
export class MonthSeaonData  implements IProtocolSerializable
{
    ArenaData:UserArena;
    Serialize(stream: BufferWriter): void
    {
       stream.writeSerializable(this.ArenaData);
    }
    Deserialize(stream: BufferReader): void
    {
       this.ArenaData=stream.readSerializable(UserArena);
    }

}


