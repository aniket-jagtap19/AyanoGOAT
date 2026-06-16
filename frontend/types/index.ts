export interface Character {
  id: string;
  name: string;
  class_name: string;
  description: string;
  strategic_tendencies: string[];
  trust_level: number;
  influence_score: number;
  faction: string;
  personality_summary: string;
}

export interface CharacterBrief {
  id: string;
  name: string;
  class_name: string;
  faction: string;
  influence_score: number;
}

export type RelType =
  | 'MANIPULATES'
  | 'ALLIES_WITH'
  | 'RIVALS'
  | 'PROTECTS'
  | 'DECEIVES'
  | 'DISTRUSTS'
  | 'INFLUENCES';

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  class_name: string;
  influence_score: number;
  faction: string;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
  rel_type: RelType;
  trust: number;
  confidence: number;
  color: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface AnalyticsData {
  page_rank: Record<string, number>;
  betweenness_centrality: Record<string, number>;
  communities: string[][];
  hidden_influencers: string[];
}

export interface SimulationRequest {
  source_character_id: string;
  target_character_ids: string[];
  strategy: string;
  iterations: number;
}

export interface SimulationResult {
  source_id: string;
  influence_scores: Record<string, number>;
  manipulation_chains: string[][];
  alliance_instability: Record<string, number>;
  recommended_actions: string[];
  timestamp: string;
}

export interface SimilarCharacter {
  id: string;
  similarity: number;
  name?: string;
  faction?: string;
}

export interface StrategistProfile {
  user_id: string;
  archetype: string;
  behavioral_embedding: number[];
  trust_tendency: number;
  manipulation_tendency: number;
  alliance_tendency: number;
  similar_characters: SimilarCharacter[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  season: number;
  day_offset: number;
  affected_characters: string[];
}

export interface CharacterRelationship {
  target_id: string;
  target_name: string;
  rel_type: RelType;
  weight: number;
  trust: number;
  confidence: number;
}
