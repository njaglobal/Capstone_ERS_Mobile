import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://vfswdysityecmpfmefmy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmc3dkeXNpdHllY21wZm1lZm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MjYyMTUsImV4cCI6MjA2MjQwMjIxNX0.ycbrY2fq6mom6JbnI7AjC19_ceFFojObiQe-IKAon_U'
);
