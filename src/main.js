import { Actor } from 'apify';
import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

await Actor.main(async () => {
    const input = await Actor.getInput();
    if (!input?.pageContent) throw new Error('Page content is required');
    if (!input?.openrouterApiKey) throw new Error('OpenRouter API key is required');

    const { pageContent, keywords = [], url = '', industry = '', model = 'google/gemini-2.0-flash-exp:free', openrouterApiKey } = input;

    const prompt = `Generate SEO meta tags for a webpage:

Content: ${pageContent}
${keywords.length > 0 ? `Keywords: ${keywords.join(', ')}` : ''}
${url ? `URL: ${url}` : ''}
${industry ? `Industry: ${industry}` : ''}

Provide:
1. Meta title (50-60 characters)
2. Meta description (150-160 characters)
3. Open Graph tags
4. Twitter Card tags
5. Recommended keywords

Return JSON:
{
  "title": "string (60 chars)",
  "metaDescription": "string (160 chars)",
  "openGraphTags": {"og:title": "", "og:description": "", "og:image": ""},
  "twitterCardTags": {"twitter:title": "", "twitter:description": ""},
  "keywords": ["keyword1", "keyword2"]
}`;

    const response = await axios.post(OPENROUTER_API_URL, {
        model,
        messages: [{ role: 'system', content: 'You are an SEO expert.' }, { role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
    }, {
        headers: { 'Authorization': `Bearer ${openrouterApiKey}`, 'HTTP-Referer': 'https://apify.com' }
    });

    const result = JSON.parse(response.data.choices[0].message.content);
    await Actor.pushData({ ...result, cost: 0.002, chargePrice: 0.50, createdAt: new Date().toISOString() });
    console.log('✓ SEO meta tags generated!');
});
