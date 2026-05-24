export type Category =
  | "軍事・戦争"
  | "思想・宗教・結社"
  | "帝国・植民地・資源"
  | "金融・通貨・制度"
  | "国際機関・諜報・政策ネットワーク";

export type Lane = "世界史" | "日本史" | "制度・組織" | "影響";

export type ConfidenceLevel = "事実" | "分析" | "推察" | "考察" | "未確認" | "反対材料";

export interface TimelineEvent {
  id: string;
  year: number;
  month?: number;
  title: string;
  titleEn?: string;
  category: Category;
  lane: Lane;
  isReference: boolean;
  japanConnection: boolean;
  summary: string;
  tags: string[];
}

export interface PrimarySource {
  id: string;
  eventId: string;
  title: string;
  url?: string;
  publisher: string;
  sourceType: string;
  yearCreated?: number;
  yearPublished?: number;
}

export interface ResourceCard {
  id: string;
  title: string;
  url: string;
  publisher: string;
  sourceType: string;
  yearCreated?: number;
  yearPublished?: number;
  relatedCategory?: Category;
  relatedEventId?: string;
}

export interface DiscoveryNote {
  id: string;
  type: "人物" | "組織" | "語句" | "政策" | "統計項目" | "別事件" | "疑問点" | "未確認事項";
  content: string;
  relatedEventId?: string;
  relatedResourceId?: string;
}

export interface AnalysisEntry {
  id: string;
  eventId: string;
  level: ConfidenceLevel;
  content: string;
}
