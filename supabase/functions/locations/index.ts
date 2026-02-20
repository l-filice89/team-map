import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to get authenticated user
async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.log('[locations] No Authorization header found');
    return null;
  }

  // Extract JWT token from "Bearer <token>"
  const token = authHeader.replace('Bearer ', '');
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  // Verify the JWT token
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  
  if (error) {
    console.log('[locations] Auth error:', error.message);
    return null;
  }
  
  if (!user) {
    console.log('[locations] No user found from token');
    return null;
  }

  console.log('[locations] Authenticated user:', user.id);
  return user;
}

// Validate location input
function validateLocationInput(body: any): { lat: number; lng: number; label?: string } | { error: string } {
  const { lat, lng, label } = body;

  if (typeof lat !== 'number' || lat < -90 || lat > 90) {
    return { error: 'Invalid latitude. Must be a number between -90 and 90.' };
  }

  if (typeof lng !== 'number' || lng < -180 || lng > 180) {
    return { error: 'Invalid longitude. Must be a number between -180 and 180.' };
  }

  if (label !== undefined && (typeof label !== 'string' || label.length > 255)) {
    return { error: 'Invalid label. Must be a string with max 255 characters.' };
  }

  return { lat, lng, label: label || undefined };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Please log in.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[locations] ${req.method} request from user ${user.id}`);

    // Initialize Supabase client with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const locationId = pathSegments[pathSegments.length - 1] !== 'locations' ? pathSegments[pathSegments.length - 1] : null;

    // POST /api/locations - Create or update location
    if (req.method === 'POST') {
      const body = await req.json();
      const validation = validateLocationInput(body);

      if ('error' in validation) {
        return new Response(
          JSON.stringify({ error: validation.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { lat, lng, label } = validation;

      // Check if user already has a location
      const { data: existingLocation } = await supabaseAdmin
        .from('locations')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let location;
      if (existingLocation) {
        // Update existing location
        const { data, error } = await supabaseAdmin
          .from('locations')
          .update({ lat, lng, label })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        location = data;
      } else {
        // Create new location
        const { data, error } = await supabaseAdmin
          .from('locations')
          .insert({ user_id: user.id, lat, lng, label })
          .select()
          .single();

        if (error) throw error;
        location = data;
      }

      console.log(`[locations] User ${user.id} upserted location ${location.id}`);

      return new Response(
        JSON.stringify(location),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /api/locations - Update location (same as POST)
    if (req.method === 'PUT') {
      const body = await req.json();
      const validation = validateLocationInput(body);

      if ('error' in validation) {
        return new Response(
          JSON.stringify({ error: validation.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { lat, lng, label } = validation;

      // Check if user already has a location
      const { data: existingLocation } = await supabaseAdmin
        .from('locations')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let location;
      if (existingLocation) {
        // Update existing location
        const { data, error } = await supabaseAdmin
          .from('locations')
          .update({ lat, lng, label })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        location = data;
      } else {
        // Create new location
        const { data, error } = await supabaseAdmin
          .from('locations')
          .insert({ user_id: user.id, lat, lng, label })
          .select()
          .single();

        if (error) throw error;
        location = data;
      }

      console.log(`[locations] User ${user.id} updated location ${location.id}`);

      return new Response(
        JSON.stringify(location),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /api/locations - Get all users' locations
    if (req.method === 'GET') {
      const { data: locations, error } = await supabaseAdmin
        .from('locations')
        .select(`
          id,
          user_id,
          lat,
          lng,
          label,
          created_at,
          users:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to match expected format with nested user object
      const transformedLocations = locations?.map(loc => ({
        id: loc.id,
        user_id: loc.user_id,
        lat: loc.lat,
        lng: loc.lng,
        label: loc.label,
        created_at: loc.created_at,
        user: Array.isArray(loc.users) ? loc.users[0] : loc.users
      })) || [];

      console.log(`[locations] User ${user.id} fetched ${transformedLocations.length} locations`);

      return new Response(
        JSON.stringify(transformedLocations),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /api/locations/:id - Delete location by ID
    if (req.method === 'DELETE' && locationId) {
      // First, check if the location exists and belongs to the user
      const { data: existingLocation, error: fetchError } = await supabaseAdmin
        .from('locations')
        .select('id, user_id')
        .eq('id', locationId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingLocation) {
        return new Response(
          JSON.stringify({ error: 'Location not found.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (existingLocation.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Forbidden. You can only delete your own location.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: deleteError } = await supabaseAdmin
        .from('locations')
        .delete()
        .eq('id', locationId);

      if (deleteError) throw deleteError;

      console.log(`[locations] User ${user.id} deleted location ${locationId}`);

      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: 'Method not allowed.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[locations] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: 'Internal server error.', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
