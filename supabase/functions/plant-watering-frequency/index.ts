import { createClient } from "npm:@supabase/supabase-js@2.26.0";
Deno.serve(async (req) => {
  try {
    const env = {
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') || '',
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    };
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({
        error: 'Supabase env vars not set'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false
      }
    });
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({
        error: 'Only GET allowed'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    // Get plant_id from query parameters
    const url = new URL(req.url);
    const plant_id = url.searchParams.get('plant_id');
    if (!plant_id) return new Response(JSON.stringify({
      error: 'plant_id query parameter is required'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // Fetch plant row and join catalog
    const { data: plantRows, error: plantErr } = await supabase
      .from('plants')
      .select(`id, pot_size, has_drainage, pot_material, distance_from_window, plant_size, acquired_at, is_near_a_c, is_near_heater, soil, catalog:plant_catalog(id, name, water_needed)`)
      .eq('id', plant_id)
      .limit(1)
      .maybeSingle();
    if (plantErr) throw plantErr;
    if (!plantRows) return new Response(JSON.stringify({
      error: 'Plant not found'
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const plant = plantRows;
    const catalog = plant.catalog || {};
    const data = plant;
    // Basic rule-based calculation
    // Start with species base need (days) - convert water_needed to days
    // water_needed: 'low' = 10-14 days, 'moderate' = 7-10 days, 'high' = 3-5 days
    let days = 7; // default
    if (catalog.water_needed === 'low') {
      days = 12;
    } else if (catalog.water_needed === 'moderate') {
      days = 8;
    } else if (catalog.water_needed === 'high') {
      days = 4;
    }
    // Pot size modifier: larger pot -> more days
    // pot_size is in cm (diameter), approximate volume: larger diameter = more volume = more days
    const potSize = parseFloat(data.pot_size) || 10; // cm diameter
    if (potSize > 20) {
      days += 3;
    } else if (potSize > 15) {
      days += 1.5;
    } else if (potSize < 10) {
      days -= 1;
    }
    // Drainage
    if (data.has_drainage === false) {
      days -= 1;
    }
    // Pot material: terracotta dries faster
    if (data.pot_material && data.pot_material.toLowerCase().includes('terracotta')) {
      days -= 1;
    }
    // Distance from window / light: closer -> more light -> more frequent
    // distance_from_window is in centimeters
    if (data.distance_from_window !== undefined && data.distance_from_window !== null) {
      const d = parseFloat(data.distance_from_window);
      if (!isNaN(d)) {
        if (d < 50) { // less than 50cm = very close
          days -= 2;
        } else if (d < 200) { // less than 2m = close
          days -= 1;
        }
      }
    }
    // Plant size: larger plants need more water
    // plant_size is in cm (height)
    if (data.plant_size !== undefined && data.plant_size !== null) {
      const size = parseFloat(data.plant_size);
      if (!isNaN(size)) {
        if (size > 100) { // large plant > 100cm
          days -= 1.5;
        } else if (size < 30) { // small plant < 30cm
          days += 0.5;
        }
      }
    }
    // Age: younger -> more frequent
    // Calculate age from acquired_at
    if (data.acquired_at) {
      const acquiredDate = new Date(data.acquired_at);
      const now = new Date();
      const ageYears = (now.getTime() - acquiredDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (ageYears < 1) {
        days -= 2;
      } else if (ageYears < 3) {
        days -= 1;
      }
    }
    // Nearby AC / heater
    if (data.is_near_a_c === true) {
      days -= 1;
    }
    if (data.is_near_heater === true) {
      days -= 1.5;
    }
    // Soil type
    if (data.soil) {
      const s = data.soil.toLowerCase();
      if (s.includes('sandy')) {
        days -= 1.5;
      } else if (s.includes('peat') || s.includes('loam')) {
        days += 0.5;
      }
    }
    // Clamp days to minimum 1
    if (days < 1) days = 1;
    const nextWatering = new Date();
    nextWatering.setDate(nextWatering.getDate() + Math.round(days));
    const result = {
      plant_id,
      watering_frequency_days: Math.round(days * 10) / 10,
      next_watering_date: nextWatering.toISOString(),
    };
    // Note: We don't write back to plants table as those columns don't exist in the schema
    // The result should be used to create/update care_tasks instead
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
