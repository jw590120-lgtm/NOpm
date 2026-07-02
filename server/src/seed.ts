import type { Product, LifecycleStage } from './types.js'

export const stages: LifecycleStage[] = [
  {
    id: 'concept', name: '概念与立项', color: '#3B82F6', order: 1,
    subStages: [
      { id: 'concept-1', name: '市场需求调研', description: '分析目标市场规模、竞争格局与用户需求', category: '市场', durationMonths: [3, 6] },
      { id: 'concept-2', name: '产品概念设计', description: '确定产品定位、核心功能与技术路线', category: '研发', durationMonths: [2, 4] },
      { id: 'concept-3', name: '可行性分析', description: '技术可行性、法规可行性与经济效益评估', category: '其他', durationMonths: [2, 3] },
    ],
  },
  {
    id: 'design', name: '设计开发', color: '#6366F1', order: 2,
    subStages: [
      { id: 'design-1', name: '产品原型设计', description: '工业设计、结构设计与电气设计', category: '研发', durationMonths: [6, 12] },
      { id: 'design-2', name: '工程样机验证', description: '样机装配、功能测试与性能验证', category: '研发', durationMonths: [4, 8] },
      { id: 'design-3', name: '临床试验方案', description: '制定临床试验方案并启动伦理审批', category: '临床', durationMonths: [3, 6] },
    ],
  },
  {
    id: 'register', name: '递交注册', color: '#8B5CF6', order: 3,
    subStages: [
      { id: 'register-1', name: '注册资料撰写', description: '编写技术要求、说明书、临床评价等注册资料', category: '注册', durationMonths: [3, 6] },
      { id: 'register-2', name: '型式检验', description: '委托第三方检测机构完成型式检验', category: '注册', durationMonths: [2, 4] },
      { id: 'register-3', name: 'NMPA审批', description: '提交注册申请，跟踪审评进度', category: '注册', durationMonths: [6, 12] },
    ],
  },
  {
    id: 'launch', name: '产品上市', color: '#10B981', order: 4,
    subStages: [
      { id: 'launch-1', name: '生产许可', description: '取得生产许可证，建立质量管理体系', category: '注册', durationMonths: [2, 4] },
      { id: 'launch-2', name: '市场准入', description: '医保准入、挂网采购、物价申报', category: '市场', durationMonths: [3, 6] },
      { id: 'launch-3', name: '上市推广', description: '产品上市会议、学术推广、渠道建设', category: '市场', durationMonths: [3, 6] },
    ],
  },
  {
    id: 'growth', name: '销售成长期', color: '#06B6D4', order: 5,
    subStages: [
      { id: 'growth-1', name: '市场拓展', description: '扩大销售区域，增加医院覆盖', category: '市场', durationMonths: [12, 24] },
      { id: 'growth-2', name: '产品迭代', description: '根据临床反馈进行小版本升级优化', category: '研发', durationMonths: [6, 12] },
    ],
  },
  {
    id: 'mature', name: '销售成熟期', color: '#F59E0B', order: 6,
    subStages: [
      { id: 'mature-1', name: '利润最大化', description: '优化供应链成本，维持市场占有率', category: '市场', durationMonths: [12, 36] },
      { id: 'mature-2', name: '适应症扩展', description: '探索新适应症以延长产品生命周期', category: '临床', durationMonths: [12, 24] },
    ],
  },
  {
    id: 'decline', name: '衰退期', color: '#EF4444', order: 7,
    subStages: [
      { id: 'decline-1', name: '市场监控', description: '跟踪竞品动态与市场份额变化', category: '市场', durationMonths: [6, 12] },
      { id: 'decline-2', name: '替代方案', description: '评估新产品替代策略与过渡方案', category: '研发', durationMonths: [6, 12] },
    ],
  },
  {
    id: 'retire', name: '正式退市', color: '#6B7280', order: 8,
    subStages: [
      { id: 'retire-1', name: '退市通知', description: '向监管部门提交退市备案', category: '注册', durationMonths: [1, 3] },
      { id: 'retire-2', name: '售后保障', description: '建立售后服务体系，保障在用设备', category: '其他', durationMonths: [12, 24] },
    ],
  },
]

export const products: Product[] = [
  {
    id: 'prod-1', name: 'N系列', productLine: 'N系列', type: 'existing',
    phases: [
      { id: 'ph-1-1', stageId: 'concept', startYear: 2018, endYear: 2019, status: 'completed' },
      { id: 'ph-1-2', stageId: 'design', startYear: 2019, endYear: 2022, status: 'completed' },
      { id: 'ph-1-3', stageId: 'register', startYear: 2022, endYear: 2023, status: 'completed' },
      { id: 'ph-1-4', stageId: 'launch', startYear: 2023, endYear: 2024, status: 'completed' },
      { id: 'ph-1-5', stageId: 'growth', startYear: 2024, endYear: 2026, status: 'active' },
      { id: 'ph-1-6', stageId: 'mature', startYear: 2026, endYear: 2030, status: 'upcoming' },
      { id: 'ph-1-7', stageId: 'decline', startYear: 2030, endYear: 2032, status: 'upcoming' },
      { id: 'ph-1-8', stageId: 'retire', startYear: 2032, endYear: 2033, status: 'upcoming' },
    ],
  },
  {
    id: 'prod-2', name: 'Nplus', productLine: 'N系列', type: 'in_development',
    phases: [
      { id: 'ph-2-1', stageId: 'concept', startYear: 2022, endYear: 2023, status: 'completed' },
      { id: 'ph-2-2', stageId: 'design', startYear: 2023, endYear: 2025, status: 'completed' },
      { id: 'ph-2-3', stageId: 'register', startYear: 2025, endYear: 2027, status: 'active' },
      { id: 'ph-2-4', stageId: 'launch', startYear: 2027, endYear: 2028, status: 'upcoming' },
      { id: 'ph-2-5', stageId: 'growth', startYear: 2028, endYear: 2030, status: 'upcoming' },
      { id: 'ph-2-6', stageId: 'mature', startYear: 2030, endYear: 2034, status: 'upcoming' },
      { id: 'ph-2-7', stageId: 'decline', startYear: 2034, endYear: 2036, status: 'upcoming' },
      { id: 'ph-2-8', stageId: 'retire', startYear: 2036, endYear: 2037, status: 'upcoming' },
    ],
  },
  {
    id: 'prod-3', name: 'N三代', productLine: 'N系列', type: 'planned',
    phases: [
      { id: 'ph-3-1', stageId: 'concept', startYear: 2028, endYear: 2029, status: 'upcoming' },
      { id: 'ph-3-2', stageId: 'design', startYear: 2029, endYear: 2032, status: 'upcoming' },
      { id: 'ph-3-3', stageId: 'register', startYear: 2032, endYear: 2033, status: 'upcoming' },
      { id: 'ph-3-4', stageId: 'launch', startYear: 2033, endYear: 2034, status: 'upcoming' },
      { id: 'ph-3-5', stageId: 'growth', startYear: 2034, endYear: 2036, status: 'upcoming' },
      { id: 'ph-3-6', stageId: 'mature', startYear: 2036, endYear: 2040, status: 'upcoming' },
      { id: 'ph-3-7', stageId: 'decline', startYear: 2040, endYear: 2042, status: 'upcoming' },
      { id: 'ph-3-8', stageId: 'retire', startYear: 2042, endYear: 2043, status: 'upcoming' },
    ],
  },
]
