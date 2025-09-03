import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversationId, conversationType = 'academic' } = await req.json();
    console.log('Processing request:', { message: message?.slice(0, 100), conversationId, conversationType });

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    // Check if API key is available
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'Gemini API key is not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let actualConversationId = conversationId;

    // Create new conversation if not provided
    if (!conversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          type: conversationType
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return new Response(JSON.stringify({ error: 'Failed to create conversation' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      actualConversationId = newConversation.id;
      console.log('Created new conversation:', actualConversationId);
    }

    // Get conversation history for context
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('content, is_user, timestamp')
      .eq('conversation_id', actualConversationId)
      .order('timestamp', { ascending: true })
      .limit(10);

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }

    // Get user preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferences, role')
      .eq('user_id', user.id)
      .single();

    // Build system prompt based on conversation type
    const systemPrompts = {
      academic: `You are an academic mentor and expert educator. Provide detailed, step-by-step explanations that help students understand complex concepts. Use clear examples, break down problems logically, and encourage critical thinking. Always be encouraging and supportive while maintaining academic rigor.`,
      career: `You are a professional career advisor with extensive experience in various industries. Provide practical, actionable career guidance including resume optimization, interview preparation, skill development, and career path planning. Be supportive, realistic, and help users achieve their professional goals.`
    };

    const systemPrompt = systemPrompts[conversationType as keyof typeof systemPrompts] || systemPrompts.academic;

    // Prepare conversation history for Gemini
    const conversationHistory = messages?.map(msg => ({
      role: msg.is_user ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) || [];

    // Add current user message
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Add system prompt as the first message
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I\'m ready to help you as your academic and career mentor.' }]
      },
      ...conversationHistory
    ];

    console.log('Sending request to Gemini with', contents.length, 'messages');

    // Make request to Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', response.status, errorText);
      return new Response(JSON.stringify({ 
        error: `Gemini API error: ${response.status}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t generate a response. Please try again.';

    console.log('Generated AI response length:', aiContent.length);

    // Save user message to database
    const { error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: actualConversationId,
        content: message,
        is_user: true
      });

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
    }

    // Save AI response to database
    const { error: aiMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: actualConversationId,
        content: aiContent,
        is_user: false
      });

    if (aiMsgError) {
      console.error('Error saving AI message:', aiMsgError);
    }

    // Update conversation timestamp
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', actualConversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
    }
    
    console.log('Successfully processed request');
    return new Response(JSON.stringify({ 
      content: aiContent,
      conversationId: actualConversationId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Function execution error:', error);
    return new Response(JSON.stringify({ 
      error: `Server error: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});