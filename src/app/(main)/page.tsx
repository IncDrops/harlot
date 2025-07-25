
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from "next/legacy/image";
import Link from 'next/link';
import { Loader2, Brain } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AnimatedCard, ExampleCard } from '@/components/animated-card';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Input } from '@/components/ui/input';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';


const exampleData = [
  {
    id: 1,
    query: "I'm considering engaging in sex for the first time and want to know if I should use a condom, and if so, why. I'd like two decisions.",
    tone: "Friendly",
    variants: 2,
    response: [
      {
        title: "Option 1 (Firm Decision)",
        text: "Given the profound importance of your well-being, the clearest and safest choice is to **absolutely use a condom**. This firm decision prioritizes your health by significantly reducing the risk of sexually transmitted infections (STIs) and preventing unintended pregnancy. Beyond physical safety, it demonstrates respect for yourself and your partner, fostering a sense of responsibility and trust during such a significant moment. Prioritizing protection allows you to focus on the emotional connection with greater peace of mind."
      },
      {
        title: "Option 2 (Firm Decision)",
        text: "When considering this big step, the decision is **yes, you should use a condom**, provided both emotional and mental connections are strong and you're fully prepared to take necessary safety measures. While passion and mental connection are vital for intimacy, it's crucial to acknowledge that they don't alter health risks. A condom remains the most effective barrier against STIs and pregnancy, ensuring a responsible and healthier experience for both parties involved. Prioritize both your emotional bond *and* your physical safety to make this experience truly meaningful and free from undue worry."
      }
    ]
  },
  {
    id: 2,
    query: "I just found out my husband has been cheating with the neighbor and had a child with the neighbor's college-aged daughter. Should I leave him?",
    tone: "Professional",
    variants: 3,
    response: [
      {
        title: "Option 1 (Firm Decision)",
        text: "Considering the profound betrayal, breach of trust, and the establishment of a separate family unit by your husband, the most prudent and self-preserving decision, based on the principle of personal well-being, is to **initiate steps to separate or leave the marriage.** This firm decision acknowledges the severity of the actions, which fundamentally undermine the marital contract and your emotional safety."
      },
      {
        title: "Option 2 (Firm Decision)",
        text: "Given the complex and deeply damaging nature of your husband's actions, which involve infidelity and the creation of a child with another, a balanced assessment points to the decision that **exploring separation as a primary option is advisable.** This approach allows for a structured evaluation of your individual needs, legal implications, and emotional recovery without remaining in a situation that has demonstrated such significant disregard for your partnership."
      },
      {
        title: "Option 3 (Firm Decision)",
        text: "In light of the disclosed information regarding your husband's infidelity and the existence of a child with another individual, the paramount consideration shifts to your long-term stability and emotional health. Therefore, the decision to **consult legal counsel immediately to understand your rights and options regarding separation or divorce is a necessary and firm next step.** This proactive measure enables you to protect your interests while you process the emotional impact of these revelations."
      }
    ]
  },
  {
    id: 3,
    query: "I'm watching the game, I want one more beer, but my wife said no. I told her I'd go with whatever the bot decides. Should I have one or not?",
    tone: "Friendly",
    variants: 1,
    response: [
      {
        title: "",
        text: "Given your commitment to your wife's wishes, the friendly advice is to **skip that extra beer tonight.** Enjoy the game, knowing you're honoring your agreement and fostering a little harmony. There's always tomorrow for a cold one!"
      }
    ]
  },
  {
    id: 4,
    query: "What should I have for lunch? I'm at work and have no idea.",
    tone: "Firm",
    variants: 1,
    response: [
      {
        title: "",
        text: "Your lunch decision is firm: **Choose a balanced meal that includes protein and vegetables.** This will sustain your energy and focus for the rest of your workday. Avoid heavy, high-sugar options."
      }
    ]
  },
  {
    id: 5,
    query: "I'm miserable in my high-paying corporate job, but it's stable. I want to pursue my passion for pottery, which would mean a huge pay cut and uncertainty. Should I make the leap?",
    tone: "Professional",
    variants: 2,
    response: [
       {
        title: "Option 1 (Firm Decision)",
        text: "Given the significant impact on your mental well-being from your current role and the potential for fulfillment in a new path, the firm decision is to **begin strategic preparation for a transition into pottery.** This involves creating a detailed financial contingency plan, networking within the pottery community, and potentially starting pottery as a serious side venture to test the waters before fully committing."
      },
      {
        title: "Option 2 (Firm Decision)",
        text: "Considering the trade-off between current stability and potential future happiness, the advised decision is to **prioritize your mental health by systematically exploring how to integrate more pottery into your life, initially without abandoning your current job entirely.** This means setting specific timelines for saving, developing your craft, and validating market demand for your pottery before considering a full career change. This approach mitigates immediate financial risk while actively moving towards your passion."
      }
    ]
  },
  {
    id: 6,
    query: "My friend asked for a large loan ($10,000) that they say they'll pay back, but I've heard they're not great with money. Should I lend it?",
    tone: "Firm",
    variants: 1,
    response: [
       {
        title: "",
        text: "The firm decision regarding this loan request is **no, do not lend the $10,000 to your friend.** Lending money to friends, especially large sums with a history of poor money management, carries significant risk to both your finances and the friendship itself. If you wish to help, consider offering a smaller sum that you are comfortable losing, or offer non-financial support instead."
      }
    ]
  },
   {
    id: 7,
    query: "I'm drafting a social media post about a highly controversial political topic. I want to express my opinion strongly. Should I post it?",
    tone: "Professional",
    variants: 2,
    response: [
       {
        title: "Option 1 (Firm Decision)",
        text: "Given the potential for significant backlash and professional repercussions when posting strong opinions on highly controversial topics on public platforms, the firm decision is to **reframe or refrain from posting the drafted content as a public statement.** Consider alternative avenues for expression or refine your message to be more nuanced if public discourse is your primary goal."
      },
      {
        title: "Option 2 (Firm Decision)",
        text: "When weighing the desire for strong expression against the professional and personal implications of engaging in highly controversial political discourse on social media, the advised decision is to **re-evaluate the strategic objective of this post.** If impact without broad negative consequence is desired, focus on factual presentation, respectful dialogue, or consider if social media is the optimal platform for this specific message. Proceeding as drafted carries inherent risk."
      }
    ]
  },
   {
    id: 8,
    query: "I have an idea for a subscription box service for niche artisanal dog treats. Is this a viable business idea?",
    tone: "Friendly",
    variants: 1,
    response: [
       {
        title: "",
        text: "That sounds like a fun idea! The friendly opinion is: **Yes, it could definitely be a viable business idea!** The pet market is huge, and niche products often find passionate customers. Your next step would be to research the competition, identify your unique selling points, and test the market with a small pilot program. Go for it!"
      }
    ]
  },
   {
    id: 9,
    query: "My partner just got an amazing job offer in a city across the country, which means I'd have to leave my current job and network. Should we move?",
    tone: "Firm",
    variants: 2,
    response: [
       {
        title: "Option 1 (Firm Decision)",
        text: "Given the significant career opportunity for your partner, the firm decision is to **undertake a comprehensive, joint cost-benefit analysis of the relocation.** This must include a detailed assessment of your own career prospects in the new city, potential networking strategies, and the overall financial and emotional impact on both of you. Do not proceed without this thorough evaluation."
      },
      {
        title: "Option 2 (Firm Decision)",
        text: "Considering the dual impact of this decision on both your partner's career advancement and your personal professional stability, the advised decision is to **negotiate for a trial period or interim solutions before committing to a full relocation.** This might involve your partner temporarily relocating first, or exploring remote work options for you, to minimize immediate disruption and assess long-term feasibility and mutual satisfaction with the new environment."
      }
    ]
  },
  {
    id: 10,
    query: "I really want this new expensive gadget, but it's not a necessity. My budget allows it, but should I spend the money?",
    tone: "Friendly",
    variants: 1,
    response: [
      {
        title: "",
        text: "If your budget truly allows and it brings you genuine joy, then the friendly advice is: **Go ahead and get that gadget!** Sometimes, treating yourself to something you desire can boost your mood and motivation. Just make sure it won't impact any essential savings goals."
      }
    ]
  }
];

