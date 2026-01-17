import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react'

import neonCityBanner from './assets/neon-city-banner.jpg'
import './App.css'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

// MBTI 相关类型
const dimensionOrder = ['EI', 'SN', 'TF', 'JP'] as const

type DimensionKey = (typeof dimensionOrder)[number]

type Letter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'

interface SceneOption {
  id: 'A' | 'B'
  title: string
  hint: string
  letter: Letter
}

interface Scene {
  id: number
  title: string
  narrative: string
  prompt: string
  dimension: DimensionKey
  options: SceneOption[]
}

type ScenarioId = 'A' | 'B' | 'C' | 'D'

interface ScenarioConfig {
  id: ScenarioId
  title: string
  tagline: string
  description: string
  scenes: Scene[]
}

interface DimensionMetaItem {
  key: DimensionKey
  label: string
  leftLabel: string
  rightLabel: string
  description: string
}

interface DimensionStatsItem {
  leftLetter: Letter
  rightLetter: Letter
  leftScore: number
  rightScore: number
  percent: number
  dominant: Letter | null
}

type DimensionStats = Record<DimensionKey, DimensionStatsItem>

interface MbtiProfile {
  name: string
  description: string
  cooperation: string
}

interface MbtiResult {
  type: string
  letters: Letter[]
  profile: MbtiProfile
}

const dimensionLetters: Record<DimensionKey, [Letter, Letter]> = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P'],
}

const dimensionMeta: DimensionMetaItem[] = [
  {
    key: 'EI',
    label: '能量流向：外向 / 内向',
    leftLabel: 'E 外向',
    rightLabel: 'I 内向',
    description: '你是通过对外连接充电，还是更依靠独处与内在对话恢复能量。',
  },
  {
    key: 'SN',
    label: '信息获取：实感 / 直觉',
    leftLabel: 'S 实感',
    rightLabel: 'N 直觉',
    description: '你是先看见眼前的细节证据，还是更关注背后的模式与可能性。',
  },
  {
    key: 'TF',
    label: '决策方式：思考 / 情感',
    leftLabel: 'T 思考',
    rightLabel: 'F 情感',
    description: '你做决策时更依赖规则与逻辑，还是更在乎人心与关系温度。',
  },
  {
    key: 'JP',
    label: '生活节奏：判断 / 知觉',
    leftLabel: 'J 判断',
    rightLabel: 'P 知觉',
    description: '你偏好计划和确定性，还是偏好保留弹性、顺势而为。',
  },
]

// 赛博朋克危机故事的 20 个场景
const neonCityScenes: Scene[] = [
  {
    id: 1,
    title: '场景 1 · 霓虹告警',
    narrative:
      '午夜零点，霓虹之城的中枢系统突然失控，大屏闪烁，交通灯同时失灵。作为应急指挥官，你站在高处俯瞰混乱的街区，耳边是无数频道的求救声。',
    prompt:
      '在最初的 3 分钟里，你更愿意如何启动行动？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '开启全城广播，号召志愿者快速组队出击',
        hint: '用声音把人聚起来，哪怕现场会很吵也没关系。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '先关掉多余频道，独立静默评估局势后再行动',
        hint: '需要先把全局想清楚，再发出第一条指令。',
        letter: 'I',
      },
    ],
  },
  {
    id: 2,
    title: '场景 2 · 失控源头',
    narrative:
      '城北数据塔的监控画面出现雪花干扰，可能是异常的起点。你获得一次优先取证的机会，只能选择一种方式先启动。',
    prompt: '要追踪异常源头，你会怎么获取线索？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '带队前往现场，逐层排查、采集物证与日志',
        hint: '亲眼看到的烧焦电路和断开的线缆最让你踏实。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '调用历史数据，做模式识别，推演整体趋势',
        hint: '你更关注异常在时间线上的轨迹，而非某一处细节。',
        letter: 'N',
      },
    ],
  },
  {
    id: 3,
    title: '场景 3 · 团队冲突',
    narrative:
      '两名关键工程师在作战指挥室爆发争执：一方坚称是算法缺陷，一方坚持是硬件老化。争执正拖慢修复进度。',
    prompt: '你打算如何裁决这场冲突？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '调出日志和监测数据，按规则与证据冷静裁决',
        hint: '先把事实说清楚，再谈感受，规则面前人人平等。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '先让双方冷静，倾听各自压力与感受后再给方案',
        hint: '人被理解了，才有心力继续和系统对抗。',
        letter: 'F',
      },
    ],
  },
  {
    id: 4,
    title: '场景 4 · 作战蓝图',
    narrative:
      '你需要给全城各小队下达未来 6 小时的行动蓝图：既要保证安全，又要兼顾效率，时间极其紧迫。',
    prompt: '在制定计划这件事上，你更习惯哪种风格？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '为每一阶段设定明确里程碑与严格截止时间',
        hint: '只有把事拆到小时甚至分钟，你才觉得心里有底。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '只框定大致方向，保留弹性方便临场调整',
        hint: '危机多变，太死板的计划反而可能拖后腿。',
        letter: 'P',
      },
    ],
  },
  {
    id: 5,
    title: '场景 5 · 噪声中的沟通',
    narrative:
      '城市网络一度不稳定，你需要和分散在各个区块的小队保持同步，避免信息延迟造成误判。',
    prompt: '此刻，你更倾向用哪种方式推进沟通？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '开启即兴站会语音频道，大家快速口头同步',
        hint: '哪怕信息有点乱，但大家能即时互相打气。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '编写结构化文档，异步更新关键信息与决策',
        hint: '写清楚一次，比重复解释十次更高效。',
        letter: 'I',
      },
    ],
  },
  {
    id: 6,
    title: '场景 6 · 修复方案',
    narrative:
      '技术组给出两套完全不同的修复方案：一套是成熟但略慢的标准流程，一套是未经大规模验证的激进方案。',
    prompt: '在不确定的压力下，你会押注哪一种？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '遵循成熟流程，稳妥推进，优先保证系统稳定',
        hint: '慢一点没关系，关键是不再出新的事故。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '采纳颠覆性设想，尝试一次高收益的捷径',
        hint: '你愿意承担一定风险，只要有机会一击逆转局势。',
        letter: 'N',
      },
    ],
  },
  {
    id: 7,
    title: '场景 7 · 资源分配',
    narrative:
      '备用能源只够维持三处关键设施满负荷运转，你必须在医疗站、数据塔和防御屏障之间做出取舍。',
    prompt: '在这类资源紧张的抉择中，你更看重什么？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '根据影响范围和效率最大化来分配资源',
        hint: '优先保证对全城最有利的节点，哪怕难免有人失望。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '兼顾公平感与团队士气，让每个小队都被照顾',
        hint: '只要大家觉得被尊重，就还有继续坚持的动力。',
        letter: 'F',
      },
    ],
  },
  {
    id: 8,
    title: '场景 8 · 危机尾声',
    narrative:
      '城市终于逐步恢复平静，霓虹灯重新点亮。系统日志中却仍有几条诡异的未解记录，像是有人在黑暗中留下的签名。',
    prompt: '在危机结束后的这一刻，你会怎么收尾？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '召集团队形成一份完整详尽的复盘报告',
        hint: '把每个节点的决策和教训写清楚，下次才能更快更稳。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '保留一支小队，继续探索那些未尽的线索',
        hint: '危机暂息，但你更在意背后真正的故事。',
        letter: 'P',
      },
    ],
  },
  {
    id: 9,
    title: '场景 9 · 前线协作风格',
    narrative:
      '你来到城中心临时指挥帐篷，几十名志愿者与专业人员聚在一起等待分配。时间紧迫，你必须决定协作方式。',
    prompt: '此刻，你更希望团队如何展开协作？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '把所有人拉进一个开放战况频道，边听边现场分派任务',
        hint: '你相信人越多在同一空间交流，信息就越完整。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '按技能拆成若干小组，各自进入安静频道独立推进',
        hint: '你倾向让小队先在各自安静环境里沉淀方案。',
        letter: 'I',
      },
    ],
  },
  {
    id: 10,
    title: '场景 10 · 城市扫描',
    narrative:
      '无人机与地面探测器已经遍布各个街区，你却只能优先处理一类数据，否则系统会卡死。',
    prompt: '你会优先关注哪一类信号？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '聚焦设备异常、电流波动等具体硬件读数',
        hint: '看得见、摸得着的异常，更容易被你锁定。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '聚焦不同区块之间同步出现的奇怪模式',
        hint: '你更好奇这些微妙同步背后的意图与设计。',
        letter: 'N',
      },
    ],
  },
  {
    id: 11,
    title: '场景 11 · 失误回放',
    narrative:
      '一名新加入的值班员在高压之下误触了屏蔽开关，导致一小片街区短暂断电，他明显情绪崩溃。',
    prompt: '你会如何回应这次失误？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '先和他一起复盘流程，梳理问题环节并制定改进规范',
        hint: '你希望用清晰的改进路径，降低类似错误再次发生。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '先让他离开指挥室平复情绪，再在安全空间里聊聊压力与恐惧',
        hint: '你更在意先把人从自责里拉回来，再谈制度。',
        letter: 'F',
      },
    ],
  },
  {
    id: 12,
    title: '场景 12 · 进度失衡',
    narrative:
      '部分小队进展超前，部分却被意外拖住，整体节奏开始失衡。窗口期只有短短几小时。',
    prompt: '此时，你更倾向怎样调整节奏？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '重新收紧整体节奏，为每个小队设定更细致的里程碑',
        hint: '你希望通过重排计划，把所有人拉回同一节奏。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '允许不同小队根据现场状况自由调配顺序和优先级',
        hint: '你相信给一线更多自主权，会激发更灵活的应对。',
        letter: 'P',
      },
    ],
  },
  {
    id: 13,
    title: '场景 13 · 指挥位置',
    narrative:
      '夜色更深，前线传来连环告警，有人建议你亲自下到街区带队，也有人希望你留在高处中枢继续统筹全局。',
    prompt: '在关键时刻，你更愿意把自己放在什么位置？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '冲到街区前线，与队员并肩作战、直接口头指挥',
        hint: '你觉得只有站在同一现场，彼此的热度才会被点燃。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '留在高处指挥室，通过屏幕与加密频道冷静统筹',
        hint: '你更在意保持思路清晰，以全局视角做出判断。',
        letter: 'I',
      },
    ],
  },
  {
    id: 14,
    title: '场景 14 · 可疑日志',
    narrative:
      '数据塔深处出现一串时间戳混乱的日志，有工程师认为只是普通故障，也有人怀疑是精心伪装的入口。',
    prompt: '你打算如何分配排查精力？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '先彻查最明确异常的那几台服务器，逐个排除硬件问题',
        hint: '你习惯沿着最具体的线索一路深挖到底。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '把这串奇怪时间戳当作线索，推演可能的攻击路径',
        hint: '你更想先搞清楚“为什么会这样”，再决定从哪下手。',
        letter: 'N',
      },
    ],
  },
  {
    id: 15,
    title: '场景 15 · 风险通告',
    narrative:
      '你需要向全城社区发送一则“潜在余震”通告，语气与内容会直接影响市民的反应。',
    prompt: '这份通告，你会怎么写？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '用清晰的分级风险说明和数据图表，强调理性判断',
        hint: '信息透明、逻辑严谨，才能避免恐慌蔓延。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '用温和的语气讲清风险，同时承诺对弱势群体的特别照顾',
        hint: '被好好说话和照顾的城市，更容易稳住情绪。',
        letter: 'F',
      },
    ],
  },
  {
    id: 16,
    title: '场景 16 · 夜班规则',
    narrative:
      '危机可能持续整夜，你需要为轮班和休息制定规则。有人主张严格排班，有人觉得过于僵硬。',
    prompt: '关于这份夜班规则，你会怎么定？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '制定详细轮班表和强制休息时间，严格执行不例外',
        hint: '清晰的制度能防止有人硬扛到崩溃。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '给出大致建议，让每个小队现场协商具体轮班安排',
        hint: '你相信团队自己最清楚什么时候该歇一歇。',
        letter: 'P',
      },
    ],
  },
  {
    id: 17,
    title: '场景 17 · 城市情绪修复',
    narrative:
      '危机暂时压下，市民仍心有余悸。城政希望你主导一场“集体安抚”，方式可以很不一样。',
    prompt: '为了修复这座城的情绪，你更想怎么做？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '策划一场线下开放活动，让大家聚在一起讲述与倾听',
        hint: '你相信面对面的交流与热烈的氛围能疗愈人心。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '建立匿名反馈渠道和细致的个别跟进，让人悄悄倾诉',
        hint: '你更倾向用安静、私密的方式慢慢抚平创伤。',
        letter: 'I',
      },
    ],
  },
  {
    id: 18,
    title: '场景 18 · 预警体系',
    narrative:
      '危机接近尾声，城政希望你设计一套长期预警机制，防止类似事故再度发生。',
    prompt: '在建立新系统时，你更愿意把精力投入哪里？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '升级传感器与巡检流程，让每一个物理节点更可靠',
        hint: '你相信坚固的基础设施，胜过再花哨的模型。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '搭建一套预测模型，提前捕捉异常趋势与黑天鹅信号',
        hint: '你更想读懂“风向”，而不仅是修补眼前的漏洞。',
        letter: 'N',
      },
    ],
  },
  {
    id: 19,
    title: '场景 19 · 最后一票',
    narrative:
      '关于是否关闭一片老旧街区的夜间灯牌以节省能源，团队内部再次出现分歧，所有目光最后落在你身上。',
    prompt: '在这一次表决中，你更看重哪一条原则？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '优先从安全与成本角度出发，即使会让一部分人不满',
        hint: '你相信长期稳定比短暂的气氛更重要。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '综合考虑那片街区居民的感受，为他们保留一部分灯光',
        hint: '你在意那些看不见的数据——人们的安心和归属感。',
        letter: 'F',
      },
    ],
  },
  {
    id: 20,
    title: '场景 20 · 未来秩序',
    narrative:
      '黎明将至，你获邀参与重构“霓虹之城危机应对手册”，这将影响之后每一次警报被如何处理。',
    prompt: '如果由你来定调，你更偏好怎样的手册？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '条目清晰、流程完整的操作手册，几乎覆盖所有情景',
        hint: '你希望任何人只要按图索骥，就能稳定完成任务。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '简明的原则与少量关键节点，留出大量现场发挥空间',
        hint: '你更愿意把选择权交给未来的执行者。',
        letter: 'P',
      },
    ],
  },
]

