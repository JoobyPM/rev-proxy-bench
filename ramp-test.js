import http from 'k6/http';
import { check } from 'k6';

export let options = {
  scenarios: {
    ramp_rps_test: {
      executor: 'ramping-arrival-rate',
      startRate: 500,  
      timeUnit: '1s',
      preAllocatedVUs: 200,
      maxVUs: 2000,
      stages: [
        { target: 1000, duration: '1m' }, 
        { target: 1700, duration: '2m' },
      ],
    },
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
