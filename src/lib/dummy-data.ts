import type { User, Poll, PollOption } from './types';

// Helper function to generate a random birth date for someone between 18 and 40
const getRandomBirthDate = (): string => {
  const now = new Date();
  const maxYear = now.getFullYear() - 18;
  const minYear = now.getFullYear() - 40;
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day).toISOString();
};


export const dummyUsers: User[] = [
  { id: 1, name: 'Yuki Tanaka', username: 'yuki_motion', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 1250 },
  { id: 2, name: 'Akira Saito', username: 'akira_dev', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 5300 },
  { id: 3, name: 'Hana Kimura', username: 'hana_chan', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 800 },
  { id: 4, name: 'Kenji Watanabe', username: 'kenji_w', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 2400 },
  { id: 5, name: 'Sakura Ishikawa', username: 'sakura_blossom', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 9100 },
  { id: 6, name: 'Ren Kato', username: 'ren_the_great', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 150 },
  { id: 7, name: 'Aoi Yamamoto', username: 'aoi_blue', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'non-binary', pollitPoints: 4200 },
  { id: 8, name: 'Daiki Mori', username: 'daiki_forest', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 3300 },
  { id: 9, name: 'Mei Nakano', username: 'mei_day', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 10000 },
  { id: 10, name: 'Haruto Abe', username: 'haruto_sun', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 0 },
  { id: 11, name: 'Emily Carter', username: 'em_carter', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 750 },
  { id: 12, name: 'Sophia Miller', username: 'sophia_m', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 1200 },
  { id: 13, name: 'Isabella Chen', username: 'isa_chen', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 680 },
  { id: 14, name: 'Olivia Rodriguez', username: 'olivia_r', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 1980 },
  { id: 15, name: 'Ava Nguyen', username: 'ava_win', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'non-binary', pollitPoints: 2300 },
  { id: 16, name: 'Mia Kim', username: 'mia_k', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 400 },
  { id: 17, name: 'Charlotte Lee', username: 'charlie_lee', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 880 },
  { id: 18, name: 'Amelia Garcia', username: 'amelia_g', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 1500 },
  { id: 19, name: 'Harper Martinez', username: 'harper_m', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'prefer-not-to-say', pollitPoints: 320 },
  { id: 20, name: 'Evelyn Davis', username: 'evelyn_d', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 950 },
  { id: 21, name: 'Liam Smith', username: 'liam_s', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 200 },
  { id: 22, name: 'Noah Johnson', username: 'noah_j', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 1100 },
  { id: 23, name: 'Oliver Williams', username: 'oliver_w', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 1800 },
  { id: 24, name: 'James Brown', username: 'james_b', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 3100 },
  { id: 25, name: 'William Jones', username: 'will_j', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 4700 },
  { id: 26, name: 'Rin Ito', username: 'rin_rin', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 80 },
  { id: 27, name: 'Sora Matsumoto', username: 'sora_sky', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'non-binary', pollitPoints: 1600 },
  { id: 28, name: 'Yui Endo', username: 'yui_end', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 2900 },
  { id: 29, name: 'Kaito Takahashi', username: 'kaito_sea', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 3500 },
  { id: 30, name: 'Asuna Suzuki', username: 'asuna_flash', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 15000 },
].map(user => ({...user, avatar: `${user.avatar}?data-ai-hint=anime+avatar`}));


