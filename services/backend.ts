
import { JobStatus, Creator, SearchHistoryItem, User, InstagramPost, Partnership, AppStoreCredentials, DailyMetric, DateRange } from '../types';
import { getSupabaseClient } from '../lib/supabase';

// --- CONFIGURATION KEYS ---
const STORAGE_KEYS = {
  TOKEN: 'creatorlogic_apify_token',
  HISTORY: 'creatorlogic_search_history',
  USER: 'creatorlogic_user',
  SUPABASE_URL: 'creatorlogic_sb_url',
  SUPABASE_KEY: 'creatorlogic_sb_key',
  PARTNERSHIPS: 'creatorlogic_partnerships',
  APP_CREDS: 'creatorlogic_app_creds',
  RESULTS: 'creatorlogic_job_results',
};

// --- HARDCODED ACTOR CONFIG ---
const ACTORS = {
  DISCOVERY: 'thenetaji/instagram-related-user-scraper',
  ANALYTICS: 'apify/instagram-reel-scraper',
  VIDEO_STATS: 'apify/instagram-reel-scraper' 
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
 */
const getEnvVar = (key: string): string | undefined => {
  const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
  try {
    // @ts-ignore
    const viteVal = import.meta.env[viteKey] || import.meta.env[key];
    if (viteVal) return viteVal;
  } catch(e) {}
  try {
     // @ts-ignore
     const procVal = process.env[viteKey] || process.env[key];
     if (procVal) return procVal;
  } catch(e) {}
  return localStorage.getItem(`creatorlogic_${key.toLowerCase()}`) || undefined;
};

// --- APIFY HELPERS ---
const apifyRequest = async (path: string, method: string = 'GET', body?: any) => {
  const token = getEnvVar('VITE_APIFY_TOKEN');
  if (!token) throw new Error('VITE_APIFY_TOKEN is missing.');

  const response = await fetch(`https://api.apify.com/v2/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`Apify Error: ${response.status}`);
  return response.json();
};

const apifyRequestText = async (path: string) => {
  const token = getEnvVar('VITE_APIFY_TOKEN');
  if (!token) throw new Error('VITE_APIFY_TOKEN is missing.');

  const response = await fetch(`https://api.apify.com/v2/${path}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) return '';
  return response.text();
};

// --- URL HELPERS ---
const getShortCode = (url: string) => {
    try {
        // Matches /p/CODE or /reel/CODE or /reels/CODE
        // Ignores query params like ?hl=en
        const match = url.match(/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/);
        if (match) return match[1];
        
        // Fallback: try parsing last segment
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(x => x);
        return parts[parts.length - 1];
    } catch { return null; }
};

export class BackendService {
  public supabase: any = null;
  public useSupabase = false;
  
  // CACHE: Source of truth for the UI session to ensure instant updates
  private _partnershipsCache: Partnership[] | null = null;
  
  // LOCK: Prevent double-firing runs
  private _isRefreshing = false;

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
    this._partnershipsCache = null;
    if (this.useSupabase) this.supabase.auth.signOut();
  }

  // --- WORKFLOWS ---
  async getHistory(): Promise<SearchHistoryItem[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const localHistory = raw ? JSON.parse(raw) : [];

    if (this.useSupabase) {
      try {
        const { data, error } = await this.supabase.from('search_jobs').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const sbHistory = data.map((d: any) => ({
            id: d.id,
            date: d.created_at,
            type: d.type || 'discovery',
            seedUsername: d.seed_username,
            status: d.status,
            resultsCount: d.results_count,
            emailsFound: d.emails_found
          }));
          // Merge logic: local is usually more up-to-date for current session
          const merged = [...localHistory];
          sbHistory.forEach((item: any) => {
            if (!merged.find(m => m.id === item.id)) {
              merged.push(item);
            }
          });
          return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
      } catch (e) {
        console.warn('[Backend] Supabase history fetch failed, using local only.');
      }
    }
    return localHistory;
  }

  async getAgencyHistory(): Promise<SearchHistoryItem[]> {
      return this.getHistory(); // Simplified for demo
  }

  private async saveHistoryItem(item: SearchHistoryItem) {
    // ALWAYS save to localStorage first
    const current = await this.getHistory();
    const newHistory = [item, ...current.filter(i => i.id !== item.id)];
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));

    if (this.useSupabase) {
      try {
        const { data: userData } = await this.supabase.auth.getUser();
        if (userData?.user) {
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
        }
      } catch (e) {
        console.warn('[Backend] Supabase history sync failed.');
      }
    }
  }

  async startSearch(seedUsername: string, limit: number): Promise<string> {
    const jobId = crypto.randomUUID();
    const sanitizedSeed = seedUsername.replace('@', '').trim();
    jobStore[jobId] = { id: jobId, type: 'discovery', seedUsername: sanitizedSeed, limit, status: { jobId, status: 'pending', progress: 0, logs: ['[System] Initializing Discovery...'], resultCount: 0 }, finalResults: [] };
    
    await this.saveHistoryItem({ id: jobId, date: new Date().toISOString(), type: 'discovery', seedUsername: sanitizedSeed, status: 'pending', resultsCount: 0, emailsFound: 0 });
    this.executeWorkflow(jobId);
    return jobId;
  }

  async startAnalytics(username: string, forceRefresh = false): Promise<string> {
    const sanitizedSeed = username.replace('@', '').trim();

    // 1. Check for existing job (Cache)
    if (!forceRefresh) {
        const existing = await this.findExistingAnalyticsJob(sanitizedSeed);
        if (existing) {
            console.log(`[Cache] Found existing analytics for ${sanitizedSeed}, returning Job ID: ${existing.id}`);
            return existing.id;
        }
    }

    // 2. If force refresh, delete old one to "overwrite"
    if (forceRefresh) {
        await this.deleteAnalyticsJob(sanitizedSeed);
    }

    const jobId = crypto.randomUUID();
    jobStore[jobId] = { id: jobId, type: 'analytics', seedUsername: sanitizedSeed, limit: 10, status: { jobId, status: 'pending', progress: 0, logs: ['[System] Initializing Analytics...'], resultCount: 0 }, finalResults: [] };

    await this.saveHistoryItem({ id: jobId, date: new Date().toISOString(), type: 'analytics', seedUsername: sanitizedSeed, status: 'pending', resultsCount: 0, emailsFound: 0 });
    this.executeWorkflow(jobId);
    return jobId;
  }

  private async findExistingAnalyticsJob(username: string): Promise<SearchHistoryItem | null> {
      const history = await this.getHistory();
      // Find most recent completed analytics job for this user
      return history.find(h => 
          h.type === 'analytics' && 
          h.seedUsername.toLowerCase() === username.toLowerCase() && 
          h.status === 'completed'
      ) || null;
  }

  private async deleteAnalyticsJob(username: string) {
      const history = await this.getHistory();
      const jobToDelete = history.find(h => h.type === 'analytics' && h.seedUsername.toLowerCase() === username.toLowerCase());
      
      if (!jobToDelete) return;

      if (this.useSupabase) {
          await this.supabase.from('search_jobs').delete().eq('id', jobToDelete.id);
          await this.supabase.from('search_results').delete().eq('job_id', jobToDelete.id);
      } else {
          const newHistory = history.filter(h => h.id !== jobToDelete.id);
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
          
          const allResults = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '{}');
          delete allResults[jobToDelete.id];
          localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(allResults));
      }
  }

  async checkJobStatus(jobId: string): Promise<{ status: JobStatus; data?: any[] }> {
    // 1. Check active job store first (Priority)
    const job = jobStore[jobId];
    if (job) {
        if (job.status.status === 'completed') {
            return { status: job.status, data: job.finalResults || [] };
        }
        return { status: job.status, data: undefined };
    }
    
    // 2. Check localStorage (Secondary)
    const history = await this.getHistory();
    const jobData = history.find(h => h.id === jobId);
    if (jobData && jobData.status === 'completed') {
        const allResults = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '{}');
        if (allResults[jobId]) {
            return { 
                status: { jobId, status: 'completed', progress: 100, logs: [], resultCount: jobData.resultsCount }, 
                data: allResults[jobId] 
            };
        }
    }

    // 3. Check Supabase (Tertiary)
    if (this.useSupabase) {
        try {
            const { data: sbJob } = await this.supabase.from('search_jobs').select('*').eq('id', jobId).single();
            if (sbJob) {
                const { data: sbRes } = await this.supabase.from('search_results').select('data').eq('job_id', jobId).single();
                return { 
                    status: { jobId, status: sbJob.status, progress: 100, logs: [], resultCount: sbJob.results_count }, 
                    data: sbRes?.data || [] 
                };
            }
        } catch (e) {
            console.warn('[Backend] Supabase job check failed.');
        }
    }
    
    throw new Error('Job not found.');
  }

  private async executeWorkflow(jobId: string) {
    const job = jobStore[jobId];
    try {
      const actorId = job.type === 'discovery' ? ACTORS.DISCOVERY : ACTORS.ANALYTICS;
      const payload = job.type === 'discovery' 
        ? { 
            username: [job.seedUsername], 
            maxItem: job.limit,
            profileEnriched: true,
            type: "similar_users"
          } 
        : { usernames: [job.seedUsername], resultsLimit: 10 };
      
      const run = await apifyRequest(`acts/${actorId.replace('/', '~')}/runs`, 'POST', payload);
      job.apifyRunId = run.data.id;
      this.poll(jobId);
    } catch (e: any) {
      job.status.status = 'failed'; job.status.logs.push(`Error: ${e.message}`);
    }
  }

  private mapDiscoveryResult(item: any): Creator {
    // ACCURATE mapping based on provided JSON example
    const username = item.username || item.user_name || '';
    const fullName = item.full_name || item.fullName || '';
    
    // STRICTLY use public_email as requested
    const email = (item.public_email || '').toString().trim();

    // Smart follower count parsing from label if missing (e.g. "35.7k followers")
    let followerCount = item.follower_count || item.followersCount || 0;
    const label = item.profile_chaining_secondary_label || item.social_context || '';
    if (!followerCount && label.toLowerCase().includes('follower')) {
        const match = label.match(/([0-9.]+)([kM]?)/i);
        if (match) {
            let val = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            if (unit === 'k') val *= 1000;
            if (unit === 'm') val *= 1000000;
            followerCount = Math.round(val);
        }
    }

    return {
      id: item.id || item.pk || item.strong_id__ || username || Math.random().toString(36).substr(2, 9),
      username: username,
      fullName: fullName,
      avatarUrl: item.profile_pic_url || item.profilePicUrl || `https://ui-avatars.com/api/?name=${username}`,
      isVerified: !!(item.is_verified || item.verified),
      isPrivate: !!(item.is_private || item.isPrivate),
      isBusiness: !!(item.is_business || item.is_professional_account || item.isBusinessAccount),
      biography: item.social_context || item.profile_chaining_secondary_label || item.biography || '', 
      externalUrl: item.external_url || item.externalUrl,
      category: item.category_name || item.category || item.business_category_name || item.categoryName,
      email: email,
      followerCount: followerCount,
      followingCount: item.following_count || item.followsCount || 0,
      mediaCount: item.media_count || item.postsCount || 0,
      link: `https://instagram.com/${username}`
    };
  }

  private mapAnalyticsResult(item: any): InstagramPost {
    return {
      id: item.id || item.shortCode || item.shortcode || Math.random().toString(36).substr(2, 9),
      type: item.type || 'video',
      shortCode: item.shortCode || item.shortcode || '',
      caption: item.caption || '',
      hashtags: item.hashtags || [],
      url: item.url || `https://instagram.com/reel/${item.shortCode || item.shortcode}`,
      commentsCount: item.commentsCount || item.comments_count || 0,
      likesCount: item.likesCount || item.likes_count || 0,
      sharesCount: item.sharesCount || item.shares_count || 0,
      timestamp: item.timestamp || item.taken_at || new Date().toISOString(),
      videoViewCount: item.videoViewCount || item.video_view_count || 0,
      videoPlayCount: item.videoPlayCount || item.video_play_count || 0,
      videoDuration: item.videoDuration || item.video_duration || 0,
      displayUrl: item.displayUrl || item.display_url || '',
      musicInfo: item.musicInfo || item.music_info
    };
  }

  private async fetchApifyLogs(runId: string): Promise<string[]> {
    try {
      const logText = await apifyRequestText(`actor-runs/${runId}/log`);
      if (!logText) return [];
      // Get last 15 lines of log
      return logText.split('\n').filter(l => !!l.trim()).slice(-15);
    } catch { return []; }
  }

  private async poll(jobId: string) {
    const job = jobStore[jobId];
    if (!job || !job.apifyRunId) return;
    
    try {
      const actorId = job.type === 'discovery' ? ACTORS.DISCOVERY : ACTORS.ANALYTICS;
      const run = await apifyRequest(`acts/${actorId.replace('/', '~')}/runs/${job.apifyRunId}`);
      
      // Update logs from Apify
      const realLogs = await this.fetchApifyLogs(job.apifyRunId);
      if (realLogs.length > 0) job.status.logs = realLogs;

      if (run.data.status === 'SUCCEEDED') {
        job.status.logs.push('[System] Run succeeded. Downloading data...');
        const rawItems = await apifyRequest(`datasets/${run.data.defaultDatasetId}/items`);
        
        if (!Array.isArray(rawItems)) {
            job.status.logs.push('[Error] Data format mismatch.');
            job.status.status = 'failed';
            return;
        }

        const mappedItems = rawItems.map((item: any) => {
          // Handle potential wrapping by some actors
          const u = item.user || item.node || item;
          return job.type === 'discovery' ? this.mapDiscoveryResult(u) : this.mapAnalyticsResult(u);
        }).filter(c => !!(c as any).username || !!(c as any).shortCode);

        // Set data IMMEDIATELY
        job.finalResults = mappedItems;
        job.status.resultCount = mappedItems.length;
        job.status.progress = 100;
        job.status.logs.push(`[System] Captured ${mappedItems.length} results.`);

        // Finalize with a small delay
        setTimeout(async () => {
            job.status.status = 'completed';
            
            const followerCount = job.type === 'discovery' ? 0 : (rawItems[0]?.ownerFollowerCount || 0);
            const historyItem: SearchHistoryItem = { 
              id: jobId, date: new Date().toISOString(), type: job.type, 
              seedUsername: job.seedUsername, status: 'completed', 
              resultsCount: mappedItems.length, 
              emailsFound: mappedItems.filter((i:any) => !!i.email).length,
              followerCount: followerCount > 0 ? followerCount : undefined
            };

            await this.saveHistoryItem(historyItem);
            
            // Save results to localStorage
            const allResults = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '{}');
            allResults[jobId] = mappedItems;
            localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(allResults));

            // Sync results to Supabase if available
            if (this.useSupabase) {
                try {
                    await this.supabase.from('search_results').upsert({ job_id: jobId, data: mappedItems });
                } catch (e) {
                    console.warn('[Backend] Supabase results sync failed.');
                }
            }
        }, 1000);

      } else if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.data.status)) {
        job.status.status = 'failed';
        job.status.logs.push(`[Error] Apify run failed: ${run.data.status}`);
      } else {
        job.status.progress = Math.min(95, job.status.progress + 2);
        setTimeout(() => this.poll(jobId), 4000);
      }
    } catch (e: any) { 
        job.status.status = 'failed'; 
        job.status.logs.push(`[Error] System error: ${e.message}`);
    }
  }

  // --- PARTNERSHIPS & TRACKING ---

  async getPartnerships(): Promise<Partnership[]> {
    // 1. Return in-memory cache if available (Fastest UI updates)
    if (this._partnershipsCache) return this._partnershipsCache;

    // 2. Fetch from Local Storage (Primary)
    const raw = localStorage.getItem(STORAGE_KEYS.PARTNERSHIPS);
    let data: Partnership[] = raw ? JSON.parse(raw) : [];

    // 3. Fetch from Supabase (Secondary Sync)
    if (this.useSupabase) {
      try {
        const { data: dbData, error } = await this.supabase.from('partnerships').select('*').order('postedDate', { ascending: false });
        if (!error && dbData) {
          // Merge logic
          const merged = [...data];
          dbData.forEach((item: any) => {
            if (!merged.find(m => m.id === item.id)) merged.push(item);
          });
          data = merged.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        }
      } catch (e) {
        console.warn('[Backend] Supabase partnerships fetch failed.');
      }
    }
    
    this._partnershipsCache = data;
    return data;
  }

  async savePartnership(p: Partnership): Promise<Partnership[]> {
    // 1. Update local cache and localStorage immediately (Primary)
    const current = await this.getPartnerships();
    const updated = [p, ...current.filter(i => i.id !== p.id)];
    this._partnershipsCache = updated;
    localStorage.setItem(STORAGE_KEYS.PARTNERSHIPS, JSON.stringify(updated));

    // 2. Persist to Supabase in background (Secondary Sync)
    if (this.useSupabase) {
      try {
        const { data: userData } = await this.supabase.auth.getUser();
        if (userData?.user) {
          await this.supabase.from('partnerships').upsert({
            ...p,
            user_id: userData.user.id
          });
        }
      } catch (e) {
        console.warn('[Backend] Supabase partnership sync failed.');
      }
    }
    return updated;
  }

  async getAppCredentials(): Promise<AppStoreCredentials | null> {
    // 1. Check Local Storage (Primary)
    const raw = localStorage.getItem(STORAGE_KEYS.APP_CREDS);
    const localCreds = raw ? JSON.parse(raw) : null;

    // 2. Sync from Supabase (Secondary)
    if (this.useSupabase) {
      try {
        const { data } = await this.supabase.from('app_store_creds').select('*').single();
        if (data) return data;
      } catch (e) {}
    }
    return localCreds;
  }

  async saveAppCredentials(creds: AppStoreCredentials) {
    // Attempt real server validation first
    try {
        const res = await fetch('/api/apple-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creds)
        });
        
        if (res.ok) {
            const data = await res.json();
            console.log("Verified Apple Connection:", data.appName);
            creds.appName = data.appName; // Update name from source
        } else {
            console.warn("API Verification Failed, falling back to local storage");
        }
    } catch(e) {
        console.warn("Backend API unavailable, using local simulation");
    }

    if (this.useSupabase) {
        try {
            const { data: userData } = await this.supabase.auth.getUser();
            if (userData?.user) {
                // In production, encryption happens here
                await this.supabase.from('app_store_creds').upsert({
                    user_id: userData.user.id,
                    ...creds
                });
            }
        } catch(e) {}
    }
    localStorage.setItem(STORAGE_KEYS.APP_CREDS, JSON.stringify(creds));
  }

  /**
   * REFRESH PARTNERSHIPS
   * Triggers Apify extraction for all active deals
   */
  async refreshPartnershipStats(manualPartnerships?: Partnership[]) {
      // Prevent double firing if already running
      if (this._isRefreshing) {
          console.log("Sync already in progress, skipping trigger.");
          return false;
      }
      
      // Prioritize explicit argument (so new items are included), otherwise use cache
      const partnerships = manualPartnerships || await this.getPartnerships();
      
      if (!partnerships || partnerships.length === 0) {
        console.warn("No partnerships to refresh");
        return;
      }

      const videoUrls = partnerships.map(p => p.videoUrl).filter(url => url && url.includes('instagram'));
      if (videoUrls.length === 0) {
        console.warn("No valid Instagram video URLs found in partnerships");
        return;
      }

      try {
          this._isRefreshing = true;

          // DIRECT APIFY CALL
          const actorInput = {
            "includeDownloadedVideo": false,
            "includeSharesCount": true,
            "includeTranscript": false,
            "onlyPostsNewerThan": "2020-01-01", 
            // CRITICAL OPTIMIZATION: Set Results Limit to exactly the # of URLs.
            // This forces the scraper to stop searching once it hits the target count.
            "resultsLimit": videoUrls.length, 
            "skipPinnedPosts": true,
            "username": videoUrls // Array of Video URLs
          };

          console.log(`Starting Apify Extraction for ${videoUrls.length} URLs:`, videoUrls);
          const run = await apifyRequest(`acts/apify~instagram-reel-scraper/runs`, 'POST', actorInput);
          console.log("Extraction started with Run ID:", run.data.id);
          
          // DO NOT AWAIT - let polling happen in background but update cache when done
          this.pollPartnershipUpdate(run.data.id);
          return true;
      } catch(e: any) {
          console.error("Partnership Refresh Failed:", e.message);
          this._isRefreshing = false;
          return false;
      }
  }

  // Polls Apify specifically for the Partnership update run
  private async pollPartnershipUpdate(runId: string) {
      try {
          const run = await apifyRequest(`acts/apify~instagram-reel-scraper/runs/${runId}`);
          
          if (run.data.status === 'SUCCEEDED') {
             const items = await apifyRequest(`datasets/${run.data.defaultDatasetId}/items`);
             console.log("Extraction Succeeded. Items Recieved:", items);
             await this.updatePartnershipsFromApify(items);
             this._isRefreshing = false; // Release lock
          } else if (['RUNNING', 'READY', 'CREATING'].includes(run.data.status)) {
             // Continue polling every 5s
             setTimeout(() => this.pollPartnershipUpdate(runId), 5000);
          } else {
             console.log("Extraction Ended with status:", run.data.status);
             this._isRefreshing = false; // Release lock even on fail
          }
      } catch(e) { 
          console.error("Polling partnership stats failed", e); 
          this._isRefreshing = false;
      }
  }

  // Maps Apify results back to Partnerships based on URL or ShortCode
  private async updatePartnershipsFromApify(items: any[]) {
      // 1. Get current state (use Cache if available for speed)
      const current = this._partnershipsCache || await this.getPartnerships();
      console.log(`Mapping ${items.length} Apify Results to ${current.length} partnerships`);

      const updated = current.map(p => {
          const pShortCode = getShortCode(p.videoUrl);
          
          // Match logic: Try ShortCode first (Reliable), then URL exact match
          const match = items.find((i: any) => {
              if (pShortCode && i.shortCode && i.shortCode === pShortCode) return true;
              if (pShortCode && i.url && i.url.includes(pShortCode)) return true;
              if (i.inputUrl === p.videoUrl) return true;
              if (i.url === p.videoUrl) return true;
              return false;
          });

          if (match) {
              console.log("MATCH FOUND for", p.videoUrl, "-> Views:", match.videoPlayCount);
              return {
                  ...p,
                  // Prioritize videoPlayCount (Reel Plays) over videoViewCount
                  views: match.videoPlayCount || match.videoViewCount || p.views,
                  likes: match.likesCount || p.likes,
                  comments: match.commentsCount || p.comments,
                  shares: match.sharesCount || p.shares
              };
          } else {
              console.warn("No match found for", p.videoUrl, "ShortCode:", pShortCode);
          }
          return p;
      });
      
      // 2. CRITICAL: Update Cache INSTANTLY so UI sees it
      this._partnershipsCache = updated;
      console.log("Cache updated with new metrics.");

      // 3. Persist to DB/Storage in background
      if (this.useSupabase) {
           const { data: userData } = await this.supabase.auth.getUser();
           if (userData?.user) {
             await this.supabase.from('partnerships').upsert(
                 updated.map((p: Partnership) => ({ ...p, user_id: userData.user.id }))
             );
           }
      } 
      localStorage.setItem(STORAGE_KEYS.PARTNERSHIPS, JSON.stringify(updated));
  }

  /**
   * REFRESH DATA SIMULATION
   */
  async fetchAppStoreStats(range: DateRange = '30d'): Promise<DailyMetric[]> {
      const days = range === '7d' ? 7 : range === '90d' ? 90 : range === 'all' ? 365 : 30;
      
      const partnerships = await this.getPartnerships();
      const data: DailyMetric[] = [];
      const today = new Date();

      const stableRandom = (input: string) => {
          let hash = 0;
          for (let i = 0; i < input.length; i++) {
              hash = ((hash << 5) - hash) + input.charCodeAt(i);
              hash = hash & hash;
          }
          return Math.abs(hash);
      }

      for (let i = days; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const seed = stableRandom(dateStr);
          let dailyInstalls = 45 + (seed % 20); 
          let dailyViews = 0;

          partnerships.forEach(p => {
             const pDate = new Date(p.postedDate);
             const pDateStr = pDate.toISOString().split('T')[0];

             if (dateStr === pDateStr) {
                 dailyViews += p.views;
             }

             const diffTime = Math.abs(date.getTime() - pDate.getTime());
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             
             if (date >= pDate && diffDays <= 7) {
                 const impact = p.views > 0 ? Math.ceil(p.views / 200) : 50; 
                 const boost = Math.floor(impact / (diffDays + 1)); 
                 dailyInstalls += boost;
             }
          });

          data.push({
              date: dateStr,
              installs: dailyInstalls,
              uninstalls: Math.floor(dailyInstalls * 0.2), 
              retention: 100 - (i % 10), 
              views: dailyViews 
          });
      }
      return data;
  }
}

export const backend = new BackendService();
