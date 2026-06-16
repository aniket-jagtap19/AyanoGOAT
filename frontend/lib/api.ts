import type {
  Character,
  CharacterBrief,
  CharacterRelationship,
  GraphData,
  AnalyticsData,
  SimulationRequest,
  SimulationResult,
  StrategistProfile,
  TimelineEvent,
} from '@/types';

const BASE = '/backend';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  /* graph */
  getGraph:     () => request<GraphData>('/graph/'),
  getAnalytics: () => request<AnalyticsData>('/graph/analytics'),
  getHiddenInfluencers: () =>
    request<{ hidden_influencers: Array<{ id: string; name: string }> }>('/graph/hidden-influencers'),

  /* characters */
  getCharacters:    () => request<CharacterBrief[]>('/characters/'),
  getCharacter:     (id: string) => request<Character>(`/characters/${id}`),
  getRelationships: (id: string) => request<CharacterRelationship[]>(`/characters/${id}/relationships`),
  getInfluencePath: (src: string, tgt: string) =>
    request<{ path: Array<{ id: string; name: string }>; found: boolean; length: number }>(
      `/characters/${src}/influence-path/${tgt}`
    ),
  interact: (id: string, message: string, trust_level: number) =>
    request<{ character_id: string; character_name: string; response: string }>(
      `/characters/${id}/interact`,
      { method: 'POST', body: JSON.stringify({ message, trust_level }) }
    ),

  /* simulation */
  runSimulation: (payload: SimulationRequest) =>
    request<SimulationResult>('/simulation/run', {
      method: 'POST', body: JSON.stringify(payload),
    }),
  predictAlliance: (node1_id: string, node2_id: string) =>
    request<{ stability: number; trust: number; weight: number; verdict: string }>(
      '/simulation/alliance-stability',
      { method: 'POST', body: JSON.stringify({ node1_id, node2_id }) }
    ),

  /* strategist */
  createProfile: (payload: {
    user_id: string;
    scenario_responses: string[];
    strategic_choices: string[];
    alliance_preference: number;
    manipulation_tendency: number;
  }) => request<StrategistProfile>('/strategist/profile', {
    method: 'POST', body: JSON.stringify(payload),
  }),
  getProfile: (user_id: string) => request<StrategistProfile>(`/strategist/${user_id}`),

  /* similarity */
  findSimilar: (query_text: string, top_k = 5) =>
    request<Array<{ id: string; similarity: number; name?: string; faction?: string }>>('/similarity/find', {
      method: 'POST', body: JSON.stringify({ query_text, top_k }),
    }),
  compareCharacters: (id1: string, id2: string) =>
    request<{ character_id_1: string; character_id_2: string; similarity: number }>('/similarity/compare', {
      method: 'POST', body: JSON.stringify({ character_id_1: id1, character_id_2: id2 }),
    }),

  /* timeline */
  getEvents:         () => request<TimelineEvent[]>('/timeline/events'),
  getEventsBySeason: (season: number) => request<TimelineEvent[]>(`/timeline/events/${season}`),
};
