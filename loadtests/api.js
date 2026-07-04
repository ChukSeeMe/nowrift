import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '20s',  target: 100 },  // Higher concurrency for API
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],   // APIs should be faster than pages
    http_req_failed:   ['rate<0.01'],
  },
};

export default function () {
  // Test the articles API endpoint with bypass rate limiting header
  const params = {
    headers: {
      'x-bypass-ratelimit': 'true',
    },
  };
  const res = http.get('http://localhost:3000/api/v1/articles?limit=20', params);

  check(res, {
    'status is 200':        (r) => r.status === 200,
    'response under 300ms': (r) => r.timings.duration < 300,
    'returns JSON':         (r) => r.headers['Content-Type'] &&
                                   r.headers['Content-Type'].includes('json'),
  });

  sleep(0.5);
}
