// import { Func1, Func2 } from "./MapTool";

import { Vec2, Vec3 } from "cc";
import { Func2, Func1 } from "./ProtocolCommon";



export class Index
{
    private _str: string;
    private _x: number = 0;
    private _y: number = 0;
    public get x(): number
    {
        return this._x;
    }
    public get y(): number
    {
        return this._y;
    }
    public set x(x: number)
    {
        this._x = x;
        this._str = `x=${this._x},y=${this._y}`;
    }
    public set y(y: number)
    {
        this._y = y;
        this._str = `x=${this._x},y=${this._y}`;
    }
    constructor(x: number, y: number)
    {
        this._x = x;
        this._y = y;
        this._str = `x=${this._x},y=${this._y}`;
    }


    public equipOther(other: Index): boolean
    {
        return other ? other.x == this.x && other.y == this.y : false;
    }
    public toString(): string
    {
        return this._str;
    }
}


export interface IAIMoveEntity<T extends MapGrid>
{
    Map: T[][];
    PostionIndex: Index;
    IsMyWay(grid: T): boolean;
}





export class AStartData
{
    h: number = 0;
    g: number = 0;
    f: number = 0;
    parent: MapGrid = undefined;
}

//地图格子的基类
export interface MapGrid
{
    AStartData: AStartData;
    Postion: Vec3;
    Index: Index;
    Map: MapGrid[][];
}

//地图区域枚举
export enum MapArea
{
    //我方
    SELF,
    //敌方
    ENEMY,
    //对战缓冲
    COMMON,
    //未开发区域
    None,
}

//方向枚举
export enum Direction
{
    上 = 0,
    右上 = 1,
    右 = 2,
    右下 = 3,
    下 = 4,
    左下 = 5,
    左 = 6,
    左上 = 7,
}


export default class MapTool
{
    private static readonly Indices: Index[] = [new Index(0, 1), new Index(1, 1), new Index(1, 0), new Index(1, -1), new Index(0, -1), new Index(-1, -1), new Index(-1, 0), new Index(-1, 1)]
    //private static readonly DirIndex: number[] = [0, 7, 1, 6, 2, 4, 5, 3];


    // mapWidth 地图宽度
    // mapHight 地图高度

    // gridWidth 格子宽度
    // gridHight 格子高度
    // mapWidth 地图宽度
    // mapWidth 地图宽度
    /**检测两个格子的距离 */
    public static CreatMapGrid<T extends MapGrid>(mapWidth: number, mapHight: number, gridWidth: number, gridHight: number, creatGridFunc: Func2<Index, Vec3, T>, cautious: boolean): T[][]
    {
        var width = mapWidth;
        var hight = mapHight;
        var row: number = cautious ? Math.floor(width / gridWidth) : Math.ceil(width / gridWidth);
        var col: number = cautious ? Math.floor(hight / gridHight) : Math.ceil(hight / gridHight);
        var orgPostion: Vec3 = new Vec3(-width / 2, -hight / 2);
        var grids: T[][] = [];
        for (var i = 0; i < row; i++)
        {
            var arr: T[] = [];
            grids.push(arr);
            for (var j = 0; j < col; j++)
            {
                var x = orgPostion.x + gridWidth / 2 + i * gridWidth;
                var y = orgPostion.y + gridHight / 2 + j * gridHight;
                var index = new Index(i, j);
                var pos = new Vec3(x, y);
                var grid: T = creatGridFunc(index, pos);
                grid.Map = grids;
                grid.Index = new Index(i, j);
                grid.Postion = new Vec3(x, y);
                grid.AStartData = new AStartData();
                arr.push(grid);
            }
        }
        return grids;
    }

    public static CheckIndex<T>(x: number, y: number, MapGrids: T[][]): Boolean
    {
        return x < MapGrids.length && x >= 0 && y < MapGrids[x].length && y >= 0;
    }

    public static CheckNeighbor(orgIndex: Index, targetIndex: Index): boolean
    {
        return Math.abs(orgIndex.x - targetIndex.x) <= 1 && Math.abs(orgIndex.y - targetIndex.y) <= 1;
    }

