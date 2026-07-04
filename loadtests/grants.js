import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s',  target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed:   ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('http://localhost:3000/grants');

  check(res, {
    'status is 200':         (r) => r.status === 200,
    'response under 1000ms': (r) => r.timings.duration < 1000,
    'has grants content':    (r) => r.body.includes('grant') || r.body.includes('Grant'),
  });

  sleep(1);
}
