import type { LifecycleStage, Product } from '../types'

export const lifecycleStages: LifecycleStage[] = [
  {
    id: 'concept',
    name: '概念与立项',
    color: '#3B82F6',
    subStages: [
      { id: 'c1', name: '需求定义与生成', description: '通过市场调研、VOC、临床学术研讨、竞品分析等不同方式识别临床市场，经初步分析后建立需求识别清单', durationMonths: [1, 3], category: '市场' },
      { id: 'c2', name: '需求筛选', description: '可行性分析：临床重要性、技术可行性、市场规模、政策风险等', durationMonths: [1, 3], category: '其他' },
      { id: 'c3', name: '形成解决方案 / 产品概念', description: '把需求转化为具体的技术方案，与研发一起进行产品概念转化和确认，制定研发方向与设计控制', durationMonths: [1, 3], category: '研发' },
      { id: 'c4', name: '商业方案筛选', description: '可行性分析：市场吸引力、商业价值、投资回报率、知识产权可行性、研发可行性、注册可行性、供应链可行性', durationMonths: [1, 3], category: '市场' },
      { id: 'c5', name: '制定商业计划', description: '市场定位与细分、产品定位（功能/规格/型号）、销售预测、市场预估、商业模式与医保路径预估', durationMonths: [1, 3], category: '市场' },
      { id: 'c6', name: '概念决策 N0-M1', description: '项目筛选与产品组合、财务回报模型、资源配置决策', durationMonths: [1, 3], category: '其他' },
    ],
  },
  {
    id: 'design',
    name: '设计开发',
    color: '#6366F1',
    subStages: [
      { id: 'd1', name: '产品设计与验证 M2-M4', description: '产品设计DMR文件输出、正式型式检验、动物/临床试验启动、研发设计评审，确保设计输入确保需求被满足', durationMonths: [12, 24], category: '研发' },
      { id: 'd2', name: '设计转换与确认 M5-M6', description: '批量生产工艺确认、供应链构建、销售工具和培训确认', durationMonths: [6, 12], category: '研发' },
    ],
  },
  {
    id: 'register',
    name: '递交注册',
    color: '#8B5CF6',
    subStages: [
      { id: 'r1', name: '注册送检', description: '联系检测所、全性能检测、验证UDI实施、说明书备案', durationMonths: [10, 18], category: '注册' },
      { id: 'r2', name: '申请准备', description: '省级/国家局提交注册申请及培训计划、全球市场申报、渠道建设和经销商培训', durationMonths: [1, 3], category: '注册' },
    ],
  },
  {
    id: 'launch',
    name: '产品上市',
    color: '#10B981',
    subStages: [
      { id: 'l1', name: '获证 / 商业上市', description: '上市后临床跟踪（PMCF）、售后记录与投诉-处理', durationMonths: [1, 3], category: '市场' },
      { id: 'l2', name: '商业化推广', description: '参加学术会议、KOL合作推广、渠道铺货', durationMonths: [1, 3], category: '市场' },
    ],
  },
  {
    id: 'growth',
    name: '销售成长期',
    color: '#06B6D4',
    subStages: [
      { id: 'g1', name: '临床跟踪 PMCF', description: '上市后临床跟踪（PMCF），持续收集临床数据', durationMonths: [12, 48], category: '临床' },
      { id: 'g2', name: '入院与招标', description: '产品入院：根据各国/地区市场准入流程，完成不同国家的N/E及新产品市场准入，产品费用的确认及维护；入院3~12月/院，集中招标2~4月/次', durationMonths: [12, 36], category: '市场' },
    ],
  },
  {
    id: 'mature',
    name: '销售成熟期',
    color: '#F59E0B',
    subStages: [
      { id: 'm1', name: '注册维护', description: '续期注册（每5年一次）', durationMonths: [24, 60], category: '注册' },
      { id: 'm2', name: '存量市场维护', description: '医院维护、产品性能优化、价格维护、适应症推广', durationMonths: [24, 60], category: '市场' },
    ],
  },
  {
    id: 'decline',
    name: '衰退期',
    color: '#EF4444',
    subStages: [
      { id: 'd1', name: '退市前准备', description: '退市分析及前方预案', durationMonths: [6, 12], category: '市场' },
      { id: 'd2', name: '退市通知', description: '发布产品退市通知、完成最后批次生产、终止通知', durationMonths: [3, 6], category: '其他' },
    ],
  },
  {
    id: 'retire',
    name: '正式退市',
    color: '#6B7280',
    subStages: [
      { id: 'e1', name: '注销注册证', description: '向监管机构提交注销申请、归档总结', durationMonths: [1, 3], category: '注册' },
      { id: 'e2', name: '停止销售与服务', description: '通知客户停止销售、转移服务合同', durationMonths: [1, 3], category: '其他' },
    ],
  },
]

