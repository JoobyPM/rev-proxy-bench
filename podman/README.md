# Podman + Traefik (as reverse proxy) + Nginx (static file server)

Below is an **updated** end-to-end guide showing how to serve both **HTML** and **JPG** files (any static files in your `html` folder) from **Nginx**, routed through **Traefik** via **HTTPS** (TLS) using self-signed certificates stored in `../certs`. We’ll assume:

- You already have working **Podman** on macOS.  
- You have `rev-proxy.test.lab` mapped to `127.0.0.1` in `/etc/hosts`.  
- You have a **self-signed certificate** (`rev-proxy.test.lab.crt`) and **key** (`rev-proxy.test.lab.key`) in `../certs`.  

Feel free to adjust filenames and paths to match your environment.

## 1. Prerequisites

1. **Podman** installed on your Mac.  
2. A line in `/etc/hosts`:
   ```
   127.0.0.1   rev-proxy.test.lab
   ```
3. A self-signed certificate (`rev-proxy.test.lab.crt`) and key (`rev-proxy.test.lab.key`) in a `certs/` folder:
   ```
   ../certs/rev-proxy.test.lab.crt
   ../certs/rev-proxy.test.lab.key
   ```
   If your directory structure is slightly different, just adjust the paths accordingly.

4. A folder `html/` containing your static files:  
   - `index.html`  
   - `sample1.jpg` (or any additional static resources)


## 2. Directory Structure

In the example below, the `project/` folder contains your Traefik config and the static files.  
```
podman/
├── traefik.toml
├── dynamic/
│   └── config.yml
└── html/
    ├── index.html
    └── sample1.jpg

```

> Note: If your certificates actually live *outside* the `project/` folder (e.g. `../certs`), just adjust the mount paths in the container run command accordingly.

## 4. Create a Podman Network

So Traefik can reach Nginx by hostname `nginx`:

```bash
podman network create traefik-net
```

## 5. Run the Containers

### 5.1 Nginx (Static File Server)

```bash
podman run -d \
  --name nginx \
  --network traefik-net \
  --cpus=2 \
  -v $PWD/html:/usr/share/nginx/html:ro,Z \
  -v $PWD/nginx.conf:/etc/nginx/nginx.conf:ro,Z \
  nginx:alpine
```

- **`--network traefik-net`** ensures the container is reachable by other containers on that network.  
- **`-v $PWD/html:/usr/share/nginx/html:ro,Z`** mounts your local `html/` folder (including `index.html` and `sample1.jpg`) into the container’s web root.  

### 5.2 Traefik (Reverse Proxy)

```bash
podman run -d \
  --name traefik \
  --network traefik-net \
  -p 80:80 \
  -p 443:443 \
  --cpus=2 \
  --env GOMAXPROCS=2 \
  -v $PWD/traefik.toml:/etc/traefik/traefik.toml:Z \
  -v $PWD/dynamic:/etc/traefik/dynamic:Z \
  -v $PWD/certs:/certs:ro,Z \
  traefik:v2.9
```

#### Explanation:

1. **`--network traefik-net`** – so Traefik can see `nginx`.
2. **`-p 80:80`** – optionally serve HTTP (you can redirect from HTTP → HTTPS, or remove if you only want HTTPS).
3. **`-p 443:443`** – serve HTTPS on port `443`.
4. **Mounts**:
   - `traefik.toml` → `/etc/traefik/traefik.toml`
   - `dynamic/`    → `/etc/traefik/dynamic`
   - `certs/`      → `/certs` (read-only mount) – matches the `certFile`/`keyFile` paths in `config.yml`
   
---

## 6. Testing HTTPS

1. Make sure `/etc/hosts` has:
   ```
   127.0.0.1   rev-proxy.test.lab
   ```
2. Open your browser and visit:
   ```
   https://rev-proxy.test.lab
   ```