const starportFleetScenes: Scene[] = [
  {
    id: 1,
    title: '场景 1 · 星港告警',
    narrative:
      '环绕行星的星港舰队收到来自深空的异常信号，雷达屏上闪烁着未知频段。作为联队指挥官，你正站在旗舰指挥甲板上。',
    prompt: '第一次告警响起时，你更想如何启动应对？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '打开全舰队公共频道，召集各舰舰长同步现状与想法',
        hint: '你希望先把所有人拉进同一个对话空间，再定方向。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '暂时收窄频道，只保留核心技术组进行安静研判',
        hint: '你更想先弄清信号本身，再决定如何对外沟通。',
        letter: 'I',
      },
    ],
  },
  {
    id: 2,
    title: '场景 2 · 信号解码',
    narrative:
      '情报官把异常波段的采样数据推送到你的控制台，有人说这只是宇宙噪声，有人坚称这是有意为之的编码。',
    prompt: '你想先从哪类线索入手？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '调取更多原始波形，对比以往记录，排查设备与环境因素',
        hint: '你习惯先把看得见的硬件和环境问题排除干净。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '把信号拆解成模式片段，推演可能的语义与意图',
        hint: '你更在意这串波动背后是否藏着某种逻辑。',
        letter: 'N',
      },
    ],
  },
  {
    id: 3,
    title: '场景 3 · 舰桥争论',
    narrative:
      '情报官和安全官在舰桥上发生争执：前者主张继续接收更多信号，后者坚持立即屏蔽未知来源以免暴露坐标。',
    prompt: '你会怎样介入这场争论？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '依据风险评估数据和既定安全协议做出裁决',
        hint: '你倾向用规则和概率来说明哪一边更合理。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '先安抚双方情绪，理解各自顾虑，再寻找折中的方案',
        hint: '你更想让每个人都感到被听见，而不是被驳回。',
        letter: 'F',
      },
    ],
  },
  {
    id: 4,
    title: '场景 4 · 侦察计划',
    narrative:
      '舰队需要制定一套针对未知信号的侦察计划，窗口期可能只有一轮轨道周期。',
    prompt: '在规划侦察行动时，你更倾向怎样的风格？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '为每一艘侦察舰设定精确航线和时间表，严格按照脚本执行',
        hint: '你相信细致的计划能把风险压到最低。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '给出大致区域和任务目标，让各舰根据现场情况灵活应对',
        hint: '你觉得临场判断比纸面上的路线图更重要。',
        letter: 'P',
      },
    ],
  },
  {
    id: 5,
    title: '场景 5 · 舰队动员',
    narrative:
      '侦察计划即将下发，你需要向全舰队进行动员，解释这次行动的意义与风险。',
    prompt: '在这样的场合，你更习惯怎样对全员讲话？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '开启全舰直播，用热烈的演讲点燃大家的士气',
        hint: '你相信看得见的激情能让人更愿意跟随行动。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '通过加密简报和文字说明，让各级指挥官转述关键信息',
        hint: '你更倾向在有限的人之间把话讲清楚，再向下传递。',
        letter: 'I',
      },
    ],
  },
  {
    id: 6,
    title: '场景 6 · 轨道扫描',
    narrative:
      '侦察舰已经分布到不同轨道，高精度探测器开始回传环境数据。处理能力有限，你只能优先分析一类信息。',
    prompt: '此刻你会把算力优先用在什么上？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '聚焦船体与传感器读数，确认是否存在设备异常',
        hint: '你想先排除所有“自己这边”的问题，再谈外部威胁。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '聚焦多点同时出现的微妙波动，寻找潜在的整体模式',
        hint: '你更留意那些难以用偶然解释的同步变化。',
        letter: 'N',
      },
    ],
  },
  {
    id: 7,
    title: '场景 7 · 舰员焦虑',
    narrative:
      '长时间待命让部分舰员开始焦虑，有人提出质疑：这次行动是否值得冒险？',
    prompt: '你准备如何回应前线舰员的担忧？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '用任务目标、成功概率和回报数据解释行动必要性',
        hint: '你相信只要逻辑足够清晰，大家就会理解。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '先肯定他们的压力与恐惧，再说明你会尽力保护每个人',
        hint: '你更愿意先接住情绪，再谈理性。',
        letter: 'F',
      },
    ],
  },
  {
    id: 8,
    title: '场景 8 · 舰队节奏',
    narrative:
      '部分侦察舰进展顺利，部分却因小事故频频返航，整体节奏被拉扯得很分散。',
    prompt: '你会如何重新梳理舰队的行动节奏？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '重新收紧时间线，为每支舰队设定更细致的里程碑',
        hint: '你希望通过统一节奏，减少彼此的干扰与误差。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '允许不同舰队根据自身状况自由调整节奏和优先级',
        hint: '你相信放权给一线可以激发更灵活的应对。',
        letter: 'P',
      },
    ],
  },
  {
    id: 9,
    title: '场景 9 · 旗舰位置',
    narrative:
      '未知信号的源头似乎就在舰队前方不远处，有人建议你让旗舰靠近以便第一时间观察。',
    prompt: '你更愿意把自己放在怎样的位置？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '指挥旗舰亲自靠前，与前线侦察舰并肩推进',
        hint: '你更喜欢站在事件中心，用存在感稳定军心。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '让其他舰只靠前，自己留在后方节点统筹全局',
        hint: '你更看重全局视角和对信息的冷静整合。',
        letter: 'I',
      },
    ],
  },
  {
    id: 10,
    title: '场景 10 · 奇异轨迹',
    narrative:
      '导航官报告有一串微弱的航迹残留，似乎是某种舰船留下的，但轨迹极不规则。',
    prompt: '你打算如何解读这串轨迹？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '先验证是否为己方或已知文明的标准机动轨迹',
        hint: '你希望用数据库把“熟悉的部分”先匹配出来。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '把这串轨迹当作谜题，推测对方可能的行动模式与目的',
        hint: '你更关注这些不规则背后的意图。',
        letter: 'N',
      },
    ],
  },
  {
    id: 11,
    title: '场景 11 · 决策分歧',
    narrative:
      '一部分舰长主张立即撤退，以免卷入未知冲突；另一部分则希望继续接近，认为这是少有的机会。',
    prompt: '作为联队指挥，你会怎么定调？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '根据风险收益比与联邦条约条款说明必须谨慎撤离',
        hint: '你更看重舰队和任务本身的安全边界。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '倾听各舰长的心声，寻找能兼顾勇气与安全感的方案',
        hint: '你不想让任何一方觉得自己的担忧被忽略。',
        letter: 'F',
      },
    ],
  },
  {
    id: 12,
    title: '场景 12 · 作战模板',
    narrative:
      '总部传来建议，可以沿用以往对未知文明的接触模板，也可以由舰队自行设计新的流程。',
    prompt: '你会如何选择应对流程？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '严格遵循总部下发的标准模板，逐条执行',
        hint: '你相信成熟流程是无数次经验的凝结。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '以总部模板为参考，自行拼接更适合当前局面的流程',
        hint: '你希望为这次独特局面留下一些自由设计空间。',
        letter: 'P',
      },
    ],
  },
  {
    id: 13,
    title: '场景 13 · 舰内沟通',
    narrative:
      '旗舰内部部门众多，各自掌握不同信息。有同事建议你多举办跨部门会议，也有人建议减少打扰。',
    prompt: '你更倾向怎样组织舰内沟通？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '频繁召开跨部门实时会议，鼓励当面讨论与碰撞',
        hint: '你觉得只有把人聚到一起，信息和信任才会流动。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '尽量通过文档与异步渠道，让各组在安静环境下吸收信息',
        hint: '你更偏好少而精的沟通，而不是高频打扰。',
        letter: 'I',
      },
    ],
  },
  {
    id: 14,
    title: '场景 14 · 数据残片',
    narrative:
      '技术组从信号中拆出几个似乎重复出现的数据片段，有人认为那只是噪声，有人觉得是坐标或时间标记。',
    prompt: '你打算优先如何处理这些残片？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '先检查采集与传输链路，确认这些残片是否源自系统误差',
        hint: '你想把所有“自家系统”的问题先排除在外。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '把残片当作密码，尝试在时间轴或星图上寻找对应',
        hint: '你更想看看这些碎片能拼出怎样的整体画面。',
        letter: 'N',
      },
    ],
  },
  {
    id: 15,
    title: '场景 15 · 公告措辞',
    narrative:
      '你需要向星港居民发布一则关于“未知信号”的简短公告，以免谣言扩散。',
    prompt: '这份通告，你会怎样写？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '用清晰的风险分级和技术说明，强调情况在掌控之中',
        hint: '你希望用信息透明减少恐慌。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '用温和的语气安抚情绪，并强调对居民安全的承诺',
        hint: '你更想让大家感到被照顾，而不是被告知。',
        letter: 'F',
      },
    ],
  },
  {
    id: 16,
    title: '场景 16 · 值班轮换',
    narrative:
      '未知信号可能随时再次出现，舰队需要进入长时间戒备状态，你必须设计新的值班轮换制度。',
    prompt: '关于值班规则，你更倾向哪种方式？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '制定严谨的值班表和强制休息时间，不允许随意更改',
        hint: '你相信清晰的制度能防止出现精疲力竭的失误。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '只给出大致轮换建议，允许各舰根据状态灵活调整',
        hint: '你认为一线指挥最清楚自己什么时候该休息。',
        letter: 'P',
      },
    ],
  },
  {
    id: 17,
    title: '场景 17 · 联邦连线',
    narrative:
      '联邦议会请求与你连线，希望听到第一手情况并给出政治层面的建议。',
    prompt: '面对这次高层连线，你更想怎样组织这场对话？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '让多名关键岗位代表一起参加，现场共同回答议会提问',
        hint: '你希望用多人视角展示舰队的专业与决心。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '由你一人代表舰队，与小范围顾问团队事先打磨话术',
        hint: '你更倾向在充分准备后统一口径对外发声。',
        letter: 'I',
      },
    ],
  },
  {
    id: 18,
    title: '场景 18 · 预警系统',
    narrative:
      '联邦提议以本次事件为契机，升级整个星区的深空预警系统，由你提出初步方案。',
    prompt: '在设计预警系统时，你更愿意把重点放在哪里？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '增加更多物理探测器和校准流程，提升基础硬件可靠性',
        hint: '你认为扎实的硬件基础是所有预警的前提。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '投入资源构建预测模型，提前捕捉异常模式与潜在威胁',
        hint: '你更想让系统学会“预感”风险而不只是记录。',
        letter: 'N',
      },
    ],
  },
  {
    id: 19,
    title: '场景 19 · 最终汇报',
    narrative:
      '行动接近尾声，你需要向全舰队做一次总结汇报，既是复盘也是告别。',
    prompt: '这次汇报，你更想突出什么？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '重点复盘决策链路与关键数据，用事实说明这次行动的价值',
        hint: '你希望每个人都看到自己努力在系统中的位置。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '重点讲述每支舰队的故事和情感瞬间，强调彼此的支持',
        hint: '你更在意这段经历如何改变了这群人。',
        letter: 'F',
      },
    ],
  },
  {
    id: 20,
    title: '场景 20 · 舰队未来',
    narrative:
      '未知信号渐渐远去，舰队即将恢复常规巡航，你被邀请撰写一份“星港舰队未来行动纲要”。',
    prompt: '如果由你来定调，你更偏好怎样的纲要？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '条理清晰、流程完整的行动手册，覆盖各类极端场景',
        hint: '你希望任何船长都能按图索骥稳稳执行。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '简洁的原则与关键节点说明，留出充分现场裁量权',
        hint: '你更愿意把选择权交给未来在星空中航行的人。',
        letter: 'P',
      },
    ],
  },
]

