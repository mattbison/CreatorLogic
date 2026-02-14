import { JobStatus, Creator, SearchHistoryItem, User, InstagramPost } from '../types';
import { getSupabaseClient } from '../lib/supabase';

// --- CONFIGURATION KEYS ---
const STORAGE_KEYS = {
  TOKEN: 'creatorlogic_apify_token',
  HISTORY: 'creatorlogic_search_history',
  USER: 'creatorlogic_user',
  SUPABASE_URL: 'creatorlogic_sb_url',
  SUPABASE_KEY: 'creatorlogic_sb_key',
};

// --- HARDCODED ACTOR CONFIG ---
const ACTORS = {
  DISCOVERY: 'thenetaji/instagram-related-user-scraper',
  ANALYTICS: 'apify/instagram-reel-scraper'
};

// --- STATE ---
interface WorkflowState {
  id: string;
  type: 'discovery' | 'analytics';
  seedUsername: string;
  limit: number;
  status: JobStatus;
  apifyRunId?: string;
  finalResults: any[]; 
}
const jobStore: Record<string, WorkflowState> = {};

/**
 * ENVIRONMENT VARIABLE HELPER
 * This checks all possible locations to ensure the API keys are found.
 */
const getEnvVar = (key: string): string | undefined => {
  // Always check for VITE_ prefix as it's the standard for our build tool
  const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;

  // 1. Try standard Vite env
  try {
    // @ts-ignore
    const viteVal = import.meta.env[viteKey] || import.meta.env[key];
    if (viteVal) return viteVal;
  } catch(e) {}

  // 2. Try Vercel/Node process.env fallback
  try {
     // @ts-ignore
     const procVal = process.env[viteKey] || process.env[key];
     if (procVal) return procVal;
  } catch(e) {}

  // 3. LocalStorage fallback
  return localStorage.getItem(`creatorlogic_${key.toLowerCase()}`);
};

