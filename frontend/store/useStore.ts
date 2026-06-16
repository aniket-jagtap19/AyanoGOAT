import { create } from 'zustand';
import type {
  Character,
  CharacterBrief,
  GraphData,
  AnalyticsData,
  SimulationResult,
  StrategistProfile,
} from '@/types';

interface AppState {
  characters: CharacterBrief[];
  selectedCharacter: Character | null;
  graphData: GraphData | null;
  analytics: AnalyticsData | null;
  simulationResult: SimulationResult | null;
  strategistProfile: StrategistProfile | null;
  timelinePosition: number;
  isLoading: boolean;
  error: string | null;
  setCharacters: (c: CharacterBrief[]) => void;
  setSelectedCharacter: (c: Character | null) => void;
  setGraphData: (d: GraphData | null) => void;
  setAnalytics: (a: AnalyticsData | null) => void;
  setSimulationResult: (r: SimulationResult | null) => void;
  setStrategistProfile: (p: StrategistProfile | null) => void;
  setTimelinePosition: (pos: number) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  characters: [],
  selectedCharacter: null,
  graphData: null,
  analytics: null,
  simulationResult: null,
  strategistProfile: null,
  timelinePosition: 0,
  isLoading: false,
  error: null,
  setCharacters:       (characters)       => set({ characters }),
  setSelectedCharacter:(selectedCharacter) => set({ selectedCharacter }),
  setGraphData:        (graphData)         => set({ graphData }),
  setAnalytics:        (analytics)         => set({ analytics }),
  setSimulationResult: (simulationResult)  => set({ simulationResult }),
  setStrategistProfile:(strategistProfile) => set({ strategistProfile }),
  setTimelinePosition: (timelinePosition)  => set({ timelinePosition }),
  setLoading:          (isLoading)         => set({ isLoading }),
  setError:            (error)             => set({ error }),
}));
