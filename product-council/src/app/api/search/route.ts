import { NextRequest, NextResponse } from 'next/server';
import { vectorSearch, textSearch } from '@/lib/retrieval/vector-search';
import { SearchRequest, SearchResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();

    if (!body.query || body.query.trim().length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters.' },
        { status: 400 }
      );
    }

    const limit = Math.min(body.limit || 10, 50);
    const results = await textSearch(body.query.trim(), limit);

    const response: SearchResponse = {
      results,
      totalFound: results.length,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed.' },
      { status: 500 }
    );
  }
}