// --- APIFY HELPERS ---
const apifyRequest = async (path: string, method: string = 'GET', body?: any) => {
  const token = getEnvVar('VITE_APIFY_TOKEN');
  
  if (!token) {
      throw new Error('VITE_APIFY_TOKEN is missing. Please add it to your Vercel Environment Variables.');
  }

  const response = await fetch(`https://api.apify.com/v2/${path}`, {
    method,
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Apify Engine Error: ${response.status} - ${err}`);
  }
  return response.json();
};

export class BackendService {
  public supabase: any = null;
  public useSupabase = false;

  constructor() {
    this.initSupabase();
  }

  initSupabase() {
    const url = getEnvVar('VITE_SUPABASE_URL');
    const key = getEnvVar('VITE_SUPABASE_KEY');

    if (url && key) {
      this.supabase = getSupabaseClient(url, key);
      this.useSupabase = true;
    } else {
      console.warn("Supabase credentials missing. App running in local-only mode.");
      this.useSupabase = false;
    }
  }

  getConfig() {
    return {
      token: getEnvVar('VITE_APIFY_TOKEN') || '',
      supabaseUrl: getEnvVar('VITE_SUPABASE_URL') || '',
      supabaseKey: getEnvVar('VITE_SUPABASE_KEY') || '',
    };
  }

  // --- AUTH ---
  async login(email: string): Promise<{ sentMagicLink: boolean; user: User | null }> {
    if (email === 'dev@local') {
      const devUser: User = {
        id: 'dev_' + Date.now(),
        name: 'Developer',
        email: email,
        avatar: `https://ui-avatars.com/api/?name=Dev&background=334155&color=fff`,
        role: 'admin'
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(devUser));
      return { sentMagicLink: false, user: devUser };
    }

    if (this.useSupabase) {
      const { error } = await this.supabase.auth.signInWithOtp({ 
        email,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) throw error;
      return { sentMagicLink: true, user: null };
    }

    const user: User = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${email}&background=6366f1&color=fff`,
      role: 'user'
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { sentMagicLink: false, user };
  }

  async getSessionUser(): Promise<User | null> {
    const localUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (localUser) {
        const parsed = JSON.parse(localUser);
        if (parsed.id.startsWith('dev_')) return parsed;
    }

    if (this.useSupabase && this.supabase) {
      const { data } = await this.supabase.auth.getUser();
      if (data?.user) {
        const adminEmail = getEnvVar('VITE_ADMIN_EMAIL');
        const isAdmin = data.user.email?.toLowerCase() === adminEmail?.toLowerCase() || data.user.email === 'mattbison@apimedia.io';
        
        return {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.email?.split('@')[0] || 'User',
          avatar: `https://ui-avatars.com/api/?name=${data.user.email}&background=6366f1&color=fff`,
          role: isAdmin ? 'admin' : 'user'
        };
      }
    }
    return localUser ? JSON.parse(localUser) : null;
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    if (this.useSupabase) this.supabase.auth.signOut();
  }

  // --- WORKFLOWS ---
  async getHistory(): Promise<SearchHistoryItem[]> {
    if (this.useSupabase) {
      const { data, error } = await this.supabase
        .from('search_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) return [];
      return data.map((d: any) => ({
        id: d.id,
        date: d.created_at,
        type: d.type || 'discovery',
        seedUsername: d.seed_username,
        status: d.status,
        resultsCount: d.results_count,
        emailsFound: d.emails_found
      }));
    }
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  }

  async getAgencyHistory(): Promise<SearchHistoryItem[]> {
      return this.getHistory();
  }

  private async saveHistoryItem(item: SearchHistoryItem) {
    if (this.useSupabase) {
      const { data: userData } = await this.supabase.auth.getUser();
      if (!userData?.user) return;
      
      await this.supabase.from('search_jobs').upsert({
        id: item.id,
        user_id: userData.user.id,
        type: item.type,
        seed_username: item.seedUsername,
        status: item.status,
        results_count: item.resultsCount,
        emails_found: item.emailsFound,
        created_at: item.date
      });
    } else {
      const current = await this.getHistory();
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([item, ...current.filter(i => i.id !== item.id)]));
    }
  }

  async startSearch(seedUsername: string, limit: number): Promise<string> {
    const jobId = crypto.randomUUID();
    const sanitizedSeed = seedUsername.replace('@', '').trim();

    jobStore[jobId] = {
      id: jobId,
      type: 'discovery',
      seedUsername: sanitizedSeed,
      limit,
      status: { jobId, status: 'pending', progress: 0, logs: ['[System] Initializing Discovery...'], resultCount: 0 },
      finalResults: [],
    };

    await this.saveHistoryItem({
      id: jobId,
      date: new Date().toISOString(),
      type: 'discovery',
      seedUsername: sanitizedSeed,
      status: 'pending',
      resultsCount: 0,
      emailsFound: 0
    });

    this.executeWorkflow(jobId);
    return jobId;
  }

  async startAnalytics(username: string): Promise<string> {
    const jobId = crypto.randomUUID();
    const sanitizedSeed = username.replace('@', '').trim();

    jobStore[jobId] = {
      id: jobId,
      type: 'analytics',
      seedUsername: sanitizedSeed,
      limit: 10,
      status: { jobId, status: 'pending', progress: 0, logs: ['[System] Initializing Analytics...'], resultCount: 0 },
      finalResults: [],
    };

    await this.saveHistoryItem({
      id: jobId,
      date: new Date().toISOString(),
      type: 'analytics',
      seedUsername: sanitizedSeed,
      status: 'pending',
      resultsCount: 0,
      emailsFound: 0
    });

    this.executeWorkflow(jobId);
    return jobId;
  }

  async checkJobStatus(jobId: string): Promise<{ status: JobStatus; data?: any[] }> {
    const job = jobStore[jobId];
    if (job) {
        return { status: job.status, data: job.finalResults.length > 0 ? job.finalResults : undefined };
    }
    if (this.useSupabase) {
        const { data: jobData } = await this.supabase.from('search_jobs').select('*').eq('id', jobId).single();
        const { data: resData } = await this.supabase.from('search_results').select('data').eq('job_id', jobId).single();
        
        return { 
            status: { jobId, status: jobData?.status || 'completed', progress: 100, logs: [], resultCount: jobData?.results_count || 0 },
            data: resData?.data || []
        };
    }
    throw new Error('Job not found.');
  }

  private async executeWorkflow(jobId: string) {
    const job = jobStore[jobId];
    try {
      const actorId = job.type === 'discovery' ? ACTORS.DISCOVERY : ACTORS.ANALYTICS;
      const payload = job.type === 'discovery' 
        ? { username: [job.seedUsername], maxItem: job.limit, type: "similar_users", profileEnriched: true }
        : { username: [job.seedUsername], resultsLimit: 10, skipPinnedPosts: true };

      const run = await apifyRequest(`acts/${actorId.replace('/', '~')}/runs`, 'POST', payload);
      job.apifyRunId = run.data.id;
      this.poll(jobId);
    } catch (e: any) {
      job.status.status = 'failed';
      job.status.logs.push(`Error: ${e.message}`);
    }
  }

  private async poll(jobId: string) {
    const job = jobStore[jobId];
    if (!job.apifyRunId) return;

    try {
      const actorId = job.type === 'discovery' ? ACTORS.DISCOVERY : ACTORS.ANALYTICS;
      const run = await apifyRequest(`acts/${actorId.replace('/', '~')}/runs/${job.apifyRunId}`);
      
      if (run.data.status === 'SUCCEEDED') {
        const items = await apifyRequest(`datasets/${run.data.defaultDatasetId}/items`);
        job.finalResults = items;
        job.status.status = 'completed';
        job.status.progress = 100;
        
        await this.saveHistoryItem({
          id: jobId,
          date: new Date().toISOString(),
          type: job.type,
          seedUsername: job.seedUsername,
          status: 'completed',
          resultsCount: items.length,
          emailsFound: items.filter((i:any) => !!i.public_email).length
        });

        if (this.useSupabase) {
            await this.supabase.from('search_results').insert({ job_id: jobId, data: items });
        }
      } else if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.data.status)) {
        job.status.status = 'failed';
      } else {
        job.status.progress = Math.min(95, job.status.progress + 5);
        setTimeout(() => this.poll(jobId), 4000);
      }
    } catch (e) {
      job.status.status = 'failed';
    }
  }
}

export const backend = new BackendService();