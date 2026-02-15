import { CouncilMember, DebateTurn, SSEEvent, SourceCitation } from '@/lib/types';
import { retrieveCouncilMembers } from '@/lib/retrieval/context-builder';
import { generateSpeakerResponse } from './speaker-agent';
import { generateModeratorIntro, generateModeratorProbe, generateSynthesis } from './moderator-agent';

export interface OrchestratorOptions {
  speakerCount?: number;
  maxRounds?: number;
}

// Main orchestrator - yields SSE events as the council runs
export async function* runCouncil(
  query: string,
  options: OrchestratorOptions = {}
): AsyncGenerator<SSEEvent> {
  const { speakerCount = 4, maxRounds = 2 } = options;

  // Step 1: Retrieve council members
  yield { type: 'status', data: { step: 'Finding relevant experts...', phase: 'retrieval' } };

  const { members, topics } = await retrieveCouncilMembers(query, speakerCount);

  if (members.length === 0) {
    yield { type: 'error', data: { message: 'Could not find relevant experts for this question. Try rephrasing.' } };
    return;
  }

  // Emit selected speakers
  yield {
    type: 'speakers_selected',
    data: {
      agents: members.map(m => ({
        name: m.name,
        episodeTitle: m.episodeTitle,
        expertise: m.expertise,
        youtubeUrl: m.youtubeUrl,
      })),
      topics,
    },
  };

  const allTurns: DebateTurn[] = [];

  // Step 2: Lenny intro
  yield { type: 'status', data: { step: 'Lenny is setting the stage...', phase: 'intro' } };

  let introContent = '';
  yield { type: 'moderator_turn', data: { agent: 'Lenny', phase: 'intro', streaming: true, content: '' } };

  for await (const chunk of generateModeratorIntro(query, members)) {
    introContent += chunk;
    yield { type: 'moderator_turn', data: { agent: 'Lenny', phase: 'intro', streaming: true, content: chunk, delta: true } };
  }

  allTurns.push({ agent: 'Lenny', role: 'moderator', content: introContent, timestamp: Date.now() });
  yield { type: 'moderator_turn', data: { agent: 'Lenny', phase: 'intro', streaming: false, content: introContent } };

  // Step 3: Opening statements (Round 1)
  for (let round = 0; round < maxRounds; round++) {
    const isFirstRound = round === 0;
    const phase = isFirstRound ? 'opening' : 'response';

    yield { type: 'status', data: { step: isFirstRound ? 'Council members sharing their perspectives...' : 'Council members responding to each other...', phase } };

    for (const member of members) {
      let speakerContent = '';
      yield { type: 'debate_turn', data: { agent: member.name, phase, streaming: true, content: '', round } };

      for await (const chunk of generateSpeakerResponse(member, query, allTurns, isFirstRound)) {
        speakerContent += chunk;
        yield { type: 'debate_turn', data: { agent: member.name, phase, streaming: true, content: chunk, delta: true, round } };
      }

      allTurns.push({ agent: member.name, role: 'speaker', content: speakerContent, timestamp: Date.now() });
      yield { type: 'debate_turn', data: { agent: member.name, phase, streaming: false, content: speakerContent, round } };
    }

    // Moderator probe after round 1 (before round 2)
    if (isFirstRound && maxRounds > 1) {
      yield { type: 'status', data: { step: 'Lenny asking a follow-up...', phase: 'probe' } };

      let probeContent = '';
      yield { type: 'moderator_turn', data: { agent: 'Lenny', phase: 'probe', streaming: true, content: '' } };

      for await (const chunk of generateModeratorProbe(query, allTurns, members)) {
        probeContent += chunk;
        yield { type: 'moderator_turn', data: { agent: 'Lenny', phase: 'probe', streaming: true, content: chunk, delta: true } };
      }

      allTurns.push({ agent: 'Lenny', role: 'moderator', content: probeContent, timestamp: Date.now() });
      yield { type: 'moderator_turn', data: { agent: 'Lenny', phase: 'probe', streaming: false, content: probeContent } };
    }
  }

  // Step 4: Synthesis
  yield { type: 'status', data: { step: 'Lenny synthesizing the discussion...', phase: 'synthesis' } };

  let synthesisContent = '';
  yield { type: 'synthesis', data: { streaming: true, content: '' } };

  for await (const chunk of generateSynthesis(query, allTurns, members)) {
    synthesisContent += chunk;
    yield { type: 'synthesis', data: { streaming: true, content: chunk, delta: true } };
  }

  yield { type: 'synthesis', data: { streaming: false, content: synthesisContent } };

  // Step 5: Sources
  const sources: SourceCitation[] = members.map(m => ({
    guest: m.name,
    episodeTitle: m.episodeTitle,
    youtubeUrl: m.youtubeUrl,
    timestamp: m.context.passages[0]
      ? formatTimestamp(m.context.passages[0].timestampStart)
      : undefined,
  }));

  yield { type: 'sources', data: { sources } };

  // Step 6: Complete
  yield {
    type: 'complete',
    data: {
      discussion: allTurns,
      synthesis: synthesisContent,
      sources,
      memberCount: members.length,
      turnCount: allTurns.length,
    },
  };
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
