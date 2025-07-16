
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, eventTitle } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration not found');
    }

    // Initialize Supabase client with service role key for storage access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create a more descriptive prompt for event banners
    const enhancedPrompt = `Create a vibrant, engaging event banner image for "${eventTitle}". ${prompt}. The image should be suitable for an event poster, with good composition and appealing colors. Style: modern, clean, professional event photography.`;

    console.log('Generating image with OpenAI...');
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // For gpt-image-1, the response contains base64 data
    let imageData: Uint8Array;
    let imageUrl: string;
    
    if (data.data[0].b64_json) {
      // Convert base64 to binary
      const base64Data = data.data[0].b64_json;
      const binaryString = atob(base64Data);
      imageData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        imageData[i] = binaryString.charCodeAt(i);
      }
    } else if (data.data[0].url) {
      // Download from URL if provided
      console.log('Downloading image from OpenAI URL...');
      imageUrl = data.data[0].url;
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to download image from OpenAI');
      }
      imageData = new Uint8Array(await imageResponse.arrayBuffer());
    } else {
      throw new Error('No image data received from OpenAI');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `banner-${timestamp}.png`;
    
    console.log('Uploading image to Supabase Storage...');
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('event-banners')
      .upload(fileName, imageData, {
        contentType: 'image/png',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('event-banners')
      .getPublicUrl(fileName);

    const finalImageUrl = publicUrlData.publicUrl;
    console.log('Image uploaded successfully:', finalImageUrl);

    return new Response(JSON.stringify({ imageUrl: finalImageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-event-banner function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
