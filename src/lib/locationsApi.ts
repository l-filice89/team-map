import { supabase } from "@/integrations/supabase/client";

export interface LocationResponse {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  label: string | null;
  created_at: string;
  user?: {
    email: string;
    full_name: string | null;
  };
}

export interface LocationInput {
  lat: number;
  lng: number;
  label?: string;
}

/**
 * Create or update (upsert) the current user's location
 */
export async function createOrUpdateLocation(data: LocationInput): Promise<LocationResponse> {
  const { data: result, error } = await supabase.functions.invoke<LocationResponse>('locations', {
    body: data,
    method: 'POST',
  });

  if (error) {
    throw new Error(error.message || 'Failed to create/update location');
  }

  if (!result) {
    throw new Error('No data returned from server');
  }

  return result;
}

/**
 * Update the current user's location (same as createOrUpdateLocation)
 */
export async function updateLocation(data: LocationInput): Promise<LocationResponse> {
  const { data: result, error } = await supabase.functions.invoke<LocationResponse>('locations', {
    body: data,
    method: 'PUT',
  });

  if (error) {
    throw new Error(error.message || 'Failed to update location');
  }

  if (!result) {
    throw new Error('No data returned from server');
  }

  return result;
}

/**
 * Get all users' locations (one per user)
 */
export async function getAllLocations(): Promise<LocationResponse[]> {
  const { data, error } = await supabase.functions.invoke<LocationResponse[]>('locations', {
    method: 'GET',
  });

  if (error) {
    throw new Error(error.message || 'Failed to fetch locations');
  }

  if (!data) {
    return [];
  }

  return data;
}

/**
 * Delete a location by ID (must belong to current user)
 */
export async function deleteLocationById(locationId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('locations', {
    method: 'DELETE',
    body: {},
    // Note: The location ID will be part of the function URL path
    // This requires passing it as a path parameter
  });

  // For DELETE with path parameter, we need to use a different approach
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/locations/${locationId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to delete location' }));
    throw new Error(errorData.error || 'Failed to delete location');
  }
}