    public static GetGridDistance(org: Index, target: Index): number
    {
        var x = Math.abs(org.x - target.x);
        var y = Math.abs(org.y - target.y);
        return x >= y ? x : y;
    }
    /**检测两个坐标的距离 */
    public static GetGridDistanceNumber(x1: number, y1: number, x2: number, y2: number): number
    {
        var x = Math.abs(x1 - x2);
        var y = Math.abs(y1 - y2);
        return x >= y ? x : y;
    }


    /**获得 indexTarget 相对于org 的方向 */
    public static GetDirByIndex(orgIndex: Index, indexTarget: Index): Direction
    {
        var xoff = indexTarget.x - orgIndex.x;
        var yoff = indexTarget.y - orgIndex.y;
        if (xoff == 0)
        {
            if (yoff < 0)
            {
                return Direction.下;
            }
            else if (yoff > 0)
            {
                return Direction.上;
            }
        }
        else if (xoff > 0)
        {
            if (yoff < 0)
            {
                return Direction.右下;
            }
            else if (yoff > 0)
            {
                return Direction.右上;
            }
            else
            {
                return Direction.右;
            }
        }
        else
        {
            if (yoff < 0)
            {
                return Direction.左下;
            }
            else if (yoff > 0)
            {
                return Direction.左上;
            }
            else
            {
                return Direction.左;
            }
        }
        //  return 0;
    }
    /**获得一个范围内的格子 */
    public static GetRangGrid<T extends MapGrid>(orgGrid: T, range: number, map: T[][], outStart: boolean): T[]
    {
        var around: T[] = [];
        if (!outStart)
        {
            var off: number = 0;
            while (off <= range)
            {
                var offect;
                for (var i = -off; i <= off; i++)
                {
                    if (Math.abs(i) < off)
                    {
                        offect = 2 * off;
                    }
                    else
                    {
                        offect = 1;
                    }
                    for (var k = -off; k <= off; k += offect)
                    {
                        var x = orgGrid.Index.x + i;
                        var y = orgGrid.Index.y + k;
                        if (this.CheckIndex(x, y, map))
                        {
                            around.push(map[x][y]);
                        }
                    }
                }
                off++;
            }
        }
        else
        {
            var off = range;
            var offect;
            while (off >= 0)
            {
                for (var i = -off; i <= off; i++)
                {
                    if (Math.abs(i) < off)
                    {
                        offect = 2 * off;
                    }
                    else
                    {
                        offect = 1;
                    }
                    for (var k = -off; k <= off; k += offect)
                    {
                        var x = orgGrid.Index.x + i;
                        var y = orgGrid.Index.y + k;
                        if (this.CheckIndex(x, y, map))
                        {
                            around.push(map[x][y]);
                        }
                    }
                }
                off--;
            }
        }
        return around;
    }
    /**遍历一个范围内的格子 */
    public static ForEachRangGrid(indexOrg: Index, range: number, ReturnFunc: Func1<Index, boolean>, outStart: boolean): void
    {
        if (!outStart)
        {
            var off = 0;
            while (off <= range)
            {
                var offect = 0;
                for (var i = -off; i <= off; i++)
                {
                    if (Math.abs(i) < off)
                    {
                        offect = 2 * off;
                    }
                    else
                    {
                        offect = 1;
                    }
                    for (var k = -off; k <= off; k += offect)
                    {
                        if (!ReturnFunc || ReturnFunc(new Index(indexOrg.x + i, indexOrg.y + k)))
                        {
                            return;
                        }
                    }
                }
                off++;
            }
        }
        else
        {
            var off = range;
            var offect = 0;
            while (off >= 0)
            {
                for (var i = -off; i <= off; i++)
                {
                    if (Math.abs(i) < off)
                    {
                        offect = 2 * off;
                    }
                    else
                    {
                        offect = 1;
                    }
                    for (var k = -off; k <= off; k += offect)
                    {
                        if (ReturnFunc != null)
                        {
                            if (ReturnFunc(new Index(indexOrg.x + i, indexOrg.y + k)))
                            {
                                return;
                            }
                        }
                        else
                        {
                            return;
                        }
                    }
                }
                off--;
            }
        }
    }















