import type { User, Poll } from './types';

export const dummyUsers: User[] = [
  { id: 1, name: 'Yuki Tanaka', username: 'yuki_motion', avatar: 'https://placehold.co/100x100.png' },
  { id: 2, name: 'Akira Saito', username: 'akira_dev', avatar: 'https://placehold.co/100x100.png' },
  { id: 3, name: 'Hana Kimura', username: 'hana_chan', avatar: 'https://placehold.co/100x100.png' },
  { id: 4, name: 'Kenji Watanabe', username: 'kenji_w', avatar: 'https://placehold.co/100x100.png' },
  { id: 5, name: 'Sakura Ishikawa', username: 'sakura_blossom', avatar: 'https://placehold.co/100x100.png' },
  { id: 6, name: 'Ren Kato', username: 'ren_the_great', avatar: 'https://placehold.co/100x100.png' },
  { id: 7, name: 'Aoi Yamamoto', username: 'aoi_blue', avatar: 'https://placehold.co/100x100.png' },
  { id: 8, name: 'Daiki Mori', username: 'daiki_forest', avatar: 'https://placehold.co/100x100.png' },
  { id: 9, name: 'Mei Nakano', username: 'mei_day', avatar: 'https://placehold.co/100x100.png' },
  { id: 10, name: 'Haruto Abe', username: 'haruto_sun', avatar: 'https://placehold.co/100x100.png' },
  { id: 11, name: 'Emily Carter', username: 'em_carter', avatar: 'https://placehold.co/100x100.png' },
  { id: 12, name: 'Sophia Miller', username: 'sophia_m', avatar: 'https://placehold.co/100x100.png' },
  { id: 13, name: 'Isabella Chen', username: 'isa_chen', avatar: 'https://placehold.co/100x100.png' },
  { id: 14, name: 'Olivia Rodriguez', username: 'olivia_r', avatar: 'https://placehold.co/100x100.png' },
  { id: 15, name: 'Ava Nguyen', username: 'ava_win', avatar: 'https://placehold.co/100x100.png' },
  { id: 16, name: 'Mia Kim', username: 'mia_k', avatar: 'https://placehold.co/100x100.png' },
  { id: 17, name: 'Charlotte Lee', username: 'charlie_lee', avatar: 'https://placehold.co/100x100.png' },
  { id: 18, name: 'Amelia Garcia', username: 'amelia_g', avatar: 'https://placehold.co/100x100.png' },
  { id: 19, name: 'Harper Martinez', username: 'harper_m', avatar: 'https://placehold.co/100x100.png' },
  { id: 20, name: 'Evelyn Davis', username: 'evelyn_d', avatar: 'https://placehold.co/100x100.png' },
  { id: 21, name: 'Liam Smith', username: 'liam_s', avatar: 'https://placehold.co/100x100.png' },
  { id: 22, name: 'Noah Johnson', username: 'noah_j', avatar: 'https://placehold.co/100x100.png' },
  { id: 23, name: 'Oliver Williams', username: 'oliver_w', avatar: 'https://placehold.co/100x100.png' },
  { id: 24, name: 'James Brown', username: 'james_b', avatar: 'https://placehold.co/100x100.png' },
  { id: 25, name: 'William Jones', username: 'will_j', avatar: 'https://placehold.co/100x100.png' },
  { id: 26, name: 'Rin Ito', username: 'rin_rin', avatar: 'https://placehold.co/100x100.png' },
  { id: 27, 'name': 'Sora Matsumoto', 'username': 'sora_sky', 'avatar': 'https://placehold.co/100x100.png' },
  { id: 28, 'name': 'Yui Endo', 'username': 'yui_end', 'avatar': 'https://placehold.co/100x100.png' },
  { id: 29, 'name': 'Kaito Takahashi', 'username': 'kaito_sea', 'avatar': 'https://placehold.co/100x100.png' },
  { id: 30, 'name': 'Asuna Suzuki', 'username': 'asuna_flash', 'avatar': 'https://placehold.co/100x100.png' }
].map(user => ({...user, avatar: `${user.avatar}?data-ai-hint=anime+avatar`}));

const now = new Date();
const fiveMinutes = 5 * 60 * 1000;
const threeDays = 3 * 24 * 60 * 60 * 1000;
const sevenDays = 7 * 24 * 60 * 60 * 1000;
const oneHour = 60 * 60 * 1000;
const oneDay = 24 * 60 * 60 * 1000;

export const dummyPolls: Poll[] = [
  // 40 two-option polls
  { id: 1, creatorId: 1, question: "BFF's bf slid in my DMs. What should I do?", options: [{ id: 1, text: "Ignore him completely", votes: 120 }, { id: 2, text: "Creep with him, yolo", votes: 30 }], type: 'standard', createdAt: now.toISOString(), durationMs: oneDay },
  { id: 2, creatorId: 2, question: "Pizza for lunch?", options: [{ id: 1, text: "Yes, always pizza", votes: 250 }, { id: 2, text: "Nah, something healthy", votes: 150 }], type: 'standard', createdAt: now.toISOString(), durationMs: fiveMinutes },
  { id: 3, creatorId: 3, question: "Should I get bangs?", options: [{ id: 1, text: "Yes, live your life!", votes: 88 }, { id: 2, text: "Risky, think it over", votes: 112 }], type: 'standard', createdAt: now.toISOString(), durationMs: oneHour },
  { id: 4, creatorId: 11, question: "Android or iOS?", options: [{ id: 1, text: "Android for life", votes: 540 }, { id: 2, text: "iOS is smoother", votes: 680 }], type: 'standard', createdAt: now.toISOString(), durationMs: sevenDays },
  { id: 5, creatorId: 12, question: "Cats or Dogs?", options: [{ id: 1, text: "Dogs are man's best friend", votes: 1024 }, { id: 2, text: "Cats are elegant overlords", votes: 980 }], type: 'standard', createdAt: now.toISOString(), durationMs: sevenDays },
  { id: 6, creatorId: 21, question: "Start a podcast or a YouTube channel?", options: [{ id: 1, text: "Podcast, I love audio", votes: 320 }, { id: 2, text: "YouTube, visuals are key", votes: 450 }], type: 'standard', createdAt: now.toISOString(), durationMs: threeDays },
  { id: 7, creatorId: 22, question: "Coffee or Tea?", options: [{ id: 1, text: "Coffee is my fuel", votes: 765 }, { id: 2, text: "Tea is a warm hug", votes: 543 }], type: 'standard', createdAt: now.toISOString(), durationMs: oneHour },
  { id: 8, creatorId: 13, question: "Move to a new city or stay here?", options: [{ id: 1, text: "New adventure!", votes: 190 }, { id: 2, text: "Home is where the heart is", votes: 210 }], type: 'standard', createdAt: now.toISOString(), durationMs: sevenDays },
  { id: 9, creatorId: 14, question: "Work from home or in the office?", options: [{ id: 1, text: "WFH forever", votes: 1200 }, { id: 2, text: "I miss the office buzz", votes: 400 }], type: 'standard', createdAt: now.toISOString(), durationMs: oneDay },
  { id: 10, creatorId: 23, question: "Invest in stocks or crypto?", options: [{ id: 1, text: "Stocks, slow and steady", votes: 600 }, { id: 2, text: "Crypto, to the moon!", votes: 850 }], type: 'standard', createdAt: now.toISOString(), durationMs: threeDays },
  ...Array.from({ length: 30 }, (_, i) => ({
    id: 11 + i,
    creatorId: (i % 30) + 1,
    question: `Swipe Poll #${i + 1}: Choose wisely!`,
    options: [
      { id: 1, text: `Option A for poll ${i + 1}`, votes: Math.floor(Math.random() * 200) },
      { id: 2, text: `Option B for poll ${i + 1}`, votes: Math.floor(Math.random() * 200) },
    ],
    type: 'standard' as 'standard',
    createdAt: now.toISOString(),
    durationMs: oneDay,
  })),

  // 20 three-option polls
  { id: 41, creatorId: 4, question: "Which streaming service to keep?", options: [{ id: 1, text: "Netflix", votes: 450 }, { id: 2, text: "Hulu", votes: 300 }, { id: 3, text: "HBO Max", votes: 400 }], type: 'standard', createdAt: now.toISOString(), durationMs: oneDay },
  { id: 42, creatorId: 15, question: "Favorite starter Pokemon?", options: [{ id: 1, text: "Bulbasaur", votes: 320 }, { id: 2, text: "Charmander", votes: 550 }, { id: 3, text: "Squirtle", votes: 480 }], type: 'standard', createdAt: now.toISOString(), durationMs: threeDays },
  { id: 43, creatorId: 24, question: "Best gaming console?", options: [{ id: 1, text: "PlayStation", votes: 800 }, { id: 2, text: "Xbox", votes: 650 }, { id: 3, text: "Nintendo Switch", votes: 750 }], type: 'standard', createdAt: now.toISOString(), durationMs: sevenDays },
   ...Array.from({ length: 17 }, (_, i) => ({
    id: 44 + i,
    creatorId: (i % 30) + 1,
    question: `Three-way choice poll #${i + 1}`,
    options: [
      { id: 1, text: `Choice 1`, votes: Math.floor(Math.random() * 100) },
      { id: 2, text: `Choice 2`, votes: Math.floor(Math.random() * 100) },
      { id: 3, text: `Choice 3`, votes: Math.floor(Math.random() * 100) },
    ],
    type: 'standard' as 'standard',
    createdAt: now.toISOString(),
    durationMs: oneDay,
  })),

  // 10 four-option polls
  { id: 61, creatorId: 5, question: "Which 'House' from Game of Thrones?", options: [{ id: 1, text: "Stark", votes: 900 }, { id: 2, text: "Lannister", votes: 700 }, { id: 3, text: "Targaryen", votes: 1100 }, { id: 4, text: "Baratheon", votes: 300 }], type: 'standard', createdAt: now.toISOString(), durationMs: sevenDays },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: 62 + i,
    creatorId: (i % 30) + 1,
    question: `The Ultimate 4-Option Poll #${i + 1}`,
    options: [
      { id: 1, text: `Pick A`, votes: Math.floor(Math.random() * 50) },
      { id: 2, text: `Pick B`, votes: Math.floor(Math.random() * 50) },
      { id: 3, text: `Pick C`, votes: Math.floor(Math.random() * 50) },
      { id: 4, text: `Pick D`, votes: Math.floor(Math.random() * 50) },
    ],
    type: 'standard' as 'standard',
    createdAt: now.toISOString(),
    durationMs: threeDays,
  })),

  // 30 2nd opinion polls
  { id: 71, creatorId: 18, question: "I'm thinking of losing my virginity. Should I use protection?", description: "This is a big step for me and I want to make the right choice. Please give me your honest opinion.", options: [{ id: 1, text: "Yes, safety first is non-negotiable.", votes: 2300 }, { id: 2, text: "No, raw is better if you trust them.", votes: 150 }], type: '2nd_opinion', createdAt: now.toISOString(), durationMs: threeDays },
  { id: 72, creatorId: 19, question: "Found out my spouse cheated. Should I stay or leave?", description: "My world is shattered. We have kids, a house... everything. But the trust is gone. What would you do?", options: [{ id: 1, text: "Leave. You deserve better.", votes: 1800 }, { id: 2, text: "Stay and try to work it out.", votes: 900 }], type: '2nd_opinion', createdAt: now.toISOString(), durationMs: sevenDays },
  { id: 73, creatorId: 20, question: "Should I quit my stable job to chase my dream?", description: "My dream is to be a painter, but it's a huge risk. My job is secure but it drains my soul.", options: [{ id: 1, text: "Yes, follow your passion!", votes: 650 }, { id: 2, text: "No, be realistic and keep the job.", votes: 850 }], type: '2nd_opinion', createdAt: now.toISOString(), durationMs: threeDays },
  { id: 74, creatorId: 29, question: "Advice for my first semester of college?", description: "I'm moving out for the first time and I'm super nervous. Any tips to survive and thrive?", options: [{ id: 1, text: "Focus on studies, party later.", votes: 120 }, { id: 2, text: "Balance is key. Join clubs!", votes: 340 }], type: '2nd_opinion', createdAt: now.toISOString(), durationMs: oneDay },
   ...Array.from({ length: 26 }, (_, i) => ({
    id: 75 + i,
    creatorId: (i % 30) + 1,
    question: `Need a 2nd Opinion: Poll #${i + 1}`,
    description: `This is a serious matter and I need your help to decide. What should I do about situation ${i + 1}?`,
    options: [
      { id: 1, text: `Do this`, votes: Math.floor(Math.random() * 100) },
      { id: 2, text: `Do that instead`, votes: Math.floor(Math.random() * 100) },
    ],
    type: '2nd_opinion' as '2nd_opinion',
    createdAt: now.toISOString(),
    durationMs: oneDay,
  })),
];
