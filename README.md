
A minimal Docker Compose setup to compare **HAProxy**, **Nginx**, and **Traefik** as reverse proxies over HTTPS, each fronting the same simple test service (`http-echo`).

## 1. Certificate & Key Setup

1. Generate a self-signed cert and key:
   ```bash
   openssl req -x509 -nodes -days 365 \
       -subj "/CN=rev-proxy.test.lab" \
       -newkey rsa:2048 \
       -keyout rev-proxy.test.lab.key \
       -out rev-proxy.test.lab.crt
   ```
2. Put `rev-proxy.test.lab.crt` and `rev-proxy.test.lab.key` in `./certs/`.
3. For **HAProxy**, also concatenate into a `.pem`:
   ```bash
   cat rev-proxy.test.lab.crt rev-proxy.test.lab.key > rev-proxy.test.lab.pem
   ```
   Place it in `./certs/` too.

4. Add to your `/etc/hosts` (or equivalent):
   ```
   127.0.0.1 rev-proxy.test.lab
   ```
   *(Adjust IP if Docker is remote.)*

5. (Optional) Trust the certificate locally to get a “green lock” in your browser.

### 1.1 HAProxy Requires a Single `.pem` File

HAProxy needs the certificate and key **concatenated**:

```bash
cat rev-proxy.test.lab.crt rev-proxy.test.lab.key > rev-proxy.test.lab.pem
```

So you will end up with:

- `rev-proxy.test.lab.crt`
- `rev-proxy.test.lab.key`
- `rev-proxy.test.lab.pem` (for HAProxy)

Put them all in a local `certs/` folder (or whichever folder you prefer). Example structure:

```
.
├── docker-compose.yml
├── haproxy.cfg
├── nginx.conf
├── traefik_dynamic.yaml
└── certs
    ├── rev-proxy.test.lab.crt
    ├── rev-proxy.test.lab.key
    └── rev-proxy.test.lab.pem
```

### 1.2 “Green Lock” on macOS

- To avoid “Not Secure”/warning messages in your browser, you must **trust** the self-signed certificate or use a local CA approach.  
- Easiest is to double-click the `.crt` file, open Keychain Access, and set “Always Trust” under **Trust**. Your browser should then show the normal lock icon (though you may need to restart your browser).

Below is an **SSL-enabled** Docker Compose setup that:

1. Uses the same **basic test-service** as before (HashiCorp’s `http-echo`).
2. Adds SSL/TLS (with a self-signed certificate) for each reverse proxy:
   - **HAProxy**
   - **Nginx**
   - **Traefik**

We’ll bind them on port **443** instead of **80**.  
You can place **`rev-proxy.test.lab`** in your `/etc/hosts` to point to your Docker host, e.g.:
```
127.0.0.1  rev-proxy.test.lab
```
*(Adjust the IP to match your Docker host if it’s remote.)*

Then you can test via `curl -k https://rev-proxy.test.lab/` or a browser (`Safari` on macOS), ignoring the self-signed warnings.

## 2. Commands

### 2.1 Start HAProxy
```bash
docker compose --profile haproxy up -d
docker compose logs haproxy
curl -k https://rev-proxy.test.lab/
docker compose --profile haproxy down
```

### 2.2 Start Nginx
```bash
docker compose --profile nginx up -d
docker compose logs nginx
curl -k https://rev-proxy.test.lab/
docker compose --profile nginx down
```

### 2.3 Start Traefik
```bash
docker compose --profile traefik up -d
docker compose logs traefik
curl -k https://rev-proxy.test.lab/
docker compose --profile traefik down
```

### 2.4 Run k6 Test (any proxy running)
```bash
K6_WEB_DASHBOARD=true \
k6 run --insecure-skip-tls-verify ramp-test.js
```

## 3. Test Results

| Reverse Proxy | Max (ms) | p95 (ms) | Max RPS (before p95>5ms)  | Max RPS  |
|---------------|----------|----------|---------------------------|----------|
| **Traefik**   | 88.47    | 24.44    | 15,770                    | 17,180   |
| **HAProxy**   | 109      | 6        | 34,030                    | 36,080   |
| **Nginx**     | 86.52    | 5.63     | 35,160                    | 39,570   |

> Each proxy is using port **443** with your self-signed certificate. Adjust your `/etc/hosts` or DNS as needed, then benchmark or load-test however you like.

### 3.1 Detailed Results
For detailed test results and analysis of each reverse proxy, see:

- [HAProxy Results](./report/haproxy.md)
- [Nginx Results](./report/nginx.md) 
- [Traefik Results](./report/traefik.md)