    /// <summary>
    /// 射线
    /// </summary>
    /// <param name="org" 射线起始点></param>
    /// <param name="target" 射线结束点></param>
    /// <returns 射线经过的格子  不包含起始点和结束点></returns>
    public static RayCastThouch<T extends MapGrid>(org: T, target: T, map: T[][]): T[]
    {
        var x1 = org.Index.x;
        var y1 = org.Index.y;
        var x2 = target.Index.x;
        var y2 = target.Index.y;
        var thouched: T[] = [];
        var increx = 0;
        var increy = 0;
        var x = 0;
        var y = 0;
        var steps = 0;
        var i = 0;
        if (Math.abs(x2 - x1) > Math.abs(y2 - y1))
        {
            steps = Math.abs(x2 - x1);
        }
        else
        {
            steps = Math.abs(y2 - y1);
        }
        increx = (x2 - x1) / steps;
        increy = (y2 - y1) / steps;
        x = x1;
        y = y1;
        x += increx;
        y += increy;
        for (var i = 2; i <= steps; i++)
        {
            var x = Math.floor(x);
            var y = Math.floor(y);
            if (!this.CheckIndex(x, y, map))
            {
                return thouched;
            }
            var grid = map[x][y];
            thouched.push(grid);
            x += increx;
            y += increy;
        }
        return thouched;
    }

    public static GetAIMove<T extends MapGrid>(entity: IAIMoveEntity<T>, targetPostion: Index, minGirdDisctance: number): T
    {
        if (this.GetGridDistance(entity.PostionIndex, targetPostion) <= minGirdDisctance)
        {
            return undefined;
        }
        let getedWay = entity['_$GetedWay'];
        let distance = Number.MAX_VALUE;
        let returned: T = undefined;
        let finded: Boolean = false;
        let luckyDirction = this.GetDirByIndex(entity.PostionIndex, targetPostion);
        let start: number = luckyDirction;
        let lucky = luckyDirction;
        do
        {
            let newX = this.Indices[luckyDirction].x + entity.PostionIndex.x;
            let newY = this.Indices[luckyDirction].y + entity.PostionIndex.y;
            if (++luckyDirction > 7)
            {
                luckyDirction = 0;
            }
            if (!this.CheckMapGrid(newX, newY, entity.Map))
            {
                continue;
            }
            let grid = entity.Map[newX][newY];
            if (!entity.IsMyWay(grid))
            {
                continue;
            }
            if (getedWay == grid)
            {
                continue;
            }
            if (this.GetDirByIndex(entity.PostionIndex, grid.Index) == lucky)
            {
                returned = grid;
                finded = true;
                break;
            }
            let dis = Vec2.distance(grid.Postion, entity.Map[targetPostion.x][targetPostion.y].Postion);
            if (dis < distance)
            {
                returned = grid;
                distance = dis;
                finded = true;
            }
        } while (luckyDirction != start);
        if (!finded)
        {
            returned = undefined;
            entity['_$GetedWay'] = undefined;
        }
        else
        {
            entity['_$GetedWay'] = returned;
        }

        //         console.error(returned);
        return returned;
    }
    static CheckMapGrid(x: number, y: number, MapGrids: MapGrid[][])
    {
        return x < MapGrids.length && x >= 0 && y < MapGrids[x].length && y >= 0 && MapGrids[x][y] != null;
    }












    //#region A* 寻路
    // start 起始点 end 结束点 map 地图的二维数组数据  isWay 判断当前格子是否是可用道路的方法（参数 格子 返回ture表示可以行走）
    // 返回路线的数组 如果返回 数组长度为0 说明没找到可行走路线
    public static FindPath<T extends MapGrid>(start: T, end: T, map: T[][], IsWay: Func1<T, boolean>): T[]
    {
        var openList: T[] = [];
        var closeList: T[] = [];
        MapTool.AddPoint(openList, start);
        while (openList.length > 0)
        {
            var point: T = openList[0];
            if (point == end)
            {
                return MapTool.Generatepath(start, end);
            }
            MapTool.RemovePoint(openList, point);
            closeList.push(point);
            var surroundPoints: T[] = MapTool.GetSurroundPoints(point, map, IsWay);
            MapTool.PointsFilter(surroundPoints, closeList);
            for (let index = 0; index < surroundPoints.length; index++)
            {
                const element = surroundPoints[index];
                if (openList.indexOf(element) > -1)
                {
                    var nowG = MapTool.CalcG(element, element.AStartData.parent);
                    if (nowG < element.AStartData.g)
                    {
                        this.upDateParent(element, point, nowG);
                    }
                }
                else
                {
                    element.AStartData.parent = point;
                    MapTool.CalcF(element, end);
                    MapTool.AddPoint(openList, element);
                }
            }
        }
        var endSurroundPoints: T[] = MapTool.GetSurroundPoints(end, map, IsWay);
        var optimal: T = null;
        for (let index = 0; index < endSurroundPoints.length; index++)
        {
            const element = endSurroundPoints[index];
            if (closeList.indexOf(element) > -1)
            {
                if (optimal != null)
                {
                    if (element.AStartData.g < optimal.AStartData.g)
                    {
                        optimal = element;
                    }
                }
                else
                {
                    optimal = element;
                }
            }
        }
        if (optimal != null)
        {
            return MapTool.Generatepath(start, optimal);
        }
        return MapTool.Generatepath(start, null);
    }