const oasisOasisScenes: Scene[] = [
  {
    id: 1,
    title: '场景 1 · 沙暴预警',
    narrative:
      '一场罕见的沙暴正朝绿洲推进，补给车队和商队纷纷请求指示。你作为绿洲协调者站在瞭望塔上，能见度迅速下降。',
    prompt: '沙暴来临前的第一时间，你更想先做什么？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '拉响广场广播，召集所有人到中央营地集中听令',
        hint: '你希望通过现场集结来稳定人心。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '先与核心管委会在会议室快速闭门商量对策',
        hint: '你更想先形成清晰方案，再面对人群。',
        letter: 'I',
      },
    ],
  },
  {
    id: 2,
    title: '场景 2 · 资源盘点',
    narrative:
      '沙尘遮蔽了补给线路，你只收到零散库存数据：水囊、燃料和医疗物资都有限。',
    prompt: '你会先怎样确认当前资源状况？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '派人逐个仓库清点库存，核对账本与实物',
        hint: '你习惯用手上的实际数字说话。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '根据过往消耗模式快速推演未来几天的需求曲线',
        hint: '你更在意整体趋势而非单次盘点结果。',
        letter: 'N',
      },
    ],
  },
  {
    id: 3,
    title: '场景 3 · 帐篷争执',
    narrative:
      '两个商队为避风位置发生冲突，一方认为自己缴纳税金更多，另一方强调携带了关键医疗物资。',
    prompt: '你会如何裁决这场争执？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '按照既定规则与贡献记录，分配最安全的位置',
        hint: '你更看重制度的公正性。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '先听双方的难处，尽量照顾彼此的情绪和关系',
        hint: '你更在意人心是否还能团结在一起。',
        letter: 'F',
      },
    ],
  },
  {
    id: 4,
    title: '场景 4 · 夜间戒备',
    narrative:
      '沙暴将至，绿洲夜间必须加强戒备，防止有人趁乱盗取水源或闯入粮仓。',
    prompt: '你会如何设计今晚的巡逻计划？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '制定精确的巡逻路线和时间表，写入值班板',
        hint: '你希望每个人都清楚自己什么时候出现在哪里。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '只划定重点区域，让巡逻队根据现场状况灵活移动',
        hint: '你认为留一点机动空间更好应对突发情况。',
        letter: 'P',
      },
    ],
  },
  {
    id: 5,
    title: '场景 5 · 集市广播',
    narrative:
      '白天的绿洲集市仍喧闹，部分居民似乎并未意识到沙暴的严重性。',
    prompt: '你准备如何向大多数人传达风险？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '站上集市高台，当众说明形势并安排撤离顺序',
        hint: '你习惯用现场的号召力推动行动。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '让各街区负责人逐户通知，并发放书面指引',
        hint: '你更偏好安静而细致的沟通方式。',
        letter: 'I',
      },
    ],
  },
  {
    id: 6,
    title: '场景 6 · 水源异常',
    narrative:
      '监测员报告主水井水位下降异常，可能是蒸发加剧，也可能有人暗中取水。',
    prompt: '你会如何追查原因？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '立刻封锁井口，检查管道和阀门是否存在损坏或漏水',
        hint: '你想先确认物理设施是否完好。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '调取近期用水记录，分析是否有异常用水模式',
        hint: '你更加在意背后是否有人为操纵。',
        letter: 'N',
      },
    ],
  },
  {
    id: 7,
    title: '场景 7 · 份额分配',
    narrative:
      '沙暴期间外部补给难以到达，你必须重新划分水和口粮的配给份额。',
    prompt: '面对有限物资，你会如何优先分配？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '按照工种重要程度和劳动强度优先保障关键岗位',
        hint: '你希望保证绿洲在功能上不被拖垮。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '尽量照顾弱者和家庭，让每个人都感到被公平对待',
        hint: '你更在意整体士气和信任是否还能维持。',
        letter: 'F',
      },
    ],
  },
  {
    id: 8,
    title: '场景 8 · 临时规则',
    narrative:
      '为了应对沙暴期，你可以颁布临时管理条例，但执行过严或过松都可能引发问题。',
    prompt: '你会怎样设计这套临时规则？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '细化到每项行为的允许与禁止，让所有人一目了然',
        hint: '你希望用明确边界避免争议。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '只给出几条底线，其他细节交给街区自律协商',
        hint: '你更愿意让各自社区找到适合自己的节奏。',
        letter: 'P',
      },
    ],
  },
  {
    id: 9,
    title: '场景 9 · 议事方式',
    narrative:
      '绿洲长老会与青年代表对资源政策有不同看法，有人希望开一场所有人都能参加的大型议事会。',
    prompt: '你更赞成怎样的议事形式？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '举行开放大会，让所有声音在同一个场合碰撞',
        hint: '你相信公开讨论更能建立共识。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '先分别听取代表意见，再由小范围会议形成折衷方案',
        hint: '你更偏好在相对安静的环境中调和分歧。',
        letter: 'I',
      },
    ],
  },
  {
    id: 10,
    title: '场景 10 · 商队情报',
    narrative:
      '一支晚到的商队带来了“北侧绿洲枯竭”的传闻，但细节支离破碎。',
    prompt: '你会如何判断这则情报的价值？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '详细询问他们的途经时间、路径和见到的具体场景',
        hint: '你想先弄清楚到底发生了什么。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '把这则传闻放入更大的局势中，推测区域水资源的新格局',
        hint: '你更关心这背后隐藏的趋势变化。',
        letter: 'N',
      },
    ],
  },
  {
    id: 11,
    title: '场景 11 · 违规取水',
    narrative:
      '巡逻队抓到一名少年夜间擅自取水，他声称是为了生病的母亲。',
    prompt: '你会如何处理这起违规事件？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '按照条例进行处罚，以儆效尤，防止更多人效仿',
        hint: '你担心一旦放松会破坏整个资源秩序。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '先确认母亲的情况，再考虑用其他方式补足这家人的需要',
        hint: '你更想在规则与同情之间找到平衡。',
        letter: 'F',
      },
    ],
  },
  {
    id: 12,
    title: '场景 12 · 绿洲蓝图',
    narrative:
      '工程师展示了一份未来绿洲扩建蓝图，可以提前为更多居民预留空间。',
    prompt: '在规划绿洲未来时，你更偏好哪种图景？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '详细规划每一块区域的用途，确保资源与居住合理分布',
        hint: '你喜欢在一张图纸上看到秩序感。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '只确定核心功能区，让边缘空间保留给未来的可能',
        hint: '你愿意给后来的居民留下一些自己安排的自由。',
        letter: 'P',
      },
    ],
  },
  {
    id: 13,
    title: '场景 13 · 庇护所分工',
    narrative:
      '沙暴期间，大型岩洞被改造为临时庇护所，需要大量志愿者维持秩序。',
    prompt: '你会怎样组织庇护所内部的协作？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '在洞口设立指挥台，实时向所有人广播任务和变化',
        hint: '你习惯通过现场喊话维持节奏。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '把任务写在墙上的清单上，让志愿者自行领取并反馈',
        hint: '你相信安静有序的自组织同样可以运转良好。',
        letter: 'I',
      },
    ],
  },
  {
    id: 14,
    title: '场景 14 · 地下水文',
    narrative:
      '新来的地质学家展示了一张地下水脉分布图，暗示绿洲可能存在尚未开发的水源。',
    prompt: '你会如何利用这份信息？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '先在最有可能的几个点做小规模勘探，验证图纸可靠性',
        hint: '你想一步步确认这些标记是否真实。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '把这张图当成长期规划的核心依据，重构整个绿洲布局',
        hint: '你已经在脑中描绘新的资源网络。',
        letter: 'N',
      },
    ],
  },
  {
    id: 15,
    title: '场景 15 · 议和书信',
    narrative:
      '邻近部落发来使者，希望在沙暴后协商一份长期资源互换协议。',
    prompt: '你会如何书写回信的基调？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '用清晰条款和条件限定双方责任与收益',
        hint: '你希望一开始就把边界讲明白。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '强调友谊与信任，留下更多余地在面对面时慢慢谈',
        hint: '你更看重关系的温度能走得更远。',
        letter: 'F',
      },
    ],
  },
  {
    id: 16,
    title: '场景 16 · 日程安排',
    narrative:
      '沙暴可能持续数日，你需要制定这几天的公共活动与劳动安排。',
    prompt: '在日程设计上，你更倾向哪种方式？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '把每天的工作、休息和公共活动安排到具体时段',
        hint: '你觉得清晰的节奏能缓解大家的不安。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '只确定关键任务，其他时间由各家自行安排',
        hint: '你相信每个家庭最清楚自己的步调。',
        letter: 'P',
      },
    ],
  },
  {
    id: 17,
    title: '场景 17 · 沙暴后的广场',
    narrative:
      '沙暴渐息，广场上的风雕塑出新的沙丘，人们开始从帐篷中走出。',
    prompt: '为了修复大家的情绪，你更想做什么？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '组织一场简短的庆祝仪式，让大家在歌声中重启生活',
        hint: '你相信集体的笑声能冲淡恐惧。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '设立倾听角落，让愿意分享的人单独讲述这几天的故事',
        hint: '你希望给每个人一点安静说话的空间。',
        letter: 'I',
      },
    ],
  },
  {
    id: 18,
    title: '场景 18 · 长期储备',
    narrative:
      '经历这次危机后，绿洲议会决定建立更稳固的战略储备体系。',
    prompt: '你在设计储备机制时，更注重哪一块？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '增加实体仓库和水池容量，确保物理储备充足',
        hint: '你觉得看得见的库存最让人安心。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '建立动态预警模型，根据风向和贸易流量调整储备规模',
        hint: '你更看重体系能否提前感知风险。',
        letter: 'N',
      },
    ],
  },
  {
    id: 19,
    title: '场景 19 · 绿洲故事',
    narrative:
      '旅人们准备离开绿洲，你被邀请在篝火旁讲述这几天的故事。',
    prompt: '在这段讲述中，你更想强调什么？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '强调决策节点和学到的教训，帮助大家记住方法',
        hint: '你希望下次遇到危机时能更理性地应对。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '分享一个个普通人的片段，感谢每个人的坚持',
        hint: '你更在意这段经历如何被放进大家的记忆里。',
        letter: 'F',
      },
    ],
  },
  {
    id: 20,
    title: '场景 20 · 绿洲宪章',
    narrative:
      '议会希望把这次事件整理成一份《绿洲宪章》，指导未来每次资源危机的应对。',
    prompt: '如果由你来写这份宪章，你更偏好怎样的结构？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '条理分明、章节完整的操作性规范，覆盖常见场景',
        hint: '你希望任何继任者都能据此直接行动。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '简洁的价值宣言加少数关键原则，为不同时代保留弹性',
        hint: '你更愿意把具体做法交给未来的人去摸索。',
        letter: 'P',
      },
    ],
  },
]

