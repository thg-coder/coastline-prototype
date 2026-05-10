# Coastline — Booking Widget Prototype

A clickable, frontend-only prototype of the **Coastline** consultation-booking widget for med
spas. Built as a single self-contained React + Tailwind app served as a static site, ready to
deploy to Google Cloud Run and embed as an iframe.

> Coastline is the consultation-only tier. Patients book and pay for a consultation; the actual
> procedure is scheduled in person at the visit.

---

## Local development

```bash
npm install
npm run dev
```

Opens at <http://localhost:5173>.

## Local container test (recommended before deploy)

```bash
npm run docker:build
npm run docker:run
```

Opens at <http://localhost:8080>. Verify the prototype works inside the container before
deploying.

## Deploy to Cloud Run (manual)

1. Set GCP project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```
2. Enable required APIs:
   ```bash
   gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
   ```
3. Build and push the image:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/coastline-prototype
   ```
4. Deploy:
   ```bash
   gcloud run deploy coastline-prototype \
     --image gcr.io/YOUR_PROJECT_ID/coastline-prototype \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080
   ```

## Deploy to Cloud Run (one command via Cloud Build)

```bash
gcloud builds submit --config cloudbuild.yaml
```

Override defaults if needed:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=coastline,_REGION=us-east1
```

## Recommended Cloud Run settings

| Setting               | Value      |
| --------------------- | ---------- |
| Memory                | 256Mi      |
| CPU                   | 1          |
| Min instances         | 0          |
| Max instances         | 10         |
| Concurrency           | 80         |
| Timeout               | 60s        |
| Port                  | 8080       |
| Authentication        | Allow unauthenticated |

## Embedding as an iframe

The Nginx config sets `Content-Security-Policy: frame-ancestors *;` so the widget can be
embedded from any origin in the prototype phase. In production this should be tightened to
the specific marketing or client domains.

```html
<iframe
  src="https://YOUR-CLOUDRUN-URL.run.app/"
  style="width: 100%; max-width: 720px; height: 900px; border: 0;"
  loading="lazy"
  title="Book a consultation"
></iframe>
```

## Project structure

```
.
├── Dockerfile                # Multi-stage build: node:20-alpine → nginx:alpine
├── nginx.main.conf           # Top-level Nginx config (runs as unprivileged user)
├── nginx.conf                # Server block (templated; ${PORT} substituted at start)
├── docker-entrypoint.sh      # envsubst → start Nginx
├── cloudbuild.yaml           # Cloud Build pipeline (build + push + deploy)
├── .dockerignore
├── .gcloudignore
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── src
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── mockData.js           # Services, practitioners, deterministic availability
    ├── state
    │   └── BookingContext.jsx
    ├── utils
    │   ├── format.js
    │   ├── ics.js            # Generates downloadable .ics file
    │   ├── storage.js        # sessionStorage with graceful fallback
    │   └── validation.js
    ├── components
    │   ├── Banner.jsx
    │   ├── ConfirmDialog.jsx
    │   ├── Footer.jsx
    │   ├── ParentPageChrome.jsx
    │   ├── ProgressBar.jsx
    │   ├── StepShell.jsx
    │   └── Widget.jsx
    └── screens
        ├── ServiceSelection.jsx
        ├── FormatSelection.jsx
        ├── PractitionerSelection.jsx
        ├── CalendarSelection.jsx
        ├── IntakeForm.jsx
        ├── CancellationPolicy.jsx
        ├── Checkout.jsx
        └── Confirmation.jsx
```

## Notes

- No backend, no API calls, no env vars at runtime, no analytics.
- All state mirrors to `sessionStorage` and falls back to in-memory when storage is blocked
  (Safari ITP, Firefox ETP in cross-origin iframes, private mode, etc.).
- Mock availability is deterministic per session — generated once on widget mount and stable
  across navigation.
- The mock checkout is purely visual. Use `4242 4242 4242 4242` with any future date and any
  CVC.
- The .ics download is a real, valid iCalendar file — try opening it in your default calendar.