    private static upDateParent<T extends MapGrid>(grid: T, parent: T, g: number)
    {
        grid.AStartData.parent = parent;
        grid.AStartData.g = g;
        grid.AStartData.f = grid.AStartData.g + grid.AStartData.h;
    }
    private static AddPoint<T extends MapGrid>(openList: T[], point: T)
    {
        openList.push(point);
        var last: number = openList.length - 1;
        while (last >= 1)
        {
            var half = last >> 1;
            if (openList[last].AStartData.f >= openList[half].AStartData.f)
            {
                break;
            }
            var temporary: T = openList[last];
            openList[last] = openList[half];
            openList[half] = temporary;
            last >>= 1;
        }
    }
    private static Generatepath<T extends MapGrid>(start: MapGrid, end: MapGrid): T[]
    {
        var path = [];
        if (end != null)
        {
            var node: MapGrid = end;
            while (node != start)
            {
                path.push(node);
                node = node.AStartData.parent;
            }
            path.reverse();
        }
        return path;
    }
    private static RemovePoint<T extends MapGrid>(openList: T[], point: T)
    {
        var last = openList.length;
        var head = openList.indexOf(point) + 1;
        while ((head << 1) + 1 <= last)
        {
            var child1 = head << 1;
            var child2 = child1 + 1;
            var childMin = openList[child1 - 1].AStartData.f < openList[child2 - 1].AStartData.f ? child1 : child2;

            openList[head - 1] = openList[childMin - 1];

            head = childMin;
        }
        openList.splice(head - 1, 1);
    }
    private static GetSurroundPoints<T extends MapGrid>(point: T, map: T[][], IsWay: Function): T[]
    {
        var up: T = null;
        var down: T = null;
        var left: T = null;
        var right: T = null;
        var lu: T = null;
        var ru: T = null;
        var ld: T = null;
        var rd: T = null;
        if (point.Index.y < map[0].length - 1)
        {
            up = map[point.Index.x][point.Index.y + 1];
        }
        if (point.Index.y > 0)
        {
            down = map[point.Index.x][point.Index.y - 1];
        }
        if (point.Index.x > 0)
        {
            left = map[point.Index.x - 1][point.Index.y];
        }
        if (point.Index.x < map.length - 1)
        {
            right = map[point.Index.x + 1][point.Index.y];
        }
        if (up != null && left != null)
        {
            lu = map[point.Index.x - 1][point.Index.y + 1];
        }
        if (up != null && right != null)
        {
            ru = map[point.Index.x + 1][point.Index.y + 1];
        }
        if (down != null && left != null)
        {
            ld = map[point.Index.x - 1][point.Index.y - 1];
        }
        if (down != null && right != null)
        {
            rd = map[point.Index.x + 1][point.Index.y - 1];
        }
        var list: T[] = [];
        if (down != null && IsWay(down))
        {
            list.push(down);
        }
        if (left != null && IsWay(left))
        {
            list.push(left);
        }
        if (right != null && IsWay(right))
        {
            list.push(right);
        }
        if (up != null && IsWay(up))
        {
            list.push(up);
        }
        if (lu != null && IsWay(lu) && IsWay(left) && IsWay(up))
        {
            list.push(lu);
        }
        if (ld != null && IsWay(ld) && IsWay(left) && IsWay(down))
        {
            list.push(ld);
        }
        if (ru != null && IsWay(ru) && IsWay(right) && IsWay(up))
        {
            list.push(ru);
        }
        if (rd != null && IsWay(rd) && IsWay(right) && IsWay(down))
        {
            list.push(rd);
        }
        return list;
    }
    private static PointsFilter<T extends MapGrid>(surroundPoints: T[], closeList: T[])
    {
        for (let index = 0; index < closeList.length; index++)
        {
            const element = closeList[index];
            let _index = surroundPoints.indexOf(element);
            if (_index > -1)
            {
                surroundPoints.splice(_index, 1);
            }
        }
    }
    private static CalcG<T extends MapGrid>(surroundPoint: T, parent: T): number
    {
        return Math.abs(Math.sqrt(Math.pow(surroundPoint.Index.x - parent.Index.x, 2) + Math.pow(surroundPoint.Index.y - parent.Index.y, 2))) + parent.AStartData.g;
    }
    private static CalcF<T extends MapGrid>(surroundPoint: T, end: T)
    {
        var h = Math.abs(end.Index.x - surroundPoint.Index.x) + Math.abs(end.Index.y - surroundPoint.Index.y);
        var g = 0;
        if (surroundPoint.AStartData.parent == null)
        {
            g = 0;
        }
        else
        {
            g = Math.abs(Math.sqrt(Math.pow(surroundPoint.Index.x - surroundPoint.AStartData.parent.Index.x, 2) + Math.pow(surroundPoint.Index.y - surroundPoint.AStartData.parent.Index.y, 2))) + surroundPoint.AStartData.parent.AStartData.g;
            // Vector2.Distance(new Vector2(surroundPoint.x, surroundPoint.y), new Vector2(surroundPoint.parent.x, surroundPoint.parent.y)) 
        }
        var f = g + h;
        surroundPoint.AStartData.f = f;
        surroundPoint.AStartData.g = g;
        surroundPoint.AStartData.h = h;
    }
    //#endregion




