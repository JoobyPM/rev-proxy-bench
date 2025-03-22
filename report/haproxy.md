## K6 summary - HAProxy
```plaintext
     checks.........................: 100.00% 15728708 out of 15728708
     data_received..................: 1.3 GB  4.5 MB/s
     data_sent......................: 285 MB  949 kB/s
     http_req_blocked...............: avg=239ns   min=0s       med=0s     max=33.81ms  p(90)=1µs    p(95)=1µs   
     http_req_connecting............: avg=6ns     min=0s       med=0s     max=1.24ms   p(90)=0s     p(95)=0s    
   ✓ http_req_duration..............: avg=2.77ms  min=283µs    med=2.28ms max=109.87ms p(90)=5.06ms p(95)=6.32ms
       { expected_response:true }...: avg=2.77ms  min=283µs    med=2.28ms max=109.87ms p(90)=5.06ms p(95)=6.32ms
     http_req_failed................: 0.00%   0 out of 7864354
     http_req_receiving.............: avg=32.81µs min=2µs      med=8µs    max=28.32ms  p(90)=88µs   p(95)=147µs 
     http_req_sending...............: avg=8.48µs  min=3µs      med=7µs    max=9.92ms   p(90)=14µs   p(95)=17µs  
     http_req_tls_handshaking.......: avg=123ns   min=0s       med=0s     max=33.53ms  p(90)=0s     p(95)=0s    
     http_req_waiting...............: avg=2.73ms  min=0s       med=2.24ms max=109.79ms p(90)=4.99ms p(95)=6.25ms
     http_reqs......................: 7864354 26213.796299/s
     iteration_duration.............: avg=2.8ms   min=299.66µs med=2.31ms max=109.92ms p(90)=5.09ms p(95)=6.36ms
     iterations.....................: 7864354 26213.796299/s
     vus............................: 199     min=0                    max=199
     vus_max........................: 200     min=200                  max=200


running (5m00.0s), 000/200 VUs, 7864354 complete and 0 interrupted iterations
gradual_load_test ✓ [======================================] 000/200 VUs  5m0s
```

![k6-traefik.png](./assets/k6-haproxy.png)

### Links
- [README.md](../README.md)
- [Nginx Results](./report/nginx.md)
- [Traefik Results](./report/traefik.md)
- 