const generatePolls = (): Poll[] => {
  const polls: Omit<Poll, 'id' | 'creatorId' | 'createdAt'>[] = [
    // --- 2nd Opinion Polls (30) ---
    ...Array.from({ length: 30 }).map((_, i): Omit<Poll, 'id' | 'creatorId' | 'createdAt'> => ({
      question: `Which thumbnail gets your click?`,
      description: `Trying to up my YouTube game. A/B testing these two thumbnails for my next video on productivity hacks. Which one is more eye-catching?`,
      options: [
        { id: 1, text: 'Option A', votes: Math.floor(Math.random() * 200), imageUrl: `https://placehold.co/400x300.png` },
        { id: 2, text: 'Option B', votes: Math.floor(Math.random() * 200), imageUrl: `https://placehold.co/400x300.png` },
      ],
      type: '2nd_opinion', durationMs: 24 * 60 * 60 * 1000,
      pledged: i % 4 === 0, pledgeAmount: i % 4 === 0 ? 10 : undefined,
      tipCount: Math.floor(Math.random() * 20), isNSFW: false
    })),

    // --- Standard 2-Option Polls (40) ---
    { question: "Should I text back immediately or wait an hour?", options: [{ id: 1, text: "Text back now", votes: 88 }, { id: 2, text: "Play it cool, wait", votes: 112 }], type: 'standard', durationMs: 4 * 60 * 1000, pledged: false, tipCount: 2, isNSFW: false },
    { question: "Accept the job offer or negotiate for more?", description: "The offer is fair, but I feel like I have leverage. Is it too risky to ask for 15% more?", options: [{ id: 1, text: "Take it, it's a good offer", votes: 254 }, { id: 2, text: "Negotiate, you can get more", votes: 389 }], type: 'standard', durationMs: 3 * 24 * 60 * 60 * 1000, pledged: true, pledgeAmount: 50, tipCount: 15, isNSFW: false },
    { question: "Found out my friend's partner is cheating. Tell them?", description: "This is so awkward but I feel like they have a right to know. What should I do?", options: [{ id: 1, text: "Tell them, they deserve to know", votes: 411 }, { id: 2, text: "Stay out of it, not your business", votes: 198 }], type: 'standard', durationMs: 5 * 24 * 60 * 60 * 1000, pledged: false, tipCount: 5, isNSFW: true },
    ...Array.from({ length: 37 }).map((_, i): Omit<Poll, 'id' | 'creatorId' | 'createdAt'> => ({
      question: `Simple choice #${i+1}: Coffee or Tea?`,
      options: [
        { id: 1, text: 'Coffee', votes: Math.floor(Math.random() * 100) },
        { id: 2, text: 'Tea', votes: Math.floor(Math.random() * 100) }
      ],
      type: 'standard', durationMs: 60 * 60 * 1000,
      pledged: i % 5 === 0, pledgeAmount: i % 5 === 0 ? 5 : undefined,
      tipCount: Math.floor(Math.random() * 5), isNSFW: false
    })),

    // --- Standard 3-Option Polls (20) ---
    { question: "Which streaming service should I keep?", description: "My budget is tight. Can only keep one of these three for the next few months.", options: [{ id: 1, text: "Netflix", votes: 120 }, { id: 2, text: "HBO Max", votes: 150 }, { id: 3, text: "Disney+", votes: 90 }], type: 'standard', durationMs: 2 * 24 * 60 * 60 * 1000, pledged: false, tipCount: 1, isNSFW: false },
    { question: "What should be my focus for the next 3 months?", options: [{ id: 1, text: "Get a promotion", votes: 78 }, { id: 2, text: "Get fit", votes: 123 }, { id: 3, text: "Learn a new skill", votes: 144 }], type: 'standard', durationMs: 7 * 24 * 60 * 60 * 1000, pledged: true, pledgeAmount: 100, tipCount: 22, isNSFW: false },
    ...Array.from({ length: 18 }).map((_, i): Omit<Poll, 'id' | 'creatorId' | 'createdAt'> => ({
      question: `Tough choice #${i+1}: What to do this weekend?`,
      options: [
        { id: 1, text: 'Stay in and relax', votes: Math.floor(Math.random() * 50) },
        { id: 2, text: 'Go out with friends', votes: Math.floor(Math.random() * 50) },
        { id: 3, text: 'Work on a side project', votes: Math.floor(Math.random() * 50) }
      ],
      type: 'standard', durationMs: 2 * 24 * 60 * 60 * 1000,
      pledged: i % 3 === 0, pledgeAmount: i % 3 === 0 ? 20 : undefined,
      tipCount: Math.floor(Math.random() * 10), isNSFW: false
    })),

    // --- Standard 4-Option Polls (10) ---
    {
      question: "Which tech stock should I invest $1000 in for the long term?",
      description: "Not looking for financial advice, just a gut check from the crowd. All seem promising for different reasons.",
      options: [
        { id: 1, text: "NVIDIA (AI)", votes: 210 },
        { id: 2, text: "Apple (Ecosystem)", votes: 180 },
        { id: 3, text: "Tesla (EV/Robotics)", votes: 150 },
        { id: 4, text: "Amazon (Cloud/E-commerce)", votes: 165 }
      ],
      type: 'standard',
      durationMs: 14 * 24 * 60 * 60 * 1000,
      pledged: false,
      tipCount: 8,
      isNSFW: false
    },
    ...Array.from({ length: 9 }).map((_, i): Omit<Poll, 'id' | 'creatorId' | 'createdAt'> => ({
      question: `Ultimate choice #${i+1}: Which superpower?`,
      options: [
        { id: 1, text: 'Flight', votes: Math.floor(Math.random() * 40) },
        { id: 2, text: 'Invisibility', votes: Math.floor(Math.random() * 40) },
        { id: 3, text: 'Super Strength', votes: Math.floor(Math.random() * 40) },
        { id: 4, text: 'Teleportation', votes: Math.floor(Math.random() * 40) },
      ],
      type: 'standard', durationMs: 3 * 24 * 60 * 60 * 1000,
      pledged: i % 2 === 0, pledgeAmount: i % 2 === 0 ? 50 : undefined,
      tipCount: Math.floor(Math.random() * 15), isNSFW: false
    })),
  ];

  const now = new Date();
  return polls.map((p, i) => ({
    ...p,
    id: i + 1,
    creatorId: (i % 30) + 1,
    createdAt: new Date(now.getTime() - i * 60000 * 30).toISOString(), // Stagger creation times
  }));
};


export const dummyPolls: Poll[] = generatePolls();