    //#region 

    // /**
    //  * 优化部分
    //  */


    /**
     * （新增代码）获取生成子节点的Generator
     */
    // private *_getItemGenerator(row: number, col?: number)
    // {
    //     for (var i = 0; i < row; i++)
    //     {
    //         // yield this._initItem(i);
    //     }
    // }
    // /**
    // * 实现分帧加载
    // */
    // async framingLoad(length: number)
    // {
    //     await this.executePreFrame(this._getItemGenerator(length), 1);
    // }
    // /**
    //  * 分帧执行 Generator 逻辑
    //  *
    //  * @param generator 生成器
    //  * @param duration 持续时间（ms）
    //  *          每次执行 Generator 的操作时，最长可持续执行时长。
    //  *          假设值为8ms，那么表示1帧（总共16ms）下，分出8ms时间给此逻辑执行
    //  */
    // private executePreFrame(generator: Generator, duration: number)
    // {
    //     return new Promise<void>((resolve, reject) =>
    //     {
    //         let gen = generator;
    //         // 创建执行函数
    //         let execute = () =>
    //         {

    //             // 执行之前，先记录开始时间戳
    //             let startTime = new Date().getTime();

    //             // 然后一直从 Generator 中获取已经拆分好的代码段出来执行
    //             for (let iter = gen.next(); ; iter = gen.next())
    //             {

    //                 // 判断是否已经执行完所有 Generator 的小代码段
    //                 // 如果是的话，那么就表示任务完成
    //                 if (iter == null || iter.done)
    //                 {
    //                     resolve();
    //                     return;
    //                 }

    //                 // 每执行完一段小代码段，都检查一下是否
    //                 // 已经超过我们分配给本帧，这些小代码端的最大可执行时间
    //                 if (new Date().getTime() - startTime > duration)
    //                 {

    //                     // 如果超过了，那么本帧就不在执行，开定时器，让下一帧再执行
    //                     this.scheduleOnce(() =>
    //                     {
    //                         execute();
    //                     });
    //                     return;
    //                 }
    //             }
    //         };

    //         // 运行执行函数
    //         execute();
    //     });
    // }
    // //#endregion
}
