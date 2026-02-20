import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

function collectFilePaths(
  items: { name: string }[],
  prefix: string
): string[] {
  const paths: string[] = [];
  for (const item of items) {
    paths.push(`${prefix}/${item.name}`);
  }
  return paths;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please log in." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[delete-account] Account deletion requested for user", user.id);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const bucket = "avatars";
    const prefix = user.id;
    const allPaths: string[] = [];

    const { data: listData } = await supabaseAdmin.storage
      .from(bucket)
      .list(prefix);

    if (listData && listData.length > 0) {
      const paths = collectFilePaths(listData, prefix);
      allPaths.push(...paths);
    }

    if (allPaths.length > 0) {
      const { error: removeError } = await supabaseAdmin.storage
        .from(bucket)
        .remove(allPaths);

      if (removeError) {
        console.error("[delete-account] Storage remove error:", removeError.message);
      }
    }

    const { error: deleteUserError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error("[delete-account] deleteUser failed:", deleteUserError.message);
      return new Response(
        JSON.stringify({ error: "Account deletion failed. Please try again." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[delete-account] Account deleted successfully for user", user.id);

    return new Response(null, { status: 204, headers: corsHeaders });
  } catch (err) {
    console.error("[delete-account] Error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