const snowMountainRescueScenes: Scene[] = [
  {
    id: 1,
    title: '场景 1 · 暴雪预报',
    narrative:
      '山脊上的气象站发来红色预警，一场百年一遇的暴雪即将压向基地和前线营地。',
    prompt: '第一时间，你更想如何组织人手？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '在食堂集结所有队员，当面说明状况并分配任务',
        hint: '你觉得面对面的动员更有力量。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '只召集核心小队长，在指挥室安静制定方案',
        hint: '你希望先把思路理顺，再把任务往下拆。',
        letter: 'I',
      },
    ],
  },
  {
    id: 2,
    title: '场景 2 · 冰层观测',
    narrative:
      '无人机回传的画面显示部分冰壁出现裂隙，有可能在暴雪中引发雪崩。',
    prompt: '你会优先关注哪类数据？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '检查温度、风速和积雪厚度等具体指标',
        hint: '你想知道物理条件是否达到危险阈值。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '结合历年事故记录，推演这次暴雪可能触发的连锁反应',
        hint: '你更关注整体地形与历史之间的模式。',
        letter: 'N',
      },
    ],
  },
  {
    id: 3,
    title: '场景 3 · 绳队分歧',
    narrative:
      '两支绳队就是否立即撤回高线路点位产生争论，一方担心雪崩，一方认为撤离太早会影响任务。',
    prompt: '你会如何做出判断？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '依据风险评估表和任务优先级，给出清晰指令',
        hint: '你倾向用标准和数据说服所有人。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '先听清每支队伍的顾虑和压力，再寻找能让他们安心的方案',
        hint: '你更想让所有人带着被理解的感觉行动。',
        letter: 'F',
      },
    ],
  },
  {
    id: 4,
    title: '场景 4 · 应急预案',
    narrative:
      '基地原有的应急预案偏向低强度风雪，而这次暴雪级别远超过去记录。',
    prompt: '你会如何调整应急预案？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '在现有预案基础上逐条升级，梳理完整的新流程',
        hint: '你想确保每一步都被考虑到。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '抓住最关键的几条原则，留出更多临场决断空间',
        hint: '你认为前线队长需要自由度来应对突变。',
        letter: 'P',
      },
    ],
  },
  {
    id: 5,
    title: '场景 5 · 呼叫方式',
    narrative:
      '前线营地通讯不稳，你需要在短时间内向各小队发出警报。',
    prompt: '你更倾向用哪种方式通知大家？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '反复呼叫公共频段，确保每个人都在同一频道上听到信息',
        hint: '你希望形成一种「大家一起」面对的感觉。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '优先联系关键队长，请他们分头在各自队伍内传达',
        hint: '你更相信小范围清晰沟通再向外扩散。',
        letter: 'I',
      },
    ],
  },
  {
    id: 6,
    title: '场景 6 · 雪层测试',
    narrative:
      '气象组提出两种方案：一是扩大雪坑测试点位，二是用模型模拟不同坡面崩塌概率。',
    prompt: '在时间有限的情况下，你会怎么决定？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '优先派人去关键坡面实测雪层稳定性',
        hint: '你更信任实地测出来的结果。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '先用模型跑一遍整体风险，再决定具体测试点',
        hint: '你习惯先从全局模式入手，再看局部。',
        letter: 'N',
      },
    ],
  },
  {
    id: 7,
    title: '场景 7 · 队员失误',
    narrative:
      '一名新队员在搬运物资时滑倒，差点撞翻燃料桶，他情绪十分自责。',
    prompt: '你会如何回应这次险情？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '马上召集安全会议，梳理操作流程并强调规范',
        hint: '你希望通过制度防止类似情况再次发生。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '先安慰队员，确认他没有受伤，再在一对一的对话里复盘',
        hint: '你更想先保护人的状态，再谈改进。',
        letter: 'F',
      },
    ],
  },
  {
    id: 8,
    title: '场景 8 · 营地布置',
    narrative:
      '你需要为可能的滞留设计营地布局，包括帐篷位置、物资堆放和急救点。',
    prompt: '在营地规划时，你会怎样安排？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '按功能严格划区，给每个区域规定清晰边界和路线',
        hint: '你觉得秩序会在混乱时保护大家。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '只确定核心区域位置，让队伍根据实际情况灵活搭建',
        hint: '你相信队员能敏锐感知当下最安全的布置方式。',
        letter: 'P',
      },
    ],
  },
  {
    id: 9,
    title: '场景 9 · 通讯窗口',
    narrative:
      '山谷通讯只在短暂的间隙中恢复，你需要决定是否开放给队员与家属通话。',
    prompt: '你会如何安排这段宝贵的通讯窗口？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '集中安排一个时间，让大家排队简短通话',
        hint: '你希望制造一种全营共同连接外界的瞬间。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '只开放给压力最大的前线队员，避免过度分心',
        hint: '你更看重关键岗位状态的稳定。',
        letter: 'I',
      },
    ],
  },
  {
    id: 10,
    title: '场景 10 · 足迹线索',
    narrative:
      '侦察组在风雪中发现一串偏离既定路线的足迹，可能属于失联登山者。',
    prompt: '你会如何解读这串足迹？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '先确认足迹新旧和方向，判断是否值得立即派队跟进',
        hint: '你希望掌握尽可能多的现场细节。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '结合天气变化和地形，推测对方可能的行进意图和落脚点',
        hint: '你更习惯从轨迹背后读出故事。',
        letter: 'N',
      },
    ],
  },
  {
    id: 11,
    title: '场景 11 · 救援优先级',
    narrative:
      '同时收到两起求救信号：一处是重伤队员，一处是被困整队人在山脊上。',
    prompt: '在资源不足以同时支援时，你会怎么排优先级？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '从人数和生存概率出发，优先支援整体风险更高的一队',
        hint: '你更重视总体成功率。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '考虑到亲属和队员情绪，综合衡量两边的情感牵绊',
        hint: '你不希望任何一个决定被视为冷酷。',
        letter: 'F',
      },
    ],
  },
  {
    id: 12,
    title: '场景 12 · 路线调整',
    narrative:
      '原定的救援路线因雪崩风险被封锁，你必须在几条备选路线中做出快速选择。',
    prompt: '你会如何更新救援计划？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '重新绘制一份完整路线图，并明确各检查点时间',
        hint: '你希望所有人都带着同一份地图出发。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '确定几个关键集合点，其余路段交给带队队长视情况决策',
        hint: '你相信现场感知比纸面预案更重要。',
        letter: 'P',
      },
    ],
  },
  {
    id: 13,
    title: '场景 13 · 营火旁',
    narrative:
      '暴雪间隙，营地里点起少量营火，有人建议开一个简短的分享会缓解压抑气氛。',
    prompt: '你会如何看待这样的提议？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '支持大家围在一起讲故事，让紧绷的情绪有出口',
        hint: '你觉得集体的温度能帮人扛过艰难时刻。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '担心影响休息和体力恢复，更倾向于小范围安静交流',
        hint: '你更在意第二天是否还有足够精力执行任务。',
        letter: 'I',
      },
    ],
  },
  {
    id: 14,
    title: '场景 14 · 雪坑记录',
    narrative:
      '技术员向你展示过去几年在山脊雪坑测试的数据曲线，提示这次暴雪的异常频率。',
    prompt: '你会如何利用这些历史记录？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '对比当前数据，确认这次是否已经超出安全边界',
        hint: '你首先想知道“现在到底危险到什么程度”。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '把这次视为长期气候变化的一部分，思考未来基地布局',
        hint: '你在意这场暴雪对整体格局的暗示。',
        letter: 'N',
      },
    ],
  },
  {
    id: 15,
    title: '场景 15 · 冒险申请',
    narrative:
      '一支经验丰富的小队自愿冒更高风险前往一个几乎断联的高地营地。',
    prompt: '面对他们的申请，你会怎样回应？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '根据风险评估严格限制他们的行动范围，避免过度冒险',
        hint: '你认为领导者有责任约束英雄主义。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '认可他们的勇气，与他们一起讨论如何在可接受风险内前进',
        hint: '你希望在尊重意愿的同时尽量保护他们。',
        letter: 'F',
      },
    ],
  },
  {
    id: 16,
    title: '场景 16 · 夜间值守',
    narrative:
      '暴雪最猛烈的时段在深夜，你需要安排谁守在无线电旁，谁能强制睡觉。',
    prompt: '你会如何排布这段夜班？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '制定明确轮班表，严格执行，不允许临时互换',
        hint: '你想确保每个人都有被睡眠保护到。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '给出大致框架，让队员根据彼此状态弹性调整值班',
        hint: '你相信队员会彼此照看好节奏。',
        letter: 'P',
      },
    ],
  },
  {
    id: 17,
    title: '场景 17 · 雪停之后',
    narrative:
      '大雪终于渐弱，白茫茫的山谷被阳光照亮，失联队伍的位置仍未完全确认。',
    prompt: '雪停后的第一波行动，你更想怎么安排？',
    dimension: 'EI',
    options: [
      {
        id: 'A',
        title: '亲自带队出发，在雪原上第一时间寻找踪迹',
        hint: '你觉得自己在前线更能给队员安全感。',
        letter: 'E',
      },
      {
        id: 'B',
        title: '留在基地协调多支救援队，保证信息和支援不断线',
        hint: '你更看重有人在后方统筹全局。',
        letter: 'I',
      },
    ],
  },
  {
    id: 18,
    title: '场景 18 · 未来预警',
    narrative:
      '总部希望以这次事件为样本，建立一套更智能的高山预警系统。',
    prompt: '在提出建议时，你更关注哪一块？',
    dimension: 'SN',
    options: [
      {
        id: 'A',
        title: '升级各个观测点的硬件和线路，确保数据准确无误',
        hint: '你认为只有基础牢靠，预警才有意义。',
        letter: 'S',
      },
      {
        id: 'B',
        title: '整合历史数据和本次经历，建立预测模型和风险地图',
        hint: '你希望系统可以“提前感到不对劲”。',
        letter: 'N',
      },
    ],
  },
  {
    id: 19,
    title: '场景 19 · 座谈会',
    narrative:
      '营地准备为这次参与救援的队员办一场小型座谈，媒体也可能到场。',
    prompt: '在这次分享中，你更想突出什么？',
    dimension: 'TF',
    options: [
      {
        id: 'A',
        title: '强调科学决策和团队协作的流程，让更多人理解专业价值',
        hint: '你希望外界看到理性和专业的一面。',
        letter: 'T',
      },
      {
        id: 'B',
        title: '讲述队员们互相扶持的片段，让大家感受到温度',
        hint: '你更在意这段经历在人心里留下的痕迹。',
        letter: 'F',
      },
    ],
  },
  {
    id: 20,
    title: '场景 20 · 山谷手册',
    narrative:
      '你被邀请参与编写一份《高山救援手册》，为未来每一次登山季提供参考。',
    prompt: '如果由你来定调，你更希望这本手册呈现怎样的风格？',
    dimension: 'JP',
    options: [
      {
        id: 'A',
        title: '详尽覆盖各类情况的操作指南，配以清晰流程图',
        hint: '你希望任何新加入的人都能照本执行。',
        letter: 'J',
      },
      {
        id: 'B',
        title: '以故事和原则为主，辅以少量关键步骤提示',
        hint: '你觉得每一代救援者都该在此基础上写下自己的做法。',
        letter: 'P',
      },
    ],
  },
]

