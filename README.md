# 🚀 CollabFlow

**CollabFlow** is a high-performance B2B SaaS platform designed for UGC Agencies and Influencer Marketers to automate the discovery, enrichment, and analysis of creators.

## ✨ Features

- **Automated Discovery:** Identify 50-100 high-affinity lookalike profiles from a single seed username.
- **Data Enrichment:** Automatic extraction of public emails, follower counts, and category data.
- **Deep-Dive Analytics:** Calculate true CPV (Cost Per View) and CPE (Cost Per Engagement) for the last 10 Reels.
- **Agency Command Center:** Admin view to oversee team search history and pipeline activity.
- **Secure Architecture:** Built with Vite, React, Supabase, and Apify.

## 🛠️ Tech Stack

- **Frontend:** React 19, Tailwind CSS, Lucide Icons
- **Backend:** Apify Actor Engine (Instagram Scrapers)
- **Database/Auth:** Supabase
- **Deployment:** Vercel

## 🔐 Security & Environment Variables

This project uses **Zero-Secret Source Control**. All API keys must be configured in your deployment environment (e.g., Vercel) using the following keys:

- `VITE_APIFY_TOKEN`: Your Apify API Key.
- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_KEY`: Your Supabase Anon/Public Key.
- `VITE_ADMIN_EMAIL`: The master admin email for Agency View access.

## 🚀 Getting Started

1. Clone the repo.
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Build for production: `npm run build`

---
© 2025 CollabFlow Inc.