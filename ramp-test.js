import http from 'k6/http';
import { check } from 'k6';

export let options = {
  scenarios: {
    gradual_load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { target: 50, duration: '1m' },
        { target: 100, duration: '1m' },
        { target: 200, duration: '1m' },
      ],
      gracefulRampDown: '30s',
    }
  },
  thresholds: {
    http_req_duration: ['max<=10000'],
  },
};

export default function () {

  const url = 'https://rev-proxy.test.lab/sample1.jpg';

  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200
  });
}
