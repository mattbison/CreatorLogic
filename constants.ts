import { Creator, InstagramPost } from './types';

// Mock data generator for demo purposes
export const MOCK_CREATORS: Creator[] = Array.from({ length: 30 }).map((_, i) => {
  const isVerified = Math.random() > 0.8;
  const isPrivate = Math.random() > 0.9;
  const isBusiness = Math.random() > 0.6;
  const followers = Math.floor(Math.random() * 500000) + 1000;
  const hasEmail = Math.random() > 0.5;
  
  return {
    id: `mock_${i}`,
    username: `creator_${i + 1}`,
    fullName: `Influencer ${i + 1}`,
    avatarUrl: `https://picsum.photos/seed/${i + 500}/200/200`,
    isVerified,
    isPrivate,
    isBusiness,
    biography: `Creating content about lifestyle and tech. #${i+1}`,
    category: isBusiness ? 'Entrepreneur' : 'Creator',
    email: hasEmail ? `contact@creator${i+1}.com` : undefined,
    followerCount: followers,
    followingCount: Math.floor(Math.random() * 1000),
    link: `https://instagram.com/creator_${i + 1}`
  };
});

export const MOCK_POSTS: InstagramPost[] = [
  {
    "id": "3830421799189130354",
    "type": "Video",
    "shortCode": "DUoZFT4lKxy",
    "caption": "$2.5K Apple Set-Up #apple #tech #mattbison",
    "hashtags": [
      "apple",
      "tech",
      "mattbison"
    ],
    "url": "https://www.instagram.com/p/DUoZFT4lKxy/",
    "commentsCount": 0,
    "likesCount": 29,
    "timestamp": "2026-02-11T20:31:44.000Z",
    "videoViewCount": 772,
    "videoPlayCount": 1890,
    "videoDuration": 20.8,
    "displayUrl": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
    "musicInfo": {
      "artist_name": "mattbison",
      "song_name": "Original audio"
    }
  },
  {
    "id": "3831252130880383824",
    "type": "Video",
    "shortCode": "DUrV4OiFWtQ",
    "caption": "What Apple Products To Buy With $2K #apple #tech #mattbison",
    "hashtags": [
      "apple",
      "tech",
      "mattbison"
    ],
    "url": "https://www.instagram.com/p/DUrV4OiFWtQ/",
    "commentsCount": 3,
    "likesCount": 39,
    "timestamp": "2026-02-13T00:01:37.000Z",
    "videoViewCount": 1715,
    "videoPlayCount": 2948,
    "videoDuration": 30.549,
    "displayUrl": "https://images.unsplash.com/photo-1556656793-02715d8dd6f5?q=80&w=800&auto=format&fit=crop",
    "musicInfo": {
      "artist_name": "mattbison",
      "song_name": "Original audio"
    }
  },
  {
    "id": "3829817539140023424",
    "type": "Video",
    "shortCode": "DUmPsK3AHSA",
    "caption": "What Apple Products To Buy With $1K #apple #tech #mattbison",
    "hashtags": [
      "apple",
      "tech",
      "mattbison"
    ],
    "url": "https://www.instagram.com/p/DUmPsK3AHSA/",
    "commentsCount": 0,
    "likesCount": 66,
    "timestamp": "2026-02-11T00:31:24.000Z",
    "videoViewCount": 2791,
    "videoPlayCount": 4551,
    "videoDuration": 34.709,
    "displayUrl": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop",
    "musicInfo": {
      "artist_name": "mattbison",
      "song_name": "Original audio"
    }
  },
  {
    "id": "3829702859578981738",
    "type": "Video",
    "shortCode": "DUl1nXMgL1q",
    "caption": "$1K Apple Set-Up #apple #tech #mattbison",
    "hashtags": [
      "apple",
      "tech",
      "mattbison"
    ],
    "url": "https://www.instagram.com/p/DUl1nXMgL1q/",
    "commentsCount": 0,
    "likesCount": 20,
    "timestamp": "2026-02-10T20:43:22.000Z",
    "videoViewCount": 796,
    "videoPlayCount": 1995,
    "videoDuration": 18.366,
    "displayUrl": "https://images.unsplash.com/photo-1588872657578-a3d2dd1a292d?q=80&w=800&auto=format&fit=crop",
    "musicInfo": {
      "artist_name": "mattbison",
      "song_name": "Original audio"
    }
  },
  {
    "id": "3829017503268618233",
    "type": "Video",
    "shortCode": "DUjZyHZFD_5",
    "caption": "What's Better? iPhone 16 Pro vs. iPhone 17 #mattbison #apple #iphone",
    "hashtags": [
      "mattbison",
      "apple",
      "iphone"
    ],
    "url": "https://www.instagram.com/p/DUjZyHZFD_5/",
    "commentsCount": 1,
    "likesCount": 42,
    "timestamp": "2026-02-09T22:01:48.000Z",
    "videoViewCount": 2080,
    "videoPlayCount": 3385,
    "videoDuration": 25.835,
    "displayUrl": "https://images.unsplash.com/photo-1592899671815-201451396fd5?q=80&w=800&auto=format&fit=crop",
    "musicInfo": {
      "artist_name": "mattbison",
      "song_name": "Original audio"
    }
  },
  {
    "id": "3829745349464888086",
    "type": "Video",
    "shortCode": "DUl_Rq_DxMW",
    "caption": "Ultimate $1K Apple Ecosystem #apple #tech #mattbison",
    "hashtags": [
      "apple",
      "tech",
      "mattbison"
    ],
    "url": "https://www.instagram.com/p/DUl_Rq_DxMW/",
    "commentsCount": 11,
    "likesCount": 754,
    "timestamp": "2026-02-10T22:07:57.000Z",
    "videoViewCount": 19370,
    "videoPlayCount": 35896,
    "videoDuration": 34.368,
    "displayUrl": "https://images.unsplash.com/photo-1621330383317-48eb4050a96e?q=80&w=800&auto=format&fit=crop",
    "musicInfo": {
      "artist_name": "mattbison",
      "song_name": "Original audio"
    }
  },
  {
    "id": "3830467210540408906",
    "type": "Video",
    "shortCode": "DUojaIgCuBK",
    "caption": "Ultimate $2500 Apple Ecosystem #apple #tech #mattbison",
    "hashtags": [
      "apple",
      "tech",
      "mattbison"
    ],
    "url": "https://www.instagram.com/p/DUojaIgCuBK/",
    "commentsCount": 6,
    "likesCount": 439,
    "timestamp": "2026-02-11T22:02:17.000Z",
    "videoViewCount": 8409,
    "videoPlayCount": 14226,
    "videoDuration": 42.304,
    "displayUrl": "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=800&auto=format&fit=crop",
    "musicInfo": {
      "artist_name": "mattbison",
      "song_name": "Original audio"
    }
  },
  {
    "id": "3831282077597282175",
    "type": "Video",
    "shortCode": "DUrcsAlga9_",
    "caption": "Ultimate $2K Apple Ecosystem #apple #tech #mattbison",
    "hashtags": [
      "apple",
      "tech",
      "mattbison"
    ],
    "url": "https://www.instagram.com/p/DUrcsAlga9_/",
    "commentsCount": 0,
    "likesCount": 88,
    "timestamp": "2026-02-13T01:01:09.000Z",
    "videoViewCount": 3306,
    "videoPlayCount": 5879,
    "videoDuration": 32.256,
    "displayUrl": "https://images.unsplash.com/photo-1531297461136-82lw9b6d9d0d?q=80&w=800&auto=format&fit=crop",
    "musicInfo": {
      "artist_name": "mattbison",
      "song_name": "Original audio"
    }
  },
  {
    "id": "3831195352578749386",
    "type": "Video",
    "shortCode": "DUrI9_nlXPK",
    "caption": "Best Apple Products Under $2K #apple #tech #mattbison",
    "hashtags": [
      "apple",
      "tech",
      "mattbison"
    ],
    "url": "https://www.instagram.com/p/DUrI9_nlXPK/",
    "commentsCount": 0,
    "likesCount": 21,
    "timestamp": "2026-02-12T22:08:39.000Z",
    "videoViewCount": 839,
    "videoPlayCount": 2108,
    "videoDuration": 16.933,
    "displayUrl": "https://images.unsplash.com/photo-1621768216002-5ac171876625?q=80&w=800&auto=format&fit=crop",
    "musicInfo": {
      "artist_name": "mattbison",
      "song_name": "Original audio"
    }
  },
  {
    "id": "3830527190397023656",
    "type": "Video",
    "shortCode": "DUoxC9GFvWo",
    "caption": "What Apple Products To Buy With $2500 #apple #tech #mattbison",
    "hashtags": [
      "apple",
      "tech",
      "mattbison"
    ],
    "url": "https://www.instagram.com/p/DUoxC9GFvWo/",
    "commentsCount": 2,
    "likesCount": 51,
    "timestamp": "2026-02-12T00:01:21.000Z",
    "videoViewCount": 1435,
    "videoPlayCount": 2403,
    "videoDuration": 36.8,
    "displayUrl": "https://images.unsplash.com/photo-1606229338300-e56af8d522bd?q=80&w=800&auto=format&fit=crop",
    "musicInfo": {
      "artist_name": "mattbison",
      "song_name": "Original audio"
    }
  }
];