// Mock function to simulate fetching data from an API
async function fetchItems(start: number, count: number): Promise<any[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      // In a real app, this would be an API call. Here, we slice our static data.
      const items = exampleData.slice(start, start + count);
      resolve(items);
    }, 800); // Simulate network delay
  });
}

const Header = () => (
  <header className="sticky top-0 z-50 glassmorphic">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center h-20">
        <Link href="/" className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold font-heading">Pollitago.ai</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">The Official AI Second Opinion & Decision App</p>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="#decision-tool" className="hover:text-primary transition-colors">How It Works</Link>
          <Link href="#indecision-costs" className="hover:text-primary transition-colors">Why Pollitago?</Link>
          <Link href="#ai-examples" className="hover:text-primary transition-colors">Examples</Link>
        </nav>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-secondary text-muted-foreground mt-20">
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="mb-4">
        <h3 className="font-bold text-foreground">Disclaimer</h3>
        <p className="text-sm max-w-2xl mx-auto">Pollitago provides AI-powered insights and suggestions. You are solely responsible for your ultimate decisions and actions based on this information.</p>
      </div>
      <div className="flex justify-center gap-6 mb-4 text-sm">
        <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
      </div>
      <p className="text-xs">&copy; {new Date().getFullYear()} Pollitago.com. All rights reserved.</p>
    </div>
  </footer>
);


