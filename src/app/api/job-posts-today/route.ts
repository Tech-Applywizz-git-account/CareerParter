import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL; // Frontend URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Server-side key

// Log to verify if Supabase credentials are correctly loaded
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_KEY:', SUPABASE_KEY);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase URL or Key is missing!');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    
    // Determine the target date
    let targetDate: string;
    if (dateParam === 'today' || !dateParam) {
      // Use current date for 'today' or no parameter
      targetDate = new Date().toISOString().split('T')[0];
    } else {
      // Use the provided date (format: YYYY-MM-DD)
      targetDate = dateParam;
    }
    
    console.log(`Fetching job posts count for date: ${targetDate}`);
    
    // Query to count jobs posted on the target date
    const { error, count } = await supabase
      .from('job_jobrole_sponsored')
      .select('*', { count: 'exact', head: true })
      .eq('date_posted', targetDate);

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    console.log(`Jobs posted on ${targetDate}:`, count || 0);
    
    return new Response(JSON.stringify({ 
      job_posts_today: count || 0,
      date_queried: targetDate
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error fetching job posts:", error);
    
    // Type guard to check if error has a message property
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({ 
      error: 'Error fetching job posts',
      details: errorMessage 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}