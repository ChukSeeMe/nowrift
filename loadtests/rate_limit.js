import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const rateLimitHits = new Counter('rate_limit_hits');

export const options = {
  vus: 1,
  iterations: 150,
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/articles');

  const isRateLimited = res.status === 429;
  if (isRateLimited) {
    rateLimitHits.add(1);
  }

  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'rate limit returns 429 with Retry-After': (r) => {
      if (isRateLimited) {
        return r.status === 429 && r.headers['Retry-After'] !== undefined;
      }
      return true;
    }
  });
}
