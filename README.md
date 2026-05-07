# Seatsurfing Extended

An extended fork of [Seatsurfing](https://github.com/seatsurfing/seatsurfing) — desk sharing, room reservation, and workspace booking with additional features for organizations that need more than the standard seat/desk model.

Base version: **v1.89.0** · Schema: **v45** · License: AGPL-3.0 (inherited from upstream)

---

## What's added

### 🚒 Vehicle Fields (Fahrzeug-Felder)

Spaces can represent vehicles, not just desks or rooms. Extended the Space entity with:

- **Vehicle Type** (`space_type=vehicle`) — distinguish vehicles from desks/rooms
- **License Plate** (`license_plate`) — Kennzeichen field
- **Capacity** (`capacity`) — seating/capacity count

Available in search, booking, admin UI, and all export functions.

### ✏️ Booking Corrections (Buchungsänderungen)

Users can **edit their own bookings** instead of delete-and-rebook. Includes:

- Correction flow with optional **approval requirement** per space (`correction_requires_approval`)
- Admin notification when approval is needed
- Works for single and recurring bookings

Original Seatsurfing only allows cancellation — no self-service editing.

### 🎨 Dynamic Branding

No hardcoded logos or organization names in the code. Branding is controlled entirely via database settings:

- `custom_logo_url` — organization logo image URL
- `custom_logo_text_line1` — primary text (e.g. organization name)
- `custom_logo_text_line2` — secondary text (e.g. department)

**Default: neutral Seatsurfing branding.** Any organization-specific look is configured at runtime, not baked into the code.

### 🇩🇪 German Defaults

- Language: `de` (instead of `en`)
- Date format: `d.m.Y`
- Workdays: all 7 days enabled by default
- `INIT_ORG_LANGUAGE` env var respected with German fallback

---

## Differences from upstream

| Area | Seatsurfing (upstream) | Seatsurfing Extended |
|---|---|---|
| Space types | Desk, Room | Desk, Room, **Vehicle** |
| Booking changes | Cancel only | **Edit + Cancel**, approval workflow |
| Branding | Hardcoded Seatsurfing | **Dynamic via DB**, neutral default |
| Language default | English | **German** |
| DB Schema | v45 | v45 (compatible, extended columns) |

The database schema is fully backward-compatible — same schema version, additional columns on `spaces` and `bookings`.

---

## Deployment

### Docker Compose (recommended)

```yaml
services:
  app:
    image: seatsurfing-extended:latest
    environment:
      POSTGRES_URL: "postgres://user:pass@db:5432/seatsurfing?sslmode=disable"
      PUBLIC_URL: http://your-host:8080
      FRONTEND_URL: http://your-host:8080
      CRYPT_KEY: "<32-byte-random-string>"
      PUBLIC_SCHEME: http
    ports:
      - 8080:8080
    depends_on:
      db:
        condition: service_healthy
    restart: always

  db:
    image: postgres:17
    environment:
      POSTGRES_USER: seatsurfing
      POSTGRES_PASSWORD: seatsurfing
      POSTGRES_DB: seatsurfing
    volumes:
      - db:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U seatsurfing"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  db:
```

### Build from source

```bash
# Build UI
cd ui && npm install && npm run build

# Build Docker image
docker buildx build --load -t seatsurfing-extended:latest .

# Run
docker compose up -d
```

### Default credentials

Fresh installation creates an admin user:

- **Email:** `admin@seatsurfing.local`
- **Password:** `Sea!urf1ng`

⚠️ Change this immediately after first login.

---

## Post-deploy configuration

After a fresh install, configure branding in **Admin → Settings**:

| Setting | Default | Purpose |
|---|---|---|
| `custom_logo_url` | *(empty)* | Organization logo URL |
| `custom_logo_text_line1` | *(empty)* | Primary text beside logo |
| `custom_logo_text_line2` | *(empty)* | Secondary text beside logo |
| `show_names` | `0` | Show "Colleagues" in navbar (set to `1`) |
| `default_language` | `de` | UI language for new users |
| `default_timezone` | `Europe/Berlin` | Timezone for bookings |

---

## Syncing with upstream

The fork tracks the upstream Seatsurfing repository:

```bash
git remote add upstream https://github.com/seatsurfing/seatsurfing.git
git fetch upstream --tags
git merge v1.xx.x
```

Custom changes are kept on `main`. Merge conflicts are typically in i18n files and `config.go` — resolved by keeping our defaults while accepting new upstream keys.

---

## Tech stack

Inherited from Seatsurfing:

- **Backend:** Go (repository pattern, no ORM, PostgreSQL)
- **Frontend:** Next.js, React, TypeScript, Bootstrap
- **Database:** PostgreSQL 17
- **Deployment:** Docker, distroless final image

---

## License

AGPL-3.0 — same as [Seatsurfing](https://github.com/seatsurfing/seatsurfing/blob/main/LICENSE).

This project is a fork and is not affiliated with or endorsed by the Seatsurfing project.