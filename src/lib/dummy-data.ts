import type { User, Poll } from './types';

// Helper function to generate a random birth date for someone over 18
const getRandomBirthDate = (): string => {
  const now = new Date();
  const eighteenYearsAgo = now.getFullYear() - 18;
  const year = eighteenYearsAgo - Math.floor(Math.random() * 20); // Between 18 and 38 years old
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day).toISOString();
};


export const dummyUsers: User[] = [
  { id: 1, name: 'Yuki Tanaka', username: 'yuki_motion', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 2, name: 'Akira Saito', username: 'akira_dev', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male' },
  { id: 3, name: 'Hana Kimura', username: 'hana_chan', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 4, name: 'Kenji Watanabe', username: 'kenji_w', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male' },
  { id: 5, name: 'Sakura Ishikawa', username: 'sakura_blossom', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 6, name: 'Ren Kato', username: 'ren_the_great', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male' },
  { id: 7, name: 'Aoi Yamamoto', username: 'aoi_blue', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'non-binary' },
  { id: 8, name: 'Daiki Mori', username: 'daiki_forest', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male' },
  { id: 9, name: 'Mei Nakano', username: 'mei_day', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 10, name: 'Haruto Abe', username: 'haruto_sun', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male' },
  { id: 11, name: 'Emily Carter', username: 'em_carter', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 12, name: 'Sophia Miller', username: 'sophia_m', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 13, name: 'Isabella Chen', username: 'isa_chen', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 14, name: 'Olivia Rodriguez', username: 'olivia_r', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 15, name: 'Ava Nguyen', username: 'ava_win', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'non-binary' },
  { id: 16, name: 'Mia Kim', username: 'mia_k', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 17, name: 'Charlotte Lee', username: 'charlie_lee', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 18, name: 'Amelia Garcia', username: 'amelia_g', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 19, name: 'Harper Martinez', username: 'harper_m', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'prefer-not-to-say' },
  { id: 20, name: 'Evelyn Davis', username: 'evelyn_d', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 21, name: 'Liam Smith', username: 'liam_s', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male' },
  { id: 22, name: 'Noah Johnson', username: 'noah_j', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male' },
  { id: 23, name: 'Oliver Williams', username: 'oliver_w', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male' },
  { id: 24, name: 'James Brown', username: 'james_b', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male' },
  { id: 25, name: 'William Jones', username: 'will_j', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male' },
  { id: 26, name: 'Rin Ito', username: 'rin_rin', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 27, name: 'Sora Matsumoto', username: 'sora_sky', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'non-binary' },
  { id: 28, name: 'Yui Endo', username: 'yui_end', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
  { id: 29, name: 'Kaito Takahashi', username: 'kaito_sea', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'male' },
  { id: 30, name: 'Asuna Suzuki', username: 'asuna_flash', avatar: 'https://placehold.co/100x100.png', birthDate: getRandomBirthDate(), gender: 'female' },
].map(user => ({...user, avatar: `${user.avatar}?data-ai-hint=anime+avatar`}));


const pollTopics = [
  { question: "Red lipstick or nude for tonight's date?", options: ["Go bold with red", "Keep it classic nude"], durationMs: 3 * 60 * 1000 },
  { question: "Should I text back immediately or wait an hour?", options: ["Text back now, who cares", "Play it cool, wait"], durationMs: 4 * 60 * 1000 },
  { question: "Which outfit for the job interview?", options: ["Suit up, formal FTW", "Business casual is fine"], description: "Got an interview at a tech startup. Do I go full suit or is that too much?", durationMs: 2 * 60 * 60 * 1000 },
  { question: "Should I cut my hair short?", options: ["Do it! It'll grow back", "Nah, long hair is life"], description: "Been thinking about a pixie cut for ages but I'm scared. Help!", durationMs: 3 * 24 * 60 * 60 * 1000 },
  { question: "Should I buy these expensive sneakers?", options: ["Treat yourself", "Save your money"], description: "They're limited edition, but the price is STEEP. Are they worth the hype?", durationMs: 2 * 24 * 60 * 60 * 1000 },
  { question: "Pizza or sushi for dinner?", options: ["Gimme that cheesy goodness", "Sushi is healthier and tastier"], durationMs: 15 * 60 * 1000 },
  { question: "Should I go vegetarian for a month?", options: ["Yes, great for you & the planet", "Bacon is too good to quit"], durationMs: 2 * 60 * 60 * 1000 },
  { question: "Hiring manager here: hire the brilliant jerk or the hardworking B-player?", options: ["Brilliant jerk, talent is rare", "Hardworking B-player, culture is key"], description: "The first candidate is a 10x engineer but has a history of being difficult. The second is a solid team player who gets things done. Who do I bet on?", durationMs: 3 * 24 * 60 * 60 * 1000 },
  { question: "Should I ask for a raise this quarter?", options: ["Yes, know your worth!", "Wait for the annual review"], description: "I've crushed all my KPIs this year and took on extra projects. Is now the time to ask or should I wait?", durationMs: 7 * 24 * 60 * 60 * 1000 },
  { question: "Accept the job offer or negotiate for more?", options: ["Take it, it's a good offer", "Negotiate, you can get more"], description: "The offer is fair, but I feel like I have leverage. Is it too risky to ask for 15% more?", durationMs: 3 * 24 * 60 * 60 * 1000 },
  { question: "Is it too early to say 'I love you'?", options: ["If you feel it, say it", "Wait at least 3 months"], description: "We've been dating for 6 weeks but it feels so right. Am I crazy?", durationMs: 3 * 24 * 60 * 60 * 1000 },
  { question: "Should we move in together?", options: ["Yes, take the next step!", "Don't rush it, enjoy dating"], description: "Been together a year. It seems logical to save on rent but is it too soon to merge our lives?", durationMs: 14 * 24 * 60 * 60 * 1000 },
  { question: "Found out my friend's partner is cheating. Tell them?", options: ["Tell them, they deserve to know", "Stay out of it, not your business"], isNSFW: true, durationMs: 5 * 24 * 60 * 60 * 1000 },
  { question: "Should I buy or rent in this market?", options: ["Buy, build equity", "Rent, stay flexible"], description: "The housing market is insane right now. Is it better to lock in a mortgage or wait it out and rent?", durationMs: 31 * 24 * 60 * 60 * 1000 },
  { question: "Should I join the expensive gym or workout at home?", options: ["Gym, the vibe motivates", "Home, save money and time"], durationMs: 3 * 24 * 60 * 60 * 1000 },
  { question: "Morning or evening workout routine?", options: ["Morning, get it done", "Evening, de-stress from the day"], durationMs: 2 * 24 * 60 * 60 * 1000 },
  { question: "Pay off debt or build emergency fund first?", options: ["Emergency fund first", "Tackle that high-interest debt"], description: "I have $5k in credit card debt but only $1k in savings. What's the priority?", durationMs: 21 * 24 * 60 * 60 * 1000 },
  { question: "Should I go back to school for my Master's?", options: ["Yes, invest in yourself", "No, experience is more valuable"], description: "I'm 30 and considering an MBA. Is the debt worth the potential career boost?", durationMs: 31 * 24 * 60 * 60 * 1000 },
  { question: "Solo travel or group trip for Southeast Asia?", options: ["Solo, complete freedom", "Group, more fun and safer"], durationMs: 7 * 24 * 60 * 60 * 1000 },
  { question: "iPhone or Android for my upgrade?", options: ["iPhone, the ecosystem is king", "Android, for the customization"], durationMs: 7 * 24 * 60 * 60 * 1000 },
  { question: "Should I start a blog or YouTube channel?", options: ["Blog, I'm a better writer", "YouTube, video is the future"], description: "I want to share my passion for vintage synths. What's the better platform to build a community?", durationMs: 10 * 24 * 60 * 60 * 1000 },
  { question: "Gaming console (PS5) or PC upgrade?", options: ["PS5 for the exclusives", "Upgrade the PC for max power"], description: "Can only afford one right now. My PC is getting old but I really want to play the new Spider-Man.", durationMs: 14 * 24 * 60 * 60 * 1000 },
  { question: "Is it time to put my parent in assisted living?", options: ["Yes, it's time for professional care", "No, try to keep them at home longer"], isNSFW: true, description: "This is the hardest decision of my life. Their health is declining but they want to stay home. I'm so torn.", durationMs: 21 * 24 * 60 * 60 * 1000 },
  { question: "Should I pursue music seriously?", options: ["Chase your dream, full time", "Keep it as a passion project"], durationMs: 31 * 24 * 60 * 60 * 1000 },
  { question: "Is it better to be feared or loved?", options: ["Feared. Respect is everything.", "Loved. Connection matters more."], durationMs: 7 * 24 * 60 * 60 * 1000 },
  { question: "Should we explore space or fix Earth first?", options: ["Explore space, it's our destiny", "Fix Earth, we only have one"], durationMs: 14 * 24 * 60 * 60 * 1000 },
  { question: "Book the spontaneous weekend getaway?", options: ["YOLO, book it now", "Be responsible, save the money"], description: "Found a cheap flight to Miami for this weekend. Should I just go for it?", durationMs: 2 * 60 * 60 * 1000 },
  { question: "Should I learn to skateboard at 30?", options: ["Never too old to learn!", "Probably gonna break a hip"], durationMs: 3 * 60 * 60 * 1000 },
  { question: "Should I move to another country?", options: ["Yes, for the adventure of a lifetime", "No, stay close to home and family"], durationMs: 31 * 24 * 60 * 60 * 1000 },
  { question: "Is it time to come out to my family?", options: ["Yes, live your truth", "Wait until you're fully ready"], isNSFW: true, description: "They're pretty traditional and I'm terrified of their reaction. But hiding is exhausting.", durationMs: 21 * 24 * 60 * 60 * 1000 },
  { question: "Should I get plastic surgery?", options: ["Do what makes you happy", "Learn to love yourself as you are"], isNSFW: true, durationMs: 14 * 24 * 60 * 60 * 1000 },
  { question: "Botox or age naturally?", options: ["Botox, fight those wrinkles!", "Age gracefully, it's beautiful"], isNSFW: true, durationMs: 14 * 24 * 60 * 60 * 1000 },
  { question: "Should I report my friend's tax evasion?", options: ["Report it, it's the law", "Stay loyal, it's not your business"], description: "My buddy bragged about writing off his entire vacation as a business expense. I know it's wrong but he's my friend.", durationMs: 7 * 24 * 60 * 60 * 1000 },
  { question: "Keep the wallet I found or turn it in?", options: ["Finders keepers", "Turn it in to the police"], description: "Found a wallet with $500 cash and credit cards. No ID. What's the move?", durationMs: 3 * 60 * 60 * 1000 },
  { question: "Should I tell my friend their partner hit on me?", options: ["Yes, your friend needs to know", "No, it will just cause drama"], isNSFW: true, durationMs: 5 * 24 * 60 * 60 * 1000 },
  { question: "Venture Capitalist Dilemma: Fund the unproven genius or the proven but slow-growth team?", options: ["Bet on the 100x potential genius", "Go with the safe, reliable team"], description: "As a VC, I have to make a call. One team could change the world but has a 90% chance of failure. The other is a guaranteed 3x return. Where do I put my fund's money?", durationMs: 7 * 24 * 60 * 60 * 1000 },
  { question: "Which programming language should I learn first?", options: ["Python, it's versatile", "JavaScript, for web dev"], durationMs: 14 * 24 * 60 * 60 * 1000 },
  { question: "Should I change my major?", options: ["Yes, follow your new passion", "Stick with it, you're almost done"], description: "I'm a junior in accounting but just discovered I love graphic design. Is it too late to switch?", durationMs: 21 * 24 * 60 * 60 * 1000 },
  { question: "Freelancing or full-time employment?", options: ["Freelance, be your own boss", "Full-time for the stability"], durationMs: 28 * 24 * 60 * 60 * 1000 },
  { question: "Which anniversary gift shows I care most?", options: ["Expensive jewelry", "A thoughtful, handmade gift"], durationMs: 2 * 24 * 60 * 60 * 1000 },
  { question: "Hardwood floors or luxury vinyl?", options: ["Hardwood, it's classic", "LVP, it's durable and cheaper"], durationMs: 5 * 24 * 60 * 60 * 1000 },
  { question: "Which paint color for the living room?", options: ["Cozy dark gray", "Bright, airy white"], durationMs: 3 * 24 * 60 * 60 * 1000 },
  { question: "Should I run the marathon this year?", options: ["Go for it, you can do it!", "Train for a half-marathon first"], durationMs: 21 * 24 * 60 * 60 * 1000 },
  { question: "Therapy or self-help books for my anxiety?", options: ["Therapy, get professional help", "Self-help books can work"], durationMs: 10 * 24 * 60 * 60 * 1000 },
  { question: "Should I buy or lease the car?", options: ["Buy it, own your asset", "Lease it, lower payments"], durationMs: 10 * 24 * 60 * 60 * 1000 },
  { question: "Backpacking or luxury travel?", options: ["Backpacking, for the adventure", "Luxury, for the comfort"], durationMs: 21 * 24 * 60 * 60 * 1000 },
  { question: "Airbnb or hotel for this destination?", options: ["Airbnb for a local feel", "Hotel for the amenities"], durationMs: 4 * 24 * 60 * 60 * 1000 },
  { question: "Should I delete social media for a month?", options: ["Yes, a digital detox is needed", "No, I'll get FOMO"], durationMs: 3 * 24 * 60 * 60 * 1000 },
  { question: "Should I have kids now or wait?", options: ["Have them now while you're young", "Wait until you're more established"], durationMs: 31 * 24 * 60 * 60 * 1000 },
  { question: "Move closer to family or stay independent?", options: ["Family is everything", "Keep your independence"], durationMs: 28 * 24 * 60 * 60 * 1000 },
  { question: "Learn guitar or piano first?", options: ["Guitar is cooler", "Piano is more foundational"], durationMs: 14 * 24 * 60 * 60 * 1000 },
  { question: "Is social media connecting or dividing us?", options: ["Connecting us globally", "Dividing us into bubbles"], durationMs: 7 * 24 * 60 * 60 * 1000 },
  { question: "Should I adopt this stray cat?", options: ["Yes, give it a home!", "No, it's a big responsibility"], description: "This little guy has been hanging around my porch. He's so sweet but I'm not sure if I'm ready.", durationMs: 4 * 60 * 60 * 1000 },
  { question: "Should I get a motorcycle license?", options: ["Yes, feel the freedom!", "No, it's too dangerous"], durationMs: 6 * 60 * 60 * 1000 },
  { question: "Should I leave my 10-year marriage?", options: ["If you're unhappy, yes", "Try counseling first"], isNSFW: true, description: "We've grown apart and it feels like we're just roommates. Is love not being enough, enough of a reason to leave?", durationMs: 31 * 24 * 60 * 60 * 1000 },
  { question: "Concert or theater show this weekend?", options: ["Concert, let's rock out!", "Theater, for some culture"], durationMs: 3 * 24 * 60 * 60 * 1000 },
  { question: "Embrace my gray hair or keep dyeing it?", options: ["Embrace the gray, it's distinguished", "Keep dyeing, stay youthful"], durationMs: 7 * 24 * 60 * 60 * 1000 },
  { question: "Should I buy a gun for home protection?", options: ["Yes, it's your right to be safe", "No, more guns isn't the answer"], isNSFW: true, durationMs: 21 * 24 * 60 * 60 * 1000 },
  { question: "Take the DNA ancestry test?", options: ["Yes, find out who you are!", "No, I don't trust them with my data"], durationMs: 3 * 24 * 60 * 60 * 1000 },
];

const generateMorePolls = (count: number) => {
    const morePolls = [];
    const questions = [
        "Coffee or tea to start the day?",
        "Workout in the morning or evening?",
        "Read a book or watch a movie?",
        "Call or text?",
        "Save money or spend it on experiences?",
        "Early bird or night owl?",
        "City life or country living?",
        "Cook at home or eat out?",
        "Mountains or beach for vacation?",
        "Action movie or comedy?"
    ];
    const options = [
        ["Coffee", "Tea"],
        ["Morning", "Evening"],
        ["Book", "Movie"],
        ["Call", "Text"],
        ["Save", "Spend"],
        ["Early bird", "Night owl"],
        ["City", "Country"],
        ["Cook", "Eat out"],
        ["Mountains", "Beach"],
        ["Action", "Comedy"]
    ];

    for (let i = 0; i < count; i++) {
        const qIndex = i % questions.length;
        morePolls.push({
            question: questions[qIndex],
            options: [options[qIndex][0], options[qIndex][1]],
            durationMs: (i % 5 + 1) * 24 * 60 * 60 * 1000
        });
    }
    return morePolls;
};

// We need 100 total polls. We have 60 detailed ones. Let's generate 40 more simple ones.
const additionalPolls = generateMorePolls(40);

const allPollTopics = [...pollTopics, ...additionalPolls];

const now = new Date();

export const dummyPolls: Poll[] = allPollTopics.map((topic, i) => ({
  id: i + 1,
  creatorId: (i % 30) + 1,
  question: topic.question,
  description: (topic as any).description,
  options: [
    { id: 1, text: topic.options[0], votes: Math.floor(Math.random() * 500) + 10 },
    { id: 2, text: topic.options[1], votes: Math.floor(Math.random() * 500) + 10 },
  ],
  type: 'standard',
  createdAt: now.toISOString(),
  durationMs: topic.durationMs,
  pledged: Math.random() > 0.5,
  tipCount: Math.floor(Math.random() * 50),
  isNSFW: (topic as any).isNSFW || false,
}));
