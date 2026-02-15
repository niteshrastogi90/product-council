'use client';

import { useState, useCallback, useRef } from 'react';

export interface AgentInfo {
  name: string;
  episodeTitle: string;
  expertise: string[];
  youtubeUrl: string;
}

export interface DebateTurnUI {
  agent: string;
  role: 'moderator' | 'speaker';
  content: string;
  phase: string;
  isStreaming: boolean;
  round?: number;
}

export interface SourceInfo {
  guest: string;
  episodeTitle: string;
  youtubeUrl: string;
  timestamp?: string;
}

export interface CouncilStreamState {
  status: 'idle' | 'connecting' | 'retrieving' | 'debating' | 'synthesizing' | 'complete' | 'error';
  statusMessage: string;
  sessionId: string | null;
  agents: AgentInfo[];
  topics: string[];
  turns: DebateTurnUI[];
  synthesis: string;
  synthesisStreaming: boolean;
  sources: SourceInfo[];
  error: string | null;
}

const initialState: CouncilStreamState = {
  status: 'idle',
  statusMessage: '',
  sessionId: null,
  agents: [],
  topics: [],
  turns: [],
  synthesis: '',
  synthesisStreaming: false,
  sources: [],
  error: null,
};

export function useCouncilStream() {
  const [state, setState] = useState<CouncilStreamState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const startCouncil = useCallback(async (query: string, speakerCount?: number) => {
    // Reset state
    setState({ ...initialState, status: 'connecting', statusMessage: 'Starting council session...' });

    // Abort previous if any
    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const response = await fetch('/api/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query, speakerCount }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        setState(prev => ({ ...prev, status: 'error', error: err.error || 'Failed to start council.' }));
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setState(prev => ({ ...prev, status: 'error', error: 'No response stream.' }));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let currentEvent = '';
        let currentData = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            currentData = line.slice(6);

            if (currentEvent && currentData) {
              try {
                const data = JSON.parse(currentData);
                processEvent(currentEvent, data, setState);
              } catch (e) {
                // Ignore parse errors for partial data
              }
              currentEvent = '';
              currentData = '';
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Connection failed.',
      }));
    }
  }, []);

  const stopCouncil = useCallback(() => {
    abortRef.current?.abort();
    setState(prev => ({ ...prev, status: prev.status === 'complete' ? 'complete' : 'idle' }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(initialState);
  }, []);

  return { ...state, startCouncil, stopCouncil, reset };
}

function processEvent(
  eventType: string,
  data: Record<string, unknown>,
  setState: React.Dispatch<React.SetStateAction<CouncilStreamState>>
) {
  switch (eventType) {
    case 'session_id':
      setState(prev => ({ ...prev, sessionId: data.sessionId as string }));
      break;

    case 'status':
      setState(prev => ({
        ...prev,
        status: data.phase === 'retrieval' ? 'retrieving' : 'debating',
        statusMessage: data.step as string,
      }));
      break;

    case 'speakers_selected':
      setState(prev => ({
        ...prev,
        agents: data.agents as AgentInfo[],
        topics: (data.topics as string[]) || [],
        status: 'debating',
        statusMessage: 'Council is discussing...',
      }));
      break;

    case 'debate_turn': {
      const agent = data.agent as string;
      const content = data.content as string;
      const isDelta = data.delta as boolean;
      const isStreaming = data.streaming as boolean;

      setState(prev => {
        const turns = [...prev.turns];
        const existingIdx = turns.findIndex(
          t => t.agent === agent && t.phase === (data.phase as string) && t.round === (data.round as number | undefined)
        );

        if (existingIdx >= 0) {
          turns[existingIdx] = {
            ...turns[existingIdx],
            content: isDelta ? turns[existingIdx].content + content : content,
            isStreaming,
          };
        } else {
          turns.push({
            agent,
            role: 'speaker',
            content: isDelta ? content : content,
            phase: data.phase as string,
            isStreaming,
            round: data.round as number | undefined,
          });
        }

        return { ...prev, turns };
      });
      break;
    }

    case 'moderator_turn': {
      const content = data.content as string;
      const isDelta = data.delta as boolean;
      const isStreaming = data.streaming as boolean;
      const phase = data.phase as string;

      setState(prev => {
        const turns = [...prev.turns];
        const existingIdx = turns.findIndex(t => t.agent === 'Lenny' && t.phase === phase);

        if (existingIdx >= 0) {
          turns[existingIdx] = {
            ...turns[existingIdx],
            content: isDelta ? turns[existingIdx].content + content : content,
            isStreaming,
          };
        } else {
          turns.push({
            agent: 'Lenny',
            role: 'moderator',
            content: isDelta ? content : content,
            phase,
            isStreaming,
          });
        }

        return { ...prev, turns };
      });
      break;
    }

    case 'synthesis': {
      const content = data.content as string;
      const isDelta = data.delta as boolean;
      const isStreaming = data.streaming as boolean;

      setState(prev => ({
        ...prev,
        status: 'synthesizing',
        statusMessage: 'Lenny is synthesizing...',
        synthesis: isDelta ? prev.synthesis + content : content,
        synthesisStreaming: isStreaming,
      }));
      break;
    }

    case 'sources':
      setState(prev => ({
        ...prev,
        sources: data.sources as SourceInfo[],
      }));
      break;

    case 'complete':
      setState(prev => ({
        ...prev,
        status: 'complete',
        statusMessage: 'Council discussion complete.',
      }));
      break;

    case 'error':
      setState(prev => ({
        ...prev,
        status: 'error',
        error: data.message as string,
      }));
      break;
  }
}
