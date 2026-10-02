import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY || '';

export const anthropic = new Anthropic({
  apiKey: apiKey || 'dummy-key-for-initialization',
});

export const isAnthropicConfigured = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 10);