const scenarios: ScenarioConfig[] = [
  {
    id: 'A',
    title: '霓虹之城 · 危机应对',
    tagline: '城市核心系统紊乱',
    description:
      '城市核心系统紊乱，在信息不对称和时间压力下，从集结、排查、调度到黎明复盘的一夜危机，应对方式映照你的行事风格。',
    scenes: neonCityScenes,
  },
  {
    id: 'B',
    title: '星港舰队 · 未知信号',
    tagline: '深空回声与联队抉择',
    description:
      '深空星港捕获诡异信号，你在跨舰队协作中推进侦察、情报共享与风险决策，在宇宙暗面中摸索真相与边界。',
    scenes: starportFleetScenes,
  },
  {
    id: 'C',
    title: '沙漠绿洲 · 资源博弈',
    tagline: '补给线动摇下的人心与秩序',
    description:
      '荒漠补给线被扰动，你在水源、粮食与人心之间反复权衡，既要守住绿洲秩序，又要保障弱者与未来发展。',
    scenes: oasisOasisScenes,
  },
  {
    id: 'D',
    title: '雪山基地 · 极限救援',
    tagline: '暴雪封山时的每一拍选择',
    description:
      '极端风雪中前哨基地失联，你在崩塌边缘做出节奏与路线决定，在效率与安全之间寻找极限救援的平衡点。',
    scenes: snowMountainRescueScenes,
  },
]