export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // State for the decision tool
  const [query, setQuery] = useState('');
  const [tone, setTone] = useState<'Firm' | 'Friendly' | 'Professional'>('Firm');
  const [variants, setVariants] = useState<number>(1);
  const [price, setPrice] = useState<number>(7);
  const [delivery, setDelivery] = useState<'instant' | 'scheduled'>('instant');
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const priceIds = {
    // IMPORTANT: Replace with your actual Stripe Price IDs
    7: 'prod_Sk5zwzpv7vs4GY', // Clarity
    19: 'prod_Sk6TAt7nFKR5eP', // Insight
    39: 'prod_Sk6UPmEKV63t3V' // Wisdom
  };
  
  useEffect(() => {
      switch(variants) {
          case 1: setPrice(7); break;
          case 2: setPrice(19); break;
          case 3: setPrice(39); break;
          default: setPrice(7);
      }
  }, [variants]);
  
  const charLimits: {[key: number]: string} = {
      1: "200-300",
      2: "400-600",
      3: "700-1000+"
  }

  const handlePurchase = async () => {
    if (!query.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please describe your situation before purchasing.',
      });
      return;
    }

    setIsPurchasing(true);
    try {
      const createStripeCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');
      const { data }: any = await createStripeCheckoutSession({
        priceId: priceIds[price as keyof typeof priceIds],
        query,
        tone,
        variants,
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Could not retrieve checkout session URL.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Could not connect to the payment processor. Please try again later.',
      });
      setIsPurchasing(false);
    }
  };


  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const newItems = await fetchItems(items.length, 4); // Load 4 items at a time
    if (newItems.length === 0) {
      setHasMore(false);
    } else {
      setItems(prevItems => [...prevItems, ...newItems]);
    }
    setIsLoading(false);
  }, [isLoading, hasMore, items.length]);
  
  const entry = useIntersectionObserver(sentinelRef, { threshold: 1.0 });
  const isSentinelVisible = !!entry?.isIntersecting;
  
  useEffect(() => {
    if (isSentinelVisible && hasMore && !isLoading) {
      loadMoreItems();
    }
  }, [isSentinelVisible, hasMore, isLoading, loadMoreItems]);

  useEffect(() => {
    loadMoreItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">
            <Image
                src="/hero-background.jpg"
                alt="AI neural network"
                layout="fill"
                objectFit="cover"
                className="opacity-20"
                data-ai-hint="abstract neural network"
            />
            <div className="relative z-10 px-4">
                <h1 className="text-5xl md:text-7xl font-bold font-heading mb-4 metallic-gradient">
                    Pollitago
                </h1>
                <p className="text-lg md:text-2xl font-bold font-heading mb-6">Your Official AI Second Opinion & Decision App.</p>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                    Get clarity and confidence on any decision, big or small, with objective AI insights. No sign-up. Just answers.
                </p>
                <Link href="#decision-tool">
                    <Button size="lg" className="glow-border bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-2xl shadow-lg shadow-primary/30">
                        Get Your Second Opinion
                    </Button>
                </Link>
            </div>
        </section>

        {/* The Decision Tool Section */}
        <section id="decision-tool" className="py-20 md:py-32">
          <AnimatedCard>
              <div className="p-8 md:p-12">
                  <div className="max-w-3xl mx-auto">
                      <h2 className="text-4xl md:text-5xl font-bold font-heading text-center mb-4">Your Path to Clarity.</h2>
                      <p className="text-lg text-muted-foreground text-center mb-12">Input your dilemma, choose your perspective, and receive instant AI-powered guidance.</p>
                      
                      <div className="space-y-8">
                          <div>
                              <label className="text-lg font-semibold mb-2 block">Describe your situation...</label>
                              <Textarea 
                                  placeholder="e.g., 'Should I take this job offer?', 'How do I tell my friend bad news?', 'What's the best strategy for my small business?'"
                                  rows={5}
                                  className="bg-background/50 text-base"
                                  value={query}
                                  onChange={(e) => setQuery(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground mt-2 text-right">Approx. characters for selected plan: {charLimits[variants]}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                  <h3 className="text-lg font-semibold mb-4">Choose Your AI's Tone:</h3>
                                  <div className="flex flex-col space-y-2">
                                      <Button onClick={() => setTone('Firm')} variant={tone === 'Firm' ? "secondary" : "outline"} className="justify-start py-6 text-base">Firm</Button>
                                      <Button onClick={() => setTone('Friendly')} variant={tone === 'Friendly' ? "secondary" : "outline"} className="justify-start py-6 text-base">Friendly</Button>
                                      <Button onClick={() => setTone('Professional')} variant={tone === 'Professional' ? "secondary" : "outline"} className="justify-start py-6 text-base">Professional</Button>
                                  </div>
                              </div>

                              <div>
                                  <h3 className="text-lg font-semibold mb-4">How many opinions?</h3>
                                  <div className="flex flex-col space-y-2">
                                      <Button onClick={() => setVariants(1)} variant={variants === 1 ? "secondary" : "outline"} className="justify-start py-6 text-base">1 Firm Decision</Button>
                                      <Button onClick={() => setVariants(2)} variant={variants === 2 ? "secondary" : "outline"} className="justify-start py-6 text-base">2 Firm Decisions</Button>
                                      <Button onClick={() => setVariants(3)} variant={variants === 3 ? "secondary" : "outline"} className="justify-start py-6 text-base">3 Firm Decisions</Button>
                                  </div>
                              </div>
                          </div>

                          <div>
                              <h3 className="text-lg font-semibold mb-4">When do you want your decision?</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Button onClick={() => setDelivery('instant')} variant={delivery === 'instant' ? "secondary" : "outline"} className="py-6 text-base">Instant</Button>
                                  <Button onClick={() => setDelivery('scheduled')} variant={delivery === 'scheduled' ? "secondary" : "outline"} className="py-6 text-base">Schedule Delivery</Button>
                              </div>
                              {delivery === 'scheduled' && (variants > 1) && (
                                  <div className="mt-4 p-4 rounded-lg bg-background/30 border border-border">
                                      <p className="text-sm font-semibold mb-2">Set Delivery Time (Min: 5m, Max: 31d)</p>
                                      <div className="flex gap-2 items-center">
                                          <Input type="number" min="0" max="31" placeholder="Days" className="bg-background/50" />
                                          <Input type="number" min="0" max="23" placeholder="Hours" className="bg-background/50" />
                                          <Input type="number" min="0" max="59" placeholder="Mins" className="bg-background/50" />
                                      </div>
                                  </div>
                              )}
                          </div>

                          <div className="pt-8 border-t border-border/20 flex flex-col items-center">
                              <div className="text-center mb-6">
                                  <p className="text-muted-foreground">Total Price</p>
                                  <p className="text-5xl font-bold font-heading metallic-gradient">${price.toFixed(2)}</p>
                              </div>
                              <Button 
                                  size="lg" 
                                  className="w-full max-w-xs glow-border bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-8 py-7 rounded-2xl shadow-lg shadow-primary/30"
                                  onClick={handlePurchase}
                                  disabled={isPurchasing}
                              >
                                  {isPurchasing ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Get My Opinion'}
                              </Button>
                              <p className="text-xs text-muted-foreground mt-4">You will be redirected to our secure payment processor.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </AnimatedCard>
        </section>

        
        {/* Why Pollitago Section */}
        <section id="indecision-costs" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
              <AnimatedCard className="overflow-hidden">
                  <div className="relative p-8 md:p-12 min-h-[50vh] flex items-center">
                      <Image
                          src="/indecision-background.jpg"
                          alt="Abstract image representing confusion"
                          layout="fill"
                          objectFit="cover"
                          className="opacity-20"
                          data-ai-hint="abstract maze"
                      />
                      <div className="relative z-10 max-w-3xl">
                          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">The Hidden Costs of Indecision.</h2>
                          <div className="text-lg text-foreground/80 space-y-4">
                          <p>Indecision isn't just frustrating; it carries significant financial losses and profound psychological downsides each year. From missed opportunities and stagnant growth in business to the anxiety, stress, and missed personal milestones in daily life, the weight of unresolved choices can be immense.</p>
                          <p>Pollitago cuts through the noise, offering clear, actionable insights to help you move forward with confidence.</p>
                          </div>
                      </div>
                  </div>
              </AnimatedCard>
          </div>
        </section>
        
        {/* Real-World Use Cases Section */}
        <section id="use-cases" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                <AnimatedCard className="overflow-hidden">
                <div className="relative p-8 md:p-12 min-h-[50vh] flex items-center">
                    <Image
                        src="/use-cases-background.jpg"
                        alt="Diverse people using Pollitago"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-20"
                        data-ai-hint="diverse people technology"
                    />
                    <div className="relative z-10 max-w-3xl">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">Decisions for Literally Anyone.</h2>
                        <div className="text-lg text-foreground/80 space-y-4">
                        <p>Pollitago is designed for literally anyone with a smartphone and a decision they need help with. Whether it's a minor daily choice like 'What to have for lunch?' or a major life dilemma, our AI provides objective clarity.</p>
                        <p>From personal choices to professional strategies, Pollitago brings an unbiased perspective to empower your next step.</p>
                        </div>
                    </div>
                </div>
                </AnimatedCard>
            </div>
        </section>


        {/* Infinite Scroll Examples */}
        <section id="ai-examples" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <header className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
                See Pollitago in Action
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Explore how Pollitago provides firm, objective second opinions for a diverse range of scenarios. These examples highlight the power and versatility of our AI's decision-making capabilities.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {items.map(item => (
                <ExampleCard key={item.id} item={item} />
              ))}
            </div>
            
            <div ref={sentinelRef} className="h-10 w-full mt-16 flex justify-center items-center">
              {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <p>Loading more examples...</p>
                  </div>
              )}
              {!hasMore && (
                <p className="text-muted-foreground">You've seen all examples.</p>
              )}
            </div>
          </div>
        </section>
        
      </main>
      <Footer />
    </div>
  );
}
