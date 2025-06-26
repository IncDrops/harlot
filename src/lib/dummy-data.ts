import type { User, Poll } from './types';

// Helper function to generate a random birth date for someone between 18 and 40
const getRandomBirthDate = (): string => {
  const now = new Date();
  const maxYear = now.getFullYear() - 18;
  const minYear = now.getFullYear() - 50;
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
  { id: 9, name: 'Emma Davis', username: 'emmadavis105', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 10000 },
  { id: 10, name: 'Haruto Abe', username: 'haruto_sun', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 0 },
  { id: 11, name: 'Liam Smith', username: 'liam_s', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 200 },
  { id: 12, name: 'Noah Johnson', username: 'noah_j', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 1100 },
  { id: 13, name: 'James Brown', username: 'james_b', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 3100 },
  { id: 14, name: 'Ben Carter', username: 'bencarter', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male', pollitPoints: 4700 },
  { id: 15, name: 'Sophia Miller', username: 'sophia_m', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female', pollitPoints: 1200 },
].map(user => ({...user, avatar: `https://i.pravatar.cc/150?u=${user.username}`}));


const generatePolls = (): Poll[] => {
  const polls: Omit<Poll, 'id' | 'creatorId' | 'createdAt'>[] = [
    // --- Rich, detailed polls ---
    {
      question: "My best friend keeps ghosting me for their new S.O. Do I confront them or just accept our friendship has changed?",
      description: "We used to be inseparable, but now I barely hear from them. I feel replaced and hurt, but I also don't want to be 'that' jealous friend. What's the play here?",
      category: "Friendship",
      options: [
        { id: 1, text: "Confront them, open communication is vital", votes: 145 },
        { id: 2, text: "Give them space, they'll come back around", votes: 77 },
        { id: 3, text: "Find new friends who prioritize you", votes: 158 },
        { id: 4, text: "Send a passive-aggressive meme", votes: 72 },
      ],
      type: 'standard', durationMs: 3 * 24 * 60 * 60 * 1000,
      pledged: false, tipCount: 4, likes: 95, comments: 22, isNSFW: false,
    },
    {
      question: "Job offer is fair, but I feel I have leverage. Negotiate for 15% more or accept it?",
      description: "Got a solid offer from a dream company. It meets my needs, but my gut says I could push for more. Is the risk of them rescinding the offer worth the potential reward?",
      category: "Career",
      options: [
        { id: 1, text: "Accept the offer, don't risk it", votes: 254 },
        { id: 2, text: "Negotiate, know your worth!", votes: 389 },
      ],
      type: 'standard', durationMs: 3 * 24 * 60 * 60 * 1000,
      pledged: true, pledgeAmount: 50, tipCount: 15, likes: 250, comments: 56, isNSFW: false,
    },
    {
        question: "Which thumbnail gets your click? Trying to up my YouTube game.",
        description: "A/B testing these two thumbnails for my next video on 'The Rise of AI Influencers'. Which one is more compelling and makes you want to watch?",
        category: "Creative",
        options: [
          { id: 1, text: 'Option A (Dramatic)', votes: Math.floor(Math.random() * 200), imageUrl: `https://placehold.co/400x300.png` },
          { id: 2, text: 'Option B (Minimalist)', votes: Math.floor(Math.random() * 200), imageUrl: `https://placehold.co/400x300.png` },
        ],
        type: '2nd_opinion', durationMs: 24 * 60 * 60 * 1000,
        pledged: true, pledgeAmount: 10, tipCount: Math.floor(Math.random() * 20), likes: 180, comments: 45, isNSFW: false
      },
    {
      question: "Found out my friend's partner might be cheating. Should I tell them?",
      description: "Saw their partner on a dating app. It could be an old profile, but it feels wrong not to say anything. This is super awkward. WWYD?",
      category: "Dilemma",
      options: [
        { id: 1, text: "Tell them, they deserve to know", votes: 411 },
        { id: 2, text: "Stay out of it, not your business", votes: 198 },
        { id: 3, text: "Anonymously tip them off", votes: 250 },
      ],
      type: 'standard', durationMs: 5 * 24 * 60 * 60 * 1000,
      pledged: false, tipCount: 5, likes: 312, comments: 112, isNSFW: true,
    },
    {
      question: "Should I quit my stable 9-5 to go all-in on my startup?",
      description: "My side hustle is finally making some real money, but it's not profitable enough to replace my salary yet. Do I take the leap of faith or build it up more on the side?",
      category: "Entrepreneurship",
      options: [
        { id: 1, text: "Full send! Go all-in.", votes: 180 },
        { id: 2, text: "Keep the 9-5 until it's safer.", votes: 230 },
      ],
      type: 'standard', durationMs: 21 * 24 * 60 * 60 * 1000,
      pledged: true, pledgeAmount: 500, tipCount: 40, likes: 300, comments: 88, isNSFW: false,
    },
    {
        question: "Is it cringe to slide into DMs or a valid strat?",
        description: "There's this creator I vibe with and I wanna connect, maybe collab. Is a cold DM on IG unprofessional or is that just how networking is done now?",
        category: "Social",
        options: [
            { id: 1, text: "Shoot your shot, what's to lose?", votes: 342 },
            { id: 2, text: "Nah, find a warmer intro", votes: 158 },
        ],
        type: 'standard', durationMs: 1 * 24 * 60 * 60 * 1000,
        pledged: false, tipCount: 3, likes: 99, comments: 34, isNSFW: false
    },
    {
        question: "Which of these two logos for my new coffee brand?",
        description: "Left is more modern and minimalist, right is more rustic and classic. The brand is called 'Morning Ritual'. Help me decide on the vibe.",
        category: "Branding",
        options: [
          { id: 1, text: 'Logo A', votes: Math.floor(Math.random() * 200), imageUrl: `https://placehold.co/400x300.png` },
          { id: 2, text: 'Logo B', votes: Math.floor(Math.random() * 200), imageUrl: `https://placehold.co/400x300.png` },
        ],
        type: '2nd_opinion', durationMs: 3 * 24 * 60 * 60 * 1000,
        pledged: false, tipCount: 12, likes: 210, comments: 60, isNSFW: false
    },
    {
        question: "Hiring Manager Dilemma: Overqualified candidate or eager-to-learn junior?",
        description: "The senior candidate could do the job in their sleep but might get bored. The junior is hungry and passionate but has a steep learning curve. Who's the better long-term hire for a fast-moving team?",
        category: "Hiring",
        options: [
            { id: 1, text: "Hire the senior, you need impact now.", votes: 190 },
            { id: 2, text: "Invest in the junior, build loyalty.", votes: 220 },
            { id: 3, text: "Neither, keep searching for the perfect fit.", votes: 80 },
        ],
        type: 'standard', durationMs: 7 * 24 * 60 * 60 * 1000,
        pledged: true, pledgeAmount: 20, tipCount: 9, likes: 150, comments: 43, isNSFW: false
    },
     {
      question: "Is it better to follow your passion or a practical career path?",
      description: "My parents want me to be an accountant, but I dream of being a travel photographer. The classic head vs. heart dilemma. What's the real path to happiness?",
      category: "Life",
      options: [
        { id: 1, text: "Follow passion, you only live once.", votes: 450 },
        { id: 2, text: "Be practical, passion doesn't pay bills.", votes: 320 },
        { id: 3, text: "Find a career that balances both.", votes: 550 },
      ],
      type: 'standard', durationMs: 21 * 24 * 60 * 60 * 1000,
      pledged: false, tipCount: 25, likes: 600, comments: 150, isNSFW: false,
    },
    {
        question: "Which controller is better for competitive FPS? Scuf vs. standard",
        description: "Trying to get an edge in Warzone. Is the price tag on a Scuf controller with paddles and trigger stops actually worth it, or is it just hype? Or should I just get better with the default PS5 controller?",
        category: "Gaming",
        options: [
          { id: 1, text: 'Scuf is game-changing', votes: Math.floor(Math.random() * 200), imageUrl: `https://placehold.co/400x300.png` },
          { id: 2, text: 'Standard is fine, just git gud', votes: Math.floor(Math.random() * 200), imageUrl: `https://placehold.co/400x300.png` },
        ],
        type: '2nd_opinion', durationMs: 5 * 24 * 60 * 60 * 1000,
        pledged: false, tipCount: 8, likes: 120, comments: 68, isNSFW: false
    },
  ];

  // Fill up to 100 polls with variety
  const basePolls = polls;
  const pollTemplates = [
      // Tech
      { q: "iPhone or Android for my next upgrade?", cat: "Tech", o: ["iPhone for the ecosystem", "Android for the customization"] },
      { q: "Should I start a blog or a YouTube channel?", cat: "Creative", o: ["Blog for deep thoughts", "YouTube for personality"] },
      // Life
      { q: "Should I move to another country for a year?", cat: "Travel", o: ["Yes, experience the world!", "No, too much of a hassle"] },
      { q: "Take the promotion that requires relocation?", cat: "Career", o: ["Yes, career growth first", "No, my roots are here"] },
      // Fashion
      { q: "Beard or clean shaven for my dating profile?", cat: "Style", o: ["Beard, looks rugged", "Clean shaven, looks sharp"] },
      // Food
      { q: "Should I try going vegetarian for a month?", cat: "Health", o: ["Do it, great for you & planet", "Nah, I need my meat"] },
  ];

  while(polls.length < 100) {
      const template = pollTemplates[polls.length % pollTemplates.length];
      const isPledged = polls.length % 4 === 0;
      const optionCount = (polls.length % 5 === 0) ? 4 : ((polls.length % 3 === 0) ? 3 : 2);
      const options = [];
      if (optionCount === 4) {
          options.push({id: 1, text: "Strongly Agree", votes: Math.floor(Math.random() * 100)});
          options.push({id: 2, text: "Agree", votes: Math.floor(Math.random() * 100)});
          options.push({id: 3, text: "Disagree", votes: Math.floor(Math.random() * 100)});
          options.push({id: 4, text: "Strongly Disagree", votes: Math.floor(Math.random() * 100)});
      } else if (optionCount === 3) {
          options.push({id: 1, text: template.o[0], votes: Math.floor(Math.random() * 100)});
          options.push({id: 2, text: template.o[1], votes: Math.floor(Math.random() * 100)});
          options.push({id: 3, text: "I'm on the fence", votes: Math.floor(Math.random() * 50)});
      } else {
          options.push({id: 1, text: template.o[0], votes: Math.floor(Math.random() * 100)});
          options.push({id: 2, text: template.o[1], votes: Math.floor(Math.random() * 100)});
      }

      const is2ndOpinion = polls.length % 6 === 0;

      polls.push({
          question: template.q + ` #${Math.floor(polls.length/6)}`,
          category: template.cat,
          description: "Just a random thought I had, need a quick 2nd opinion from the world.",
          options: is2ndOpinion ? [
            { id: 1, text: 'Option A', votes: Math.floor(Math.random() * 200), imageUrl: `https://placehold.co/400x300.png` },
            { id: 2, text: 'Option B', votes: Math.floor(Math.random() * 200), imageUrl: `https://placehold.co/400x300.png` },
          ] : options,
          type: is2ndOpinion ? '2nd_opinion' : 'standard',
          durationMs: (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000,
          pledged: isPledged,
          pledgeAmount: isPledged ? Math.floor(Math.random() * 100) + 5 : undefined,
          tipCount: Math.floor(Math.random() * 20),
          likes: Math.floor(Math.random() * 500),
          comments: Math.floor(Math.random() * 100),
          isNSFW: polls.length % 15 === 0,
      })
  }


  const now = new Date();
  return polls.slice(0, 100).map((p, i) => ({
    ...p,
    id: i + 1,
    creatorId: (i % 15) + 1,
    createdAt: new Date(now.getTime() - i * 60000 * 30 * (Math.random() + 0.5)).toISOString(), // Stagger creation times
  }));
};


export const dummyPolls: Poll[] = generatePolls();