3. **Browser Security Warning**: Because the certificate is self-signed (and not issued by a recognized CA), most browsers will show a warning. Confirm or add an exception to proceed.
4. You should see:
   - Your `index.html` rendered,
   - and `sample1.jpg` displayed.

To watch logs:
```bash
podman logs -f traefik
podman logs -f nginx
```

---

## 7. Optional: Redirect HTTP to HTTPS

If you also want all HTTP (`:80`) traffic to **redirect** to HTTPS (`:443`), add a **second router** in your dynamic config that catches port 80 requests and redirects them. For example, add this under `http.routers` in `dynamic/config.yml`:

```yaml
http:
  routers:
    # Existing HTTPS router
    nginx-router:
      rule: "Host(`rev-proxy.test.lab`)"
      entryPoints:
        - websecure
      service: nginx-service
      tls: {}

    # New HTTP router that redirects to HTTPS
    redirect-to-https:
      rule: "Host(`rev-proxy.test.lab`)"
      entryPoints:
        - web
      service: noop
      # Use Traefik's redirect feature
      middlewares:
        - https-redirect

  services:
    # The actual Nginx service
    nginx-service:
      loadBalancer:
        servers:
          - url: "http://nginx:80"

    # A "dummy" service for the redirect
    noop:
      loadBalancer:
        servers:
          - url: "http://127.0.0.1"  # Unused, just for syntax

  middlewares:
    https-redirect:
      redirectScheme:
        scheme: https
        permanent: true
```

With that, any request on `http://rev-proxy.test.lab` automatically redirects to `https://rev-proxy.test.lab`.


## 8. Optional: Access the Traefik Dashboard

If your `traefik.toml` includes:

```toml
[api]
  insecure = true
```

…the dashboard is on container port 8080. If you want to see it locally, map it during `podman run`:

```bash
-p 8080:8080
```

Then go to:

```plaintext
http://127.0.0.1:8080/dashboard
```

> **Security note**: This is unauthenticated. Only do this in a trusted/local dev environment or find a more secure method (e.g., a password middleware or restricting access to localhost).

---

# Final Summary

1. **Podman network**: `podman network create traefik-net`  
2. **Nginx**:
```bash
podman run -d \
  --name nginx \
  --network traefik-net \
  --cpus=2 \
  -v $PWD/html:/usr/share/nginx/html:ro,Z \
  -v $PWD/nginx.conf:/etc/nginx/nginx.conf:ro,Z \
  nginx:alpine
```

3. **Traefik**:
```bash
podman run -d \
  --name traefik \
  --network traefik-net \
  -p 80:80 \
  -p 443:443 \
  --cpus=2 \
  --env GOMAXPROCS=2 \
  -v $PWD/traefik.toml:/etc/traefik/traefik.toml:Z \
  -v $PWD/dynamic:/etc/traefik/dynamic:Z \
  -v $PWD/certs:/certs:ro,Z \
  traefik:v2.9
```
4. **Browse**:
   - `https://rev-proxy.test.lab` → see your static site, including `sample1.jpg`, served via TLS.  
   - Accept the self-signed certificate warning.

You now have a secure (though self-signed) **TLS** reverse proxy in front of an **Nginx** static file server, all running in **Podman** on macOS. Enjoy!


## **Important:** Additional sysctl Tuning **Inside** the Podman VM (Linux)

If ephemeral ports or concurrency is an issue inside the **Linux** VM, you can set ephemeral port ranges and queue sizes:

```bash
# Connect to the Podman VM
podman machine ssh

# Inside Podman VM
sudo sysctl -w net.ipv4.ip_local_port_range="32768 65535"
sudo sysctl -w net.core.somaxconn=1024
sudo sysctl -w net.core.netdev_max_backlog=4096
```

But again, a **complete freeze** is more indicative of CPU/memory meltdown than ephemeral port exhaustion.

### Add more resources to the Podman VM

```bash
podman machine stop
podman machine set --cpus 5 --memory 16384  # 5 CPUs, 16GB RAM, for example
podman machine start
```

