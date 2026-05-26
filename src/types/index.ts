export type Category =
  | "軍事・戦争"
  | "思想・宗教・結社"
  | "帝国・植民地・資源"
  | "金融・通貨・制度"
  | "国際機関・諜報・政策ネットワーク";

export type Region = "world" | "japan" | "institution" | "impact";

export interface EventAnalysis {
  facts: string[];
  analysis: string[];
  speculation: string[];
  unconfirmed: string[];
  counter_evidence: string[];
}

export interface PrimarySource {
  title: string;
  url: string;
  publisher: string;
  source_type: string;
  created_year: number | null;
  published_year: number | string | null;
  related_timeline: string;
  related_event: string;
}

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  category: Category;
  region: Region;
  japan_connection: boolean;
  summary: string;
  primary_sources: PrimarySource[];
  discovery_notes: string[];
  analysis: EventAnalysis;
}