export const products: Product[] = [
  {
    id: 'n-series',
    name: 'N系列',
    productLine: 'N系列',
    type: 'existing',
    phases: [
      { id: 'p1', stageId: 'concept', startYear: 2018, endYear: 2019, status: 'completed' },
      { id: 'p2', stageId: 'design', startYear: 2019, endYear: 2020, status: 'completed' },
      { id: 'p3', stageId: 'register', startYear: 2020, endYear: 2021, status: 'completed' },
      { id: 'p4', stageId: 'launch', startYear: 2022, endYear: 2023, status: 'completed' },
      { id: 'p5', stageId: 'growth', startYear: 2023, endYear: 2026, status: 'active' },
      { id: 'p6', stageId: 'mature', startYear: 2026, endYear: 2031, status: 'upcoming' },
      { id: 'p7', stageId: 'decline', startYear: 2031, endYear: 2032, status: 'upcoming' },
      { id: 'p8', stageId: 'retire', startYear: 2032, endYear: 2033, status: 'upcoming' },
    ],
  },
  {
    id: 'n-plus',
    name: 'Nplus',
    productLine: 'N系列',
    type: 'in_development',
    phases: [
      { id: 'np1', stageId: 'concept', startYear: 2025, endYear: 2026, status: 'active' },
      { id: 'np2', stageId: 'design', startYear: 2026, endYear: 2028, status: 'upcoming' },
      { id: 'np3', stageId: 'register', startYear: 2028, endYear: 2029, status: 'upcoming' },
      { id: 'np4', stageId: 'launch', startYear: 2030, endYear: 2031, status: 'upcoming' },
      { id: 'np5', stageId: 'growth', startYear: 2031, endYear: 2035, status: 'upcoming' },
      { id: 'np6', stageId: 'mature', startYear: 2035, endYear: 2040, status: 'upcoming' },
      { id: 'np7', stageId: 'decline', startYear: 2040, endYear: 2041, status: 'upcoming' },
      { id: 'np8', stageId: 'retire', startYear: 2041, endYear: 2042, status: 'upcoming' },
    ],
  },
  {
    id: 'n-gen3',
    name: 'N三代',
    productLine: 'N系列',
    type: 'planned',
    phases: [
      { id: 'ng1', stageId: 'concept', startYear: 2028, endYear: 2029, status: 'upcoming' },
      { id: 'ng2', stageId: 'design', startYear: 2029, endYear: 2031, status: 'upcoming' },
      { id: 'ng3', stageId: 'register', startYear: 2031, endYear: 2033, status: 'upcoming' },
      { id: 'ng4', stageId: 'launch', startYear: 2033, endYear: 2034, status: 'upcoming' },
      { id: 'ng5', stageId: 'growth', startYear: 2034, endYear: 2038, status: 'upcoming' },
      { id: 'ng6', stageId: 'mature', startYear: 2038, endYear: 2043, status: 'upcoming' },
      { id: 'ng7', stageId: 'decline', startYear: 2043, endYear: 2044, status: 'upcoming' },
      { id: 'ng8', stageId: 'retire', startYear: 2044, endYear: 2045, status: 'upcoming' },
    ],
  },
]
