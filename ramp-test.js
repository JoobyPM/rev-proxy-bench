import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  // Ramp up load (via number of VUs) in stages
  scenarios: {
    gradual_load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        // Stage 1: ramp up to 50 VUs over 1 minutes
        { target: 20, duration: '1m' },
        // Stage 1: ramp up to 50 VUs over 1 minutes
        { target: 50, duration: '1m' },
        // Stage 2: ramp up to 100 VUs over 1 minutes
        { target: 100, duration: '1m' },
        // Stage 3: keep 100 VUs for 1 minutes
        { target: 100, duration: '1m' },
        // Stage 4: keep 200 VUs for 1 minutes
        { target: 200, duration: '1m' },
        
        
      ],
      gracefulRampDown: '30s',
    }
  },
  thresholds: {
    http_req_duration: ['max<=10000'], // If max > 1000ms, fail the test
  },
};

export default function () {
  const url = 'https://rev-proxy.test.lab/';
  const res = http.get(url);

  // Optionally check for success & measure response times
  check(res, {
    'status is 200': (r) => r.status === 200,
    'latency <= 1000ms': (r) => r.timings.duration <= 1000,
  });
}
