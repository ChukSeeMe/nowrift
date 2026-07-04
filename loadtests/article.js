import http from 'k6/http';
import { check, sleep } from 'k6';

const ARTICLE_SLUGS = [
  'trump-admin-defends-xais-unpermitted-gas-turbines-citing-national-security',
  'openai-and-broadcom-unveil-jalapeo-chip-for-ai-inference',
  'google-home-speaker-with-gemini-preorders-open-for-100',
  'discodeai-unifies-100-ai-models-under-one-eco-friendly-interface',
  'openai-delays-gpt-56-amidst-us-government-review'
];

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s',  target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed:   ['rate<0.01'],
  },
};

export default function () {
  const slug = ARTICLE_SLUGS[Math.floor(Math.random() * ARTICLE_SLUGS.length)];
  const res = http.get(`http://localhost:3000/${slug}`);

  check(res, {
    'status is 200':        (r) => r.status === 200,
    'response under 800ms': (r) => r.timings.duration < 800,
    'has article content':  (r) => r.body.includes('<article') || r.body.includes('article-body'),
  });

  sleep(1);
}
