# **App Name**: PollitAgo

## Core Features:

- Interactive Poll Feed: Implement a scroll/swipe hybrid UI for the main feed, enabling users to vote by swiping cards left or right. Disable scrolling during card animations.
- Detailed Poll View: Develop a detailed poll view accessible by clicking on a poll card, showcasing the poll title, creator details, media, options, timer, and tip/pledge data. Implement long-press functionality on the creator's name to open their profile.
- Poll Creation: Create a poll creation interface with options for standard (2-4 options) or 2nd Opinion (2 options max) polls. Include fields for media, questions, options (with affiliate links), and timer settings. Add a disclaimer about responsible polling.
- Populated Demo Data: Create an engaging dataset for an appealing demo: Build 30 demo user accounts, auto-populated anime avatars, plus about 100 compelling text-based dummy polls showcasing app's versatility. 
- Push Notifications: Enable push notifications so the users receive push notifications to let them know votes received, polls ending, tips sent/received, mentions/comments
- Affiliate Link Automation: Tool: Automatically include affiliate links targeted to match the content being polled to monetize posts where the creator did not add an affiliate link. This should be done in a way that's useful to end users, without compromising user trust.

## Style Guidelines:

- Primary accent color: Sky Blue (#3B82F6) for buttons, links, and icons to convey a clean and trustworthy vibe.
- Secondary accent color: Golden Yellow (#FACC15) for highlights, tags, and reactions to add playful accents and highlight key actions.
- Light background color: Near-white Gray (#F9FAFB) for a clean and modern default page background that ensures legibility.
- Headline font: 'League Spartan' (sans-serif) for the title, providing a modern and structured look. Note: currently only Google Fonts are supported.
- Body Font: 'Cormorant Garamond' (serif) for taglines and other text, offering a balance of clarity and readability. Note: currently only Google Fonts are supported.
- Implement rounded corners (2xl) and soft glow effects to enhance the modern, approachable Ghibli-meets-futuristic vibe. Utilize shadow-lg for poll cards to provide a soft but deep visual lift.
- Incorporate smooth card transitions, swipe card exits, and expanding result bars using Framer Motion. The total animation duration is exactly 800ms. Data update occurs at the 700ms mark (not after animation completes), and scroll lock persists for the entire 800ms duration.