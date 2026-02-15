// ===== Episode & Transcript Types =====

export interface EpisodeMeta {
  id: string;           // slug: "julie-zhuo"
  guest: string;        // "Julie Zhuo"
  title: string;        // Full episode title
  youtubeUrl: string;
  videoId: string;
  publishDate: string;  // "2023-04-21"
  description: string;
  durationSeconds: number;
  duration: string;     // "1:05:46"
  viewCount: number;
  keywords: string[];
}

export interface TranscriptTurn {
  speaker: string;
  timestampRaw: string;  // "00:12:34"
  timestampSeconds: number;
  text: string;
}

export interface TranscriptChunk {
  id: string;             // "julie-zhuo-chunk-3"
  episodeId: string;
  guest: string;
  episodeTitle: string;
  youtubeUrl: string;
  publishDate: string;
  keywords: string[];
  speaker: string;
  content: string;
  timestampStart: number; // seconds
  timestampEnd: number;
  turnCount: number;
}

export interface ChunkWithScore extends TranscriptChunk {
  score: number;
}

// ===== Retrieval Types =====

export interface TopicIndex {
  [topic: string]: {
    episodes: string[];  // episode IDs
    count: number;
  };
}

export interface RetrievalResult {
  episodes: RetrievedEpisode[];
  topics: string[];
}

export interface RetrievedEpisode {
  id: string;
  guest: string;
  title: string;
  youtubeUrl: string;
  relevanceScore: number;
  passages: TranscriptChunk[];
}

export interface SpeakerContext {
  name: string;
  episodeId: string;
  episodeTitle: string;
  youtubeUrl: string;
  expertise: string[];
  quotes: string[];
  passages: TranscriptChunk[];
}

// ===== Agent Types =====

export interface CouncilMember {
  name: string;
  episodeId: string;
  episodeTitle: string;
  youtubeUrl: string;
  expertise: string[];
  context: SpeakerContext;
}

export interface DebateTurn {
  agent: string;
  role: 'moderator' | 'speaker' | 'synthesizer';
  content: string;
  timestamp: number;
}

export interface CouncilSession {
  id: string;
  userId: string;
  query: string;
  context?: string;
  agents: CouncilMember[];
  discussion: DebateTurn[];
  synthesis?: string;
  sources: SourceCitation[];
  createdAt: string;
  status: 'active' | 'complete' | 'error';
}

export interface SourceCitation {
  guest: string;
  episodeTitle: string;
  youtubeUrl: string;
  timestamp?: string;
}

// ===== SSE Event Types =====

export type SSEEventType =
  | 'status'
  | 'speakers_selected'
  | 'debate_turn'
  | 'moderator_turn'
  | 'synthesis'
  | 'sources'
  | 'error'
  | 'complete';

export interface SSEEvent {
  type: SSEEventType;
  data: Record<string, unknown>;
}

// ===== Auth Types =====

export interface UserProfile {
  email: string;
  createdAt: string;
  lastLogin: string;
  sessionCount: number;
}

// ===== API Request/Response Types =====

export interface CouncilRequest {
  query: string;
  context?: string;
  speakerCount?: number;
}

export interface SearchRequest {
  query: string;
  limit?: number;
}

export interface SearchResponse {
  results: ChunkWithScore[];
  totalFound: number;
}
