import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-analysis';
import '@/ai/flows/fetch-news-flow';
import '@/ai/flows/fetch-stock-quotes-flow';
import '@/ai/flows/fetch-travel-news-flow';
