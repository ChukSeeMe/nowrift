import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Ramp up to 10 users
    { duration: '20s',  target: 50 },   // Hold at 50 users
    { duration: '10s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed:   ['rate<0.01'],  // Less than 1% errors
    errors:            ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('http://localhost:3000');

  const result = check(res, {
    'status is 200':          (r) => r.status === 200,
    'response under 500ms':   (r) => r.timings.duration < 500,
    'contains NowRift':       (r) => r.body.includes('NowRift'),
    'no error in body':       (r) => !r.body.includes('Internal Server Error'),
  });

  errorRate.add(!result);
  sleep(1);
}