// 16 种 MBTI 类型中文档案（简化娱乐向）
const mbtiProfiles: Record<string, MbtiProfile> = {
  INTJ: {
    name: '策划者',
    description:
      '你像城中静默运转的中枢主脑，擅长从混乱中抽丝剥茧，为系统设计长远而精密的蓝图。你喜欢先想清楚底层逻辑，再给出一锤定音的决策。',
    cooperation:
      '与 INTJ 合作时，给足思考空间，提前提供完整信息，并尊重 TA 对长期结构与风险的敏感度，会获得强大的战略支持。',
  },
  INTP: {
    name: '架构寻路者',
    description:
      '你像在数据迷宫中漫游的代码考古学家，对一切系统的原理与异常充满好奇。你乐于拆解问题、提出新假设，而不急于做结论。',
    cooperation:
      '与 INTP 合作时，多抛给 TA 有趣的难题，允许试错与讨论，帮 TA 把想法落地到具体执行，会产生很多意外的灵感火花。',
  },
  ENTJ: {
    name: '指挥官',
    description:
      '你像危机中的总指挥塔，擅长快速整合资源、分配任务，把复杂局面切成一条条可执行的路径，并推动所有人朝目标冲刺。',
    cooperation:
      '与 ENTJ 合作时，明确目标与边界，直接沟通，不必过度拐弯抹角，同时在关键节点提醒 TA 关注节奏与团队情绪。',
  },
  ENTP: {
    name: '战术策士',
    description:
      '你像在霓虹巷口嬉笑的黑客，脑中总有各种新点子与奇招，善于在对话和碰撞中找出系统缝隙，探索“还有别的玩法”。',
    cooperation:
      '与 ENTP 合作时，多和 TA 进行头脑风暴，允许即兴调整方案，同时在执行阶段帮忙收束细节，效果会事半功倍。',
  },
  INFJ: {
    name: '洞察者',
    description:
      '你像城市暗网中的温柔观察者，能在噪声中捕捉人心与趋势，对集体情绪和长期走向有独特的敏感与预判。',
    cooperation:
      '与 INFJ 合作时，愿意分享真实想法，尊重 TA 的价值观判断，并邀请 TA 参与愿景和文化相关的决策，会得到细腻而可靠的支持。',
  },
  INFP: {
    name: '理想灯塔',
    description:
      '你像雾夜里那盏不张扬的信号灯，更在意城市是否朝着“对的方向”前进。你会在纷乱中守护自己认定的温柔与正义。',
    cooperation:
      '与 INFP 合作时，认真对待 TA 在意的议题，避免用冷漠的效率逻辑否定感受，一起把理想拆成小小可实现的行动。',
  },
  ENFJ: {
    name: '共鸣领队',
    description:
      '你像会说话的城市广播，擅长读懂每个人的需求与状态，把人们的力量编织在一起，让团队在压力下依然保持凝聚力。',
    cooperation:
      '与 ENFJ 合作时，坦诚表达困惑与期待，信任 TA 在协调与推动上的能力，也适时给予回馈，避免 TA 过度承担。',
  },
  ENFP: {
    name: '灵感点火者',
    description:
      '你像在高楼屋顶奔跑的霓虹信使，喜欢在不同人和想法之间跳跃连接，让团队重新感到好奇、热血和可能性。',
    cooperation:
      '与 ENFP 合作时，多给 TA 探索与尝试新东西的空间，同时在关键节点一起梳理优先级，让灵感和落地并行。',
  },
  ISTJ: {
    name: '秩序守卫',
    description:
      '你像城市底层稳定运转的基建系统，踏实、可靠、记忆力惊人，擅长维护规则与流程，确保每一步都按标准执行。',
    cooperation:
      '与 ISTJ 合作时，尊重既有流程与经验做法，提前沟通变更理由，同时认可 TA 在细节把控上的贡献，会让合作极为安心。',
  },
  ISFJ: {
    name: '后勤护盾',
    description:
      '你像默默运作的防护罩，为团队提供细致入微的照顾和支持。你会记住每个人的小习惯，用可靠和温暖守住安全底线。',
    cooperation:
      '与 ISFJ 合作时，不要把照顾视为理所当然，主动表达感谢，并在决策中考虑 TA 的感受与负荷，会让关系非常稳固。',
  },
  ESTJ: {
    name: '执行官',
    description:
      '你像高效的城市调度中心，擅长把目标拆解成清晰流程，用干脆利落的行动推动事情向前，讨厌拖延与含糊。',
    cooperation:
      '与 ESTJ 合作时，清楚对齐职责与标准，及时反馈进展，不要无限期拖延；在分歧出现时坦率沟通，效果最好。',
  },
  ESFJ: {
    name: '社群协调者',
    description:
      '你像城市社区的核心纽带，关心每个人是否被照顾到，擅长搭建关系网络，让合作变得顺滑而有温度。',
    cooperation:
      '与 ESFJ 合作时，愿意共享感受与近况，认可 TA 在协调与关怀上的付出，并避免冷处理或长期失联。',
  },
  ISTP: {
    name: '冷静技师',
    description:
      '你像潜入系统深处的维修专家，遇事先动手验证而非空谈，偏爱高自由度的空间去拆解、修补、优化一切。',
    cooperation:
      '与 ISTP 合作时，给出足够操作空间与清晰目标，减少过度干预流程，让 TA 用自己的节奏解决问题即可。',
  },
  ISFP: {
    name: '感知艺术家',
    description:
      '你像在霓虹小巷涂鸦的创作者，对细节、氛围和当下体验极为敏锐，喜欢用实际行动而非长篇大论表达自己。',
    cooperation:
      '与 ISFP 合作时，不要强行要求长时间高强度的社交或控制，给 TA 一些空间，让作品和行动自己说话。',
  },
  ESTP: {
    name: '临场玩家',
    description:
      '你像喜欢直接下场的战术玩家，擅长在实时局势中捕捉机会，快速决策、迅速行动，在压力下反而更兴奋。',
    cooperation:
      '与 ESTP 合作时，提供足够信息和即时反馈，避免冗长会议；在关键时刻请 TA 出手，会看到惊人的执行力。',
  },
  ESFP: {
    name: '氛围担当',
    description:
      '你像城市派对的灵魂角色，敏锐察觉现场的情绪起伏，善于把紧张的氛围变得轻松，让团队在压力中也能保持笑声。',
    cooperation:
      '与 ESFP 合作时，允许自然表达情绪，邀请 TA 参与需要互动和体验感的环节，也尊重 TA 偶尔想安静一下的需求。',
  },
}

const defaultProfile: MbtiProfile = {
  name: '霓虹旅人',
  description:
    '你的选择在不同维度间较为平衡，像在霓虹之城自由穿梭的旅人，能根据情境切换不同模式，保持弹性与好奇心。',
  cooperation:
    '与这类类型合作时，多做开放沟通与角色协商，让 TA 根据现场需要自由切换位置，往往能补位团队的空白。',
}

function getDimensionStats(
  sceneList: Scene[],
  choices: (SceneOption | null)[],
): {
  stats: DimensionStats
  answeredCount: number
} {
  const stats = dimensionOrder.reduce((acc, dim) => {
    const [left, right] = dimensionLetters[dim]
    acc[dim] = {
      leftLetter: left,
      rightLetter: right,
      leftScore: 0,
      rightScore: 0,
      percent: 50,
      dominant: null,
    }
    return acc
  }, {} as DimensionStats)

  let answeredCount = 0

  sceneList.forEach((scene, index) => {
    const choice = choices[index]
    if (!choice) return
    answeredCount += 1
    const dim = scene.dimension
    const [left, right] = dimensionLetters[dim]
    const stat = stats[dim]
    if (choice.letter === left) {
      stat.leftScore += 1
    } else if (choice.letter === right) {
      stat.rightScore += 1
    }
  })

  dimensionOrder.forEach((dim) => {
    const stat = stats[dim]
    const total = stat.leftScore + stat.rightScore
    if (total === 0) {
      stat.percent = 50
      stat.dominant = null
    } else {
      stat.percent = (stat.leftScore / total) * 100
      if (stat.leftScore === stat.rightScore) {
        stat.dominant = null
      } else {
        stat.dominant =
          stat.leftScore > stat.rightScore ? stat.leftLetter : stat.rightLetter
      }
    }
  })

  return { stats, answeredCount }
}

