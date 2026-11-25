# HeaderLens

A sleek, lightweight, cross-platform desktop application for analyzing, auditing, and comparing HTTP response security headers. Built with **Tauri v2** and **Rust** on the backend, paired with a zero-dependency **HTML5 / CSS3 / JavaScript** frontend.

---

## Features

- **Single URL Scan** — Deep inspection of HTTP security headers, transport security, CORS, and cookies with optional redirect following and custom request headers (e.g., `Authorization`, `Cookie`).
- **Visual Security Scoring** — Instant `0–100` score gauge, letter grade (`A`–`F`), severity badges (`Critical`, `Warning`, `Info`), and quick summary pills.
- **Batch URL Scan** — Scan lists of URLs with a live progress bar, collapsible per-site reports, and batch report export.
- **File & Raw Header Import** — Drag and drop `.txt` / `.headers` / `.http` files, browse from disk, or paste raw HTTP responses directly for offline analysis.
- **Side-by-Side Comparison** — Compare header postures across environments or over time with an aligned `VS` scoreboard:
  - **URL vs. URL** (with independent custom headers per target)
  - **URL vs. File / Raw**
  - **URL vs. Scan History**
- **Grouped Scan History** — Automatic local history grouped by target URL with searchable filtering and inline multi-version timeline browsing.
- **Export & Copy** — Export full single or batch reports to **JSON** or **Markdown**, or copy all raw response headers in one click.
- **Dark & Light Themes** — System-aware color scheme with instant manual theme override.

---

## Security Inspections

HeaderLens evaluates responses across five core areas:

1. **Transport Security** — HTTPS enforcement, certificate validation, HTTP-to-HTTPS redirect verification, and `Strict-Transport-Security` (`max-age`, `includeSubDomains`).
2. **Security Headers (11 Checks)** — `Strict-Transport-Security`, `Content-Security-Policy` (including `frame-ancestors`), `X-Frame-Options` (`DENY` / `SAMEORIGIN`), `X-Content-Type-Options` (`nosniff`), `Referrer-Policy`, `Permissions-Policy`, `Cache-Control` (`no-store`), `Cross-Origin-Opener-Policy`, `Cross-Origin-Embedder-Policy`, `Cross-Origin-Resource-Policy`, and `X-XSS-Protection`.
3. **CORS Configuration** — Detects wildcard `*` origins, exploitable `null` origins, missing `Vary: Origin`, and critical `Access-Control-Allow-Origin: *` + `Access-Control-Allow-Credentials: true` misconfigurations.
4. **Cookie Hardening** — Audits `Set-Cookie` headers for missing `Secure`, `HttpOnly`, and `SameSite=Lax/Strict` attributes.
5. **Information Leaks** — Flags verbose banner and infrastructure headers (`Server`, `X-Powered-By`, `X-AspNet-Version`, `X-Generator`, `X-Runtime`, `Via`, `X-Cache`, `CF-Ray`, `Server-Timing`).

---

## Tech Stack

- **Backend:** [Rust](https://www.rust-lang.org/), [Tauri v2](https://v2.tauri.app/), `reqwest` (`rustls-tls`), `tokio`, `serde` / `serde_json`
- **Frontend:** Vanilla HTML5, CSS3, and ES6+ JavaScript (100% offline, zero external runtime dependencies)
- **CI/CD:** GitHub Actions cross-platform release workflow producing `.dmg` (macOS arm64 & x64), `.deb` / `.AppImage` (Linux), and `.msi` / `.exe` (Windows)

---

## Getting Started

### Prerequisites

- **Rust** (stable toolchain via [rustup](https://rustup.rs/))
- **Platform dependencies for Tauri v2:** see the [Tauri Prerequisites Guide](https://v2.tauri.app/start/prerequisites/)

### Development & Build

1. Clone the repository:
   ```bash
   git clone https://github.com/NonBytes/HeaderLens.git
   cd HeaderLens
   ```

2. Install the Tauri CLI (if not already installed):
   ```bash
   cargo install tauri-cli --version "^2"
   ```

3. Run in development mode:
   ```bash
   cargo tauri dev
   ```

4. Build a production installer/bundle:
   ```bash
   cargo tauri build
   ```
   Output bundles are written to `src-tauri/target/release/bundle/`.
