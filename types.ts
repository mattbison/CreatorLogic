export interface Creator {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  isVerified: boolean;
  isPrivate: boolean;
  isBusiness: boolean;
  
  // Enriched Data
  biography: string;
  externalUrl?: string;
  category?: string;
  email?: string;
  
  // Metrics
  followerCount?: number;
  followingCount?: number;
  mediaCount?: number; // Total posts
  
  link: string;
}

export interface JobStatus {
  jobId: string;
  status: 'pending' | 'discovery' | 'completed' | 'failed';
  progress: number;
  logs: string[];
  resultCount: number;
}

export interface SearchFilters {
  showVerifiedOnly: boolean;
  hidePrivate: boolean;
  hasEmail: boolean;
}

export interface SearchHistoryItem {
  id: string; // Job ID
  date: string; // ISO String
  type: 'discovery' | 'analytics'; // New field
  seedUsername: string; // For analytics, this is the target username
  status: 'completed' | 'failed' | 'pending';
  resultsCount: number;
  emailsFound: number;
  userId?: string; // For Agency View
  userEmail?: string; // For Agency View
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: 'admin' | 'user'; // New field
}

export interface InstagramPost {
  id: string;
  type: string;
  shortCode: string;
  caption: string;
  hashtags: string[];
  url: string;
  commentsCount: number;
  likesCount: number;
  sharesCount?: number;
  timestamp: string;
  videoViewCount?: number;
  videoPlayCount?: number;
  videoDuration?: number;
  displayUrl: string;
  musicInfo?: {
    artist_name: string;
    song_name: string;
  };
}