function computeMbtiResult(
  sceneList: Scene[],
  choices: (SceneOption | null)[],
): MbtiResult | null {
  if (sceneList.length === 0) return null
  // 如果还有未回答的场景，则不生成结果
  if (choices.some((c, index) => index < sceneList.length && !c)) {
    return null
  }

  const dimScores = {
    EI: { E: 0, I: 0 },
    SN: { S: 0, N: 0 },
    TF: { T: 0, F: 0 },
    JP: { J: 0, P: 0 },
  }

  const lastPick: Partial<Record<DimensionKey, Letter>> = {}

  sceneList.forEach((scene, index) => {
    const choice = choices[index]
    if (!choice) return
    const dim = scene.dimension
    const letter = choice.letter
    ;(dimScores[dim] as Record<Letter, number>)[letter] += 1
    lastPick[dim] = letter
  })

  const letters: Letter[] = []

  dimensionOrder.forEach((dim) => {
    const [left, right] = dimensionLetters[dim]
    const scores = dimScores[dim] as Record<Letter, number>
    const leftScore = (scores[left] as number) ?? 0
    const rightScore = (scores[right] as number) ?? 0

    let chosen: Letter
    if (leftScore > rightScore) {
      chosen = left
    } else if (rightScore > leftScore) {
      chosen = right
    } else {
      const last = lastPick[dim]
      if (last === left || last === right) {
        chosen = last
      } else {
        chosen = left
      }
    }

    letters.push(chosen)
  })

  const type = letters.join('')
  const profile = mbtiProfiles[type] ?? defaultProfile

  return { type, letters, profile }
}

