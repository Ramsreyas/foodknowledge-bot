import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, embedding } = await req.json();
    
    console.log('Received query:', query);
    console.log('Embedding dimensions:', embedding.length);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Search for similar documents
    const { data: documents, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_count: 5,
    });

    if (searchError) {
      console.error('Search error:', searchError);
      throw searchError;
    }

    console.log(`Found ${documents?.length || 0} matching documents`);

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ 
          answer: "I could not find any relevant information in the nutritional database to answer your question.",
          sources: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context from retrieved documents
    const contextText = documents.map((doc: any) => doc.content).join('\n\n---\n\n');
    const sources = documents.map((doc: any) => ({
      page: doc.metadata?.page || 'Unknown',
      content: doc.content,
      similarity: doc.similarity
    }));

    // Build prompt for Llama
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a knowledgeable nutritional assistant. Answer the user's question based ONLY on the context provided below. If the context does not contain sufficient information to answer the question, say "I cannot provide a complete answer based on the available nutritional information."

Be concise, accurate, and cite specific information from the context when possible.

CONTEXT:
${contextText}<|eot_id|><|start_header_id|>user<|end_header_id|>

${query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

    console.log('Calling Fireworks AI...');

    // Call Fireworks AI
    const fireworksResponse = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FIREWORKS_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!fireworksResponse.ok) {
      const errorText = await fireworksResponse.text();
      console.error('Fireworks API error:', fireworksResponse.status, errorText);
      throw new Error(`Fireworks API error: ${fireworksResponse.status}`);
    }

    const llmData = await fireworksResponse.json();
    const answer = llmData.choices[0].message.content;

    console.log('Successfully generated answer');

    return new Response(
      JSON.stringify({ answer, sources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in rag-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