function App() {
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<ScenarioId | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [choices, setChoices] = useState<(SceneOption | null)[]>([])
  const [showResult, setShowResult] = useState(false)

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === selectedScenarioId) ?? null,
    [selectedScenarioId],
  )

  const totalScenes = activeScenario ? activeScenario.scenes.length : 0

  const { stats: dimensionStats, answeredCount } = useMemo(
    () =>
      activeScenario
        ? getDimensionStats(activeScenario.scenes, choices)
        : getDimensionStats([], []),
    [activeScenario, choices],
  )

  const overallProgress =
    activeScenario && totalScenes > 0
      ? (answeredCount / totalScenes) * 100
      : 0

  const currentScene =
    activeScenario && activeScenario.scenes[currentIndex]
  const currentChoice = currentScene && choices[currentIndex]

  const isLastScene =
    activeScenario && totalScenes > 0
      ? currentIndex === totalScenes - 1
      : false

  const handleSelectScenario = (id: ScenarioId) => {
    const scenario = scenarios.find((s) => s.id === id)
    if (!scenario) return
    setSelectedScenarioId(id)
    setChoices(Array(scenario.scenes.length).fill(null))
    setCurrentIndex(0)
    setShowResult(false)
  }

  const handleSelectOption = (sceneIndex: number, option: SceneOption) => {
    setChoices((prev) => {
      const next = [...prev]
      next[sceneIndex] = option
      return next
    })
  }

  const handleNext = () => {
    if (!activeScenario) return
    if (!currentChoice) return
    if (isLastScene) {
      setShowResult(true)
      return
    }
    setCurrentIndex((prev) =>
      Math.min(prev + 1, activeScenario.scenes.length - 1),
    )
  }

  const handlePrev = () => {
    if (!activeScenario) return
    if (currentIndex === 0) return
    setChoices((prev) => {
      const next = [...prev]
      const prevIndex = currentIndex - 1
      if (prevIndex >= 0) {
        next[prevIndex] = null
      }
      return next
    })
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const handleRestart = () => {
    setSelectedScenarioId(null)
    setChoices([])
    setCurrentIndex(0)
    setShowResult(false)
  }

  const mbtiResult = useMemo(
    () =>
      showResult && activeScenario
        ? computeMbtiResult(activeScenario.scenes, choices)
        : null,
    [choices, showResult, activeScenario],
  )

  const isSelectingScenario = !activeScenario
  const isPlaying = !!activeScenario && !showResult
  const isResult = !!activeScenario && showResult

  const stepLabel = isResult
    ? '已抵达你的霓虹人格结局'
    : isPlaying && totalScenes > 0
      ? `第 ${currentIndex + 1} / ${totalScenes} 幕`
      : '选择一个你想体验的故事场景'

  const canGoNext = Boolean(currentChoice)

  const heroChipText = activeScenario
    ? `${activeScenario.title} · 故事向人格体验`
    : '多场景危机抉择 · 故事向人格体验'

  const heroTitle = (() => {
    if (!activeScenario) {
      return '先选择一个故事场景，看看你在不同世界里会如何出手。'
    }
    switch (activeScenario.id) {
      case 'A':
        return '在系统失控的那一夜，你会如何拯救霓虹之城？'
      case 'B':
        return '当星港舰队捕获未知信号时，你会如何下达指令？'
      case 'C':
        return '当沙漠补给线动摇时，你会如何守住这一片绿洲？'
      case 'D':
        return '暴雪封山之夜，你会如何指挥这场极限救援？'
      default:
        return '在危机之中，你会如何做出每一次关键抉择？'
    }
  })()

  const heroDescription = activeScenario
    ? '每套故事都由 20 幕连续情境组成，你在每一幕的二选一，将被映射到四个人格维度，最终在结局生成一张属于此场景的性格档案。'
    : '从城市到深空、从沙漠到雪山，4 套各有风格的 20 幕故事等你选择。每一次抉择都只记录你最终停留的选项，用轻量方式勾勒出你的应对偏好。'

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-zinc-50 antialiased'>
      {/* 顶部霓虹城市 Hero 区域 */}
      <div className='relative overflow-hidden border-b border-zinc-800/60 bg-gradient-to-b from-violet-500/20 via-cyan-500/10 to-slate-950'>
        <div className='pointer-events-none absolute inset-0 opacity-50'>
          <img
            src={neonCityBanner}
            alt='赛博风格的城市夜景'
            className='h-full w-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/80 to-slate-950' />
        </div>

        <header className='relative z-10 px-4 py-8 sm:px-6 lg:px-10'>
          <div className='mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-4'>
              <div className='inline-flex items-center gap-2 rounded-full border border-fuchsia-500/40 bg-black/40 px-3 py-1 text-xs text-fuchsia-100 backdrop-blur'>
                <Sparkles className='h-3.5 w-3.5 text-fuchsia-300' />
                <span>{heroChipText}</span>
              </div>
              <div className='space-y-3'>
                <h1 className='text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl md:text-4xl'>
                  {heroTitle}
                </h1>
                <p className='max-w-2xl text-sm text-zinc-300 sm:text-base'>
                  {heroDescription}
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-3 text-xs text-zinc-300'>
                <div className='inline-flex items-center gap-2 rounded-full bg-zinc-900/60 px-3 py-1'>
                  <span className='h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]' />
                  <span>{stepLabel}</span>
                </div>
                <div className='inline-flex items-center gap-2 rounded-full bg-zinc-900/60 px-3 py-1'>
                  <span className='text-zinc-400'>进度</span>
                  {activeScenario ? (
                    <span className='font-medium text-cyan-300'>
                      {answeredCount}/{totalScenes}
                    </span>
                  ) : (
                    <span className='font-medium text-cyan-300'>未开始</span>
                  )}
                </div>
                <div className='inline-flex items-center gap-2 rounded-full bg-zinc-900/60 px-3 py-1'>
                  <span className='text-zinc-400'>用时</span>
                  <span>约 10 分钟 · 仅供娱乐参考</span>
                </div>
              </div>
            </div>

            {mbtiResult ? (
              <Card className='mt-4 w-full max-w-xs border-fuchsia-500/40 bg-black/40 text-right shadow-lg shadow-fuchsia-500/20 backdrop-blur sm:mt-0'>
                <CardHeader className='pb-4 pt-4'>
                  <CardDescription className='text-[11px] uppercase tracking-[0.18em] text-fuchsia-200'>
                    最终人格代码
                  </CardDescription>
                  <CardTitle className='text-3xl font-semibold tracking-[0.2em] text-fuchsia-100'>
                    {mbtiResult.type}
                  </CardTitle>
                  <p className='mt-1 text-xs text-zinc-300'>{mbtiResult.profile.name}</p>
                </CardHeader>
              </Card>
            ) : null}
          </div>

          <div className='mx-auto mt-6 flex max-w-6xl flex-col gap-2 pb-1'>
            <Progress
              value={overallProgress}
              className='h-1.5 overflow-hidden rounded-full bg-zinc-800/80'
            />
            <div className='flex justify-between text-[11px] text-zinc-400'>
              <span>故事进度</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
          </div>
        </header>
      </div>

      {/* 主体内容区域 */}
      <main className='relative z-10 px-4 pb-10 pt-4 sm:px-6 lg:px-10'>
        {isSelectingScenario && (
          <section className='mx-auto mt-6 max-w-6xl'>
            <Card className='border-zinc-800/80 bg-zinc-950/80 text-zinc-50 shadow-xl shadow-cyan-500/10 backdrop-blur'>
              <CardHeader className='space-y-3 pb-4'>
                <p className='text-xs font-medium uppercase tracking-[0.2em] text-cyan-200'>
                  Choose Your Scenario
                </p>
                <CardTitle className='text-xl font-semibold text-zinc-50 sm:text-2xl'>
                  选择你的危机舞台，开启 20 幕人格旅程
                </CardTitle>
                <CardDescription className='text-sm leading-relaxed text-zinc-300'>
                  四套风格各异的故事都会使用相同的人格维度逻辑进行映射，过程不显示任何实时倾向，只在结局揭示你的类型与说明。
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4 pt-0'>
                <div className='grid gap-4 md:grid-cols-2'>
                  {scenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      type='button'
                      onClick={() => handleSelectScenario(scenario.id)}
                      className='group flex h-full flex-col items-start justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-cyan-400/80 hover:bg-zinc-900/90 hover:shadow-[0_0_24px_rgba(56,189,248,0.4)] sm:p-5'
                    >
                      <div className='inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-200'>
                        <span className='flex h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400 shadow-[0_0_10px_rgba(244,114,182,0.9)]' />
                        <span>{scenario.tagline}</span>
                      </div>
                      <h2 className='mt-2 text-base font-semibold text-zinc-50 sm:text-lg'>
                        {scenario.title}
                      </h2>
                      <p className='mt-2 text-xs text-zinc-300 sm:text-sm'>
                        {scenario.description}
                      </p>
                      <span className='mt-3 inline-flex items-center gap-1 text-[11px] text-cyan-300'>
                        <ArrowRight className='h-3 w-3' />
                        点击进入第 1 幕
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {activeScenario && (
          <div
            className={`mx-auto mt-6 grid max-w-6xl gap-6 ${
              showResult
                ? 'lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.2fr)]'
                : 'lg:grid-cols-1'
            }`}
          >
            {/* 左侧：剧情与选择 / 结果卡片 */}
            <section className='space-y-4'>
              {!showResult && currentScene && (
                <Card className='border-zinc-800/80 bg-white/5 text-zinc-50 shadow-xl shadow-cyan-500/10 backdrop-blur-md'>
                  <CardHeader className='space-y-3 pb-4'>
                    <p className='text-xs font-medium uppercase tracking-[0.2em] text-cyan-200'>
                      {activeScenario.title} / Scene {currentScene.id}
                    </p>
                    <CardTitle className='text-xl font-semibold text-zinc-50 sm:text-2xl'>
                      {currentScene.title}
                    </CardTitle>
                    <CardDescription className='text-sm leading-relaxed text-zinc-300'>
                      {currentScene.narrative}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4 pt-0'>
                    <p className='text-sm text-zinc-200'>{currentScene.prompt}</p>

                    <div className='mt-2 grid gap-3 sm:grid-cols-2'>
                      {currentScene.options.map((option) => {
                        const isSelected = currentChoice?.id === option.id
                        return (
                          <button
                            key={option.id}
                            type='button'
                            onClick={() => handleSelectOption(currentIndex, option)}
                            className={`group flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:px-5 sm:py-4 ${
                              isSelected
                                ? 'border-fuchsia-400/80 bg-fuchsia-500/15 shadow-[0_0_24px_rgba(244,114,182,0.45)]'
                                : 'border-zinc-700/80 bg-zinc-900/60 hover:-translate-y-0.5 hover:border-cyan-400/70 hover:bg-zinc-900/80 hover:shadow-[0_0_24px_rgba(56,189,248,0.3)]'
                            }`}
                          >
                            <span className='inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-400'>
                              <span className='h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400 shadow-[0_0_12px_rgba(244,114,182,0.8)]' />
                              <span>路径</span>
                            </span>
                            <span className='text-[15px] font-medium text-zinc-50'>
                              {option.title}
                            </span>
                            <span className='text-xs text-zinc-300'>{option.hint}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div className='mt-4 flex items-center justify-between gap-3'>
                      <div className='flex items-center gap-2 text-[11px] text-zinc-400'>
                        <span>提示：</span>
                        <span>你可以随时切换当前场景选项，系统只会记录你最终停留的选择。</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={handlePrev}
                          disabled={currentIndex === 0}
                          className='gap-1 text-xs text-zinc-300 hover:bg-zinc-800/80'
                        >
                          <ArrowLeft className='h-3.5 w-3.5' /> 上一幕
                        </Button>
                        <Button
                          type='button'
                          size='sm'
                          onClick={handleNext}
                          disabled={!canGoNext}
                          className='gap-1 bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-xs font-medium shadow-lg shadow-fuchsia-500/30 hover:from-fuchsia-400 hover:to-cyan-400'
                        >
                          {isLastScene ? '查看人格结果' : '前往下一幕'}
                          <ArrowRight className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showResult && mbtiResult ? (
                <Card className='border-fuchsia-500/60 bg-black/60 text-zinc-50 shadow-2xl shadow-fuchsia-500/30 backdrop-blur-xl'>
                  <CardHeader className='space-y-3 pb-3'>
                    <p className='text-xs font-medium uppercase tracking-[0.22em] text-fuchsia-200'>
                      Neon Personality Result
                    </p>
                    <div className='flex flex-wrap items-end justify-between gap-3'>
                      <div>
                        <CardTitle className='text-3xl font-semibold tracking-[0.25em] text-fuchsia-100 sm:text-4xl'>
                          {mbtiResult.type}
                        </CardTitle>
                        <p className='mt-1 text-sm text-zinc-200'>
                          {mbtiResult.profile.name}
                        </p>
                      </div>
                      <div className='flex flex-wrap gap-2 text-xs text-zinc-300'>
                        <span className='rounded-full border border-fuchsia-400/70 bg-fuchsia-500/15 px-3 py-1'>
                          多场景危机 · 人格卡片
                        </span>
                        <span className='rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1'>
                          结果仅供娱乐参考，不代表任何临床或专业诊断
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4 pt-0 text-sm text-zinc-200'>
                    <div>
                      <p className='leading-relaxed'>{mbtiResult.profile.description}</p>
                    </div>
                    <div className='rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 p-3 text-[13px] text-fuchsia-50'>
                      <p className='font-medium'>合作建议</p>
                      <p className='mt-1 leading-relaxed'>{mbtiResult.profile.cooperation}</p>
                    </div>

                    <div className='grid gap-3 text-xs text-zinc-300 sm:grid-cols-2'>
                      {dimensionMeta.map((meta) => {
                        const s = dimensionStats[meta.key]
                        return (
                          <div
                            key={meta.key}
                            className='rounded-lg border border-zinc-800/80 bg-zinc-900/80 p-3'
                          >
                            <div className='flex items-center justify-between gap-2 text-[11px]'>
                              <span className='font-medium text-zinc-100'>{meta.label}</span>
                              <span className='text-[11px] text-zinc-400'>
                                {meta.leftLabel} {s.leftScore} · {meta.rightLabel}{' '}
                                {s.rightScore}
                              </span>
                            </div>
                            <div className='mt-1.5'>
                              <Progress
                                value={s.percent}
                                className='h-1.5 bg-zinc-800/80'
                              />
                            </div>
                            <p className='mt-1 text-[11px] text-zinc-400'>
                              {s.dominant
                                ? s.dominant === s.leftLetter
                                  ? `本次略偏向 ${meta.leftLabel} 的应对模式。`
                                  : `本次略偏向 ${meta.rightLabel} 的应对模式。`
                                : '本次在该维度上较为平衡，可根据情境灵活切换。'}
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    <div className='mt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400'>
                      <p>
                        说明：本测验基于故事情境的轻量化人格维度映射，仅用于自我探索和娱乐，不建议用于任何重要决策或专业评估。
                      </p>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={handleRestart}
                        className='border-fuchsia-400/70 bg-zinc-950/80 text-xs text-fuchsia-100 hover:bg-fuchsia-500/10'
                      >
                        <RotateCcw className='mr-1.5 h-3.5 w-3.5' /> 重来一次
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </section>

            {/* 右侧：结果维度复盘与说明，仅在结果页展示 */}
            {showResult && (
              <aside className='space-y-4'>
                <Card className='border-zinc-800/80 bg-zinc-950/80 text-zinc-50 shadow-lg shadow-cyan-500/10 backdrop-blur'>
                  <CardHeader className='space-y-2 pb-3'>
                    <CardTitle className='flex items-center justify-between text-base text-zinc-50'>
                      <span>维度雷达 · 本次倾向</span>
                      <span className='text-xs font-normal text-zinc-400'>
                        仅基于本次 20 幕故事中的选择
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3 pt-0'>
                    {dimensionMeta.map((meta) => {
                      const s = dimensionStats[meta.key]
                      return (
                        <div
                          key={meta.key}
                          className='rounded-lg border border-zinc-800/80 bg-zinc-900/80 p-3'
                        >
                          <div className='flex items-center justify-between text-[11px] text-zinc-300'>
                            <span className='font-medium text-zinc-100'>{meta.label}</span>
                            <span className='flex items-center gap-2'>
                              <span className='text-cyan-300'>
                                {meta.leftLabel} {s.leftScore}
                              </span>
                              <span className='text-fuchsia-300'>
                                {meta.rightLabel} {s.rightScore}
                              </span>
                            </span>
                          </div>
                          <div className='mt-1.5 flex items-center gap-2'>
                            <span className='text-[11px] text-cyan-300'>{s.leftLetter}</span>
                            <Progress
                              value={s.percent}
                              className='h-1.5 flex-1 bg-zinc-800/80'
                            />
                            <span className='text-[11px] text-fuchsia-300'>{s.rightLetter}</span>
                          </div>
                          <p className='mt-1.5 text-[11px] text-zinc-400'>{meta.description}</p>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card className='border-zinc-800/80 bg-zinc-950/80 text-xs text-zinc-300 shadow-lg shadow-fuchsia-500/10 backdrop-blur'>
                  <CardContent className='space-y-2 pt-4'>
                    <p>
                      小贴士：本小游戏以连续情境故事的方式呈现人格偏好，并不会记录任何个人隐私数据，你可以在不同剧本中多次体验、对比自己的选择。 
                    </p>
                    <p>
                      建议你带着好奇心作答，不用刻意“迎合正确答案”。故事里的每一种选择，都是你在那些极端场景下可能采取的真实路径之一。
                    </p>
                  </CardContent>
                </Card>
              </aside>
            )}
          </div>
        )}
      </main>

      <footer className='border-t border-zinc-800/80 bg-zinc-950/90 px-4 py-4 text-[11px] text-zinc-500 sm:px-6 lg:px-10'>
        <div className='mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'>
          <span>霓虹多场景危机人格故事体验 · 仅供娱乐参考</span>
          <span className='text-zinc-600'>建议在安静环境下游玩，戴上耳机会更沉浸。</span>
        </div>
      </footer>
    </div>
  )
}

export default App
