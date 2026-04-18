# Android Management System (AMS)

A focused Android app control center for tracking ideas, active builds, and published apps without unnecessary dashboard clutter.

## Stack

- **Backend/runtime:** Node.js + Express
- **Frontend/dashboard:** React + Vite
- **Database:** Supabase
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## Project structure

```text
.
├── backend/   # Express API for app ideas
├── frontend/  # React dashboard
└── .env.example
```

## Product structure

The app is intentionally tight and centered on the core workflow:

- Dashboard
- Apps List
- Add / Edit App
- App Detail
- Idea Vault
- Settings

## Core features

- CRUD for apps: create, list, edit, and delete.
- Dashboard stats for total apps, Play Store apps, personal apps, and ideas not started yet.
- Search plus filters for status, type, tags, and custom categories.
- Recent apps list for quick access.
- Idea Vault for rough concepts before converting them into full app records.
- Minimal settings page with profile and default template placeholders.

## Data model

### `apps`

Suggested columns in Supabase:

- `id` uuid primary key default `gen_random_uuid()`
- `name` text not null
- `type` text not null
- `status` text not null
- `category` text not null
- `description` text
- `links` jsonb default `'{}'::jsonb`
- `notes` text
- `tags` text[] default `'{}'`
- `created_at` timestamp with time zone default `now()`
- `updated_at` timestamp with time zone default `now()`

### `ideas`

Suggested columns in Supabase:

- `id` uuid primary key default `gen_random_uuid()`
- `title` text not null
- `description` text
- `category` text
- `tags` text[] default `'{}'`
- `created_at` timestamp with time zone default `now()`

## API endpoints

- `GET /api/health`
- `GET /api/apps`
- `GET /api/apps/:id`
- `POST /api/apps`
- `PUT /api/apps/:id`
- `DELETE /api/apps/:id`
- `GET /api/ideas`
- `POST /api/ideas`
- `DELETE /api/ideas/:id`
- `POST /api/ideas/:id/convert`

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Add your Supabase project URL and service role key in `.env`.
4. Start both apps:
   ```bash
   npm run dev
   ```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Supabase setup (required for production)

1. Create a new Supabase project.
2. Open Supabase SQL Editor and run:
   - `supabase/schema.sql`
3. (Optional) Add starter records by running:
   - `supabase/seed.sql`
4. In Supabase Project Settings > API, copy:
   - Project URL (`SUPABASE_URL`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)

## Vercel notes

- This repo already includes Vercel serverless routes inside `frontend/api`.
- In Vercel, set **Root Directory** to `frontend`.
- Build command: `npm run build`
- Output directory: `dist`
- Add these environment variables in Vercel Project Settings:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Redeploy after saving env vars.

If Supabase variables are not set, the API uses in-memory fallback data. This is useful for UI preview but data will not persist.

## Next ideas

- Add authentication with Supabase Auth.
- Add drag-and-drop Kanban views.
- Add tags, deadlines, and competitor research links.
- Add analytics for idea validation and launch readiness.
# EMT Equipment Maintenance Tracker

Lightweight Android app (Kotlin + Jetpack Compose) to track equipment, maintenance logs, attachments, and reminders for field teams.

## Table of contents

- 1. Developer (Dev)
  - Requirements
  - Setup & run (development)
  - Project structure & important files
  - Testing & debugging
  - Notes (permissions, notifications, storage)
- 2. Google Play
  - App identifier
  - Play Store release checklist
  - Building a signed release (AAB)
  - Permissions & privacy

---

## 1. Developer (Dev)

This section helps contributors and maintainers get the project running locally and explains where the important pieces are.

### Requirements

- Android Studio (Electric Eel or later recommended)
- JDK 11 or newer
- Use the included Gradle wrapper (`./gradlew`)
- Device or emulator targeting Android 8.0+ (API 26+) — project uses Android 13 notification permission handling

### Setup & run (development)

1. Clone the repo:
   git clone https://github.com/A22051694/EMT-Equipment-Tracker.git
2. Open the project in Android Studio (select project root).
3. Let Android Studio import Gradle and download dependencies.
4. Connect a device or start an emulator and run the `app` module.

Common Gradle commands:
- ./gradlew assembleDebug
- ./gradlew clean
- ./gradlew connectedAndroidTest

### Project configuration notes

- Application/package: `com.digitalconveniencetool.emtequipmentmaintenancetracker` (see app/src/main/AndroidManifest.xml).
- UI: Jetpack Compose (Material 3). Theme applied in `MainActivity` via `EMTEquipmentMaintenanceTrackerTheme`.
- Background: WorkManager used for scheduled checks/workers. BootCompletedReceiver reschedules background work on reboot.
- File sharing: `FileProvider` configured for attachments (authority `${applicationId}.fileprovider`).
- ProGuard/R8 rules are at `app/proguard-rules.pro` (review release settings before shipping).

### Important files & where to start

Start here to understand app flow and data model:
- `app/src/main/java/.../MainActivity.kt` — Compose entrypoint & navigation host
- `app/src/main/java/.../ui/navigation/AppNavGraph.kt` — app navigation
- `app/src/main/java/.../data/database/EMTDatabase.kt` — Room DB definition
- `app/src/main/java/.../data/entities/EquipmentEntity.kt` and `dao/EquipmentDao.kt` — data model & DB access
- `app/src/main/java/.../repository/EquipmentRepositoryImpl.kt` — repository implementation
- `app/src/main/java/.../viewmodel/HomeViewModel.kt` and `ui/screens/HomeScreen.kt` — example ViewModel -> UI flow
- `app/src/main/java/.../notifications/NotificationFactory.kt` — local notification helpers

The repository includes a `plan.md` with proposed schema and project structure; the suggested build order is Database → Domain → Repository → ViewModel → UI → Notifications.

### Testing & debugging

- Use Android Studio's Logcat, Layout Inspector, and Compose tooling.
- Unit tests: `./gradlew test` (JVM tests). Instrumentation tests: `./gradlew connectedAndroidTest`.
- Watch for runtime permissions (POST_NOTIFICATIONS on Android 13+), and validate BootCompletedReceiver behavior when testing reboots.

### Notes / gotchas

- Notifications: ensure notification channels are created and the runtime notification permission is requested on Android 13+.
- FileProvider: grant temporary URI permissions when sharing files via intents.
- Backups: manifest references `data_extraction_rules` and `backup_rules` — review before release.
- If adding storage, camera, or network permissions, update privacy policy and Play Console Data Safety.

---

## 2. Google Play

Guidance for preparing and publishing the app to Google Play.

### App identifier

- package/applicationId: `com.digitalconveniencetool.emtequipmentmaintenancetracker`

### Play Store release checklist

- Create a Play Console developer account and app listing.
- Provide a privacy policy URL (required for handling user/device data).
- Prepare assets: high-res icon, screenshots, feature graphic, short/long descriptions.
- Target and compile SDK should meet current Play requirements (update `targetSdkVersion` as required).
- Enable Play App Signing (recommended).
- Test signed release across multiple devices and API levels.

### Building a signed release (AAB) — recommended

1. Create or use a signing keystore (.jks). Keep it secure.
2. In Android Studio: Build > Generate Signed Bundle / APK > Android App Bundle (.aab).
3. Or use Gradle: `./gradlew bundleRelease` (ensure signingConfigs configured in `app/build.gradle`).
4. Upload `.aab` to Play Console (start with Internal testing track).
5. Increment `versionCode` and `versionName` for each release.

Notes:
- Review proguard/shrinker settings and `proguard-rules.pro` so required classes are not removed.
- Validate runtime permission flows (notification permission, external storage if used).

### Permissions & privacy

- Declared runtime permissions in repo:
  - `android.permission.POST_NOTIFICATIONS` (Android 13+)
  - `android.permission.RECEIVE_BOOT_COMPLETED` (re-schedule reminders)
- If you add storage, camera, or location: update privacy policy and Play Console Data Safety form.

### Play Store listing tips

- Short description: "Track equipment, maintenance logs, attachments and reminders for field teams."
- Long description: emphasize offline-first local DB, reminders & notifications, attachments support, and modern Compose UI.
- Screenshots: Home, Equipment detail, Add/Edit equipment, Attachments, Reminders.
- Release notes: use track-specific release notes (Internal → Alpha → Beta → Production).

---

## License & contact

This repository does not include a LICENSE file. Add an open source license (MIT / Apache-2.0) if you intend to make the code public.

For help: open an issue in this repo or contact the maintainer @A22051694.
----
Done — I added a new 2.c section with ready-to-use, customer-facing Google Play copy you can drop into the Play Console or the README. Below is the exact text (short description, full description, what's new template, permissions/privacy blurb, support/contact text, screenshot captions and ASO tips). You can paste these directly into your Play Store listing or into README.md under the Google Play section.

2.c — Google Play (Customer-facing listing copy)

Short description (<= 80 chars)
Track EMT equipment, maintenance logs, attachments and reminders—stay inspection-ready.

Full (long) description (use in Play Console long description)
EMT Equipment Maintenance Tracker helps field teams keep lifesaving gear ready and compliant. Store equipment records locally, add maintenance logs and attachments (photos, PDFs), and set reminders so you never miss inspections or service dates.

Key features:
- Centralized equipment registry with customizable fields for serials, locations, and notes.
- Maintenance logs attached to equipment (photos and documents supported).
- Reminders & local notifications for upcoming inspections, warranty checks, and service intervals.
- Offline-first local database — works without constant internet access.
- Simple, modern UI built with Jetpack Compose for fast navigation.
- Export/import attachments and backup rules support (check app settings for options).

Who is this for?
Designed for EMTs, medical technicians, field-service teams, and small organizations that must track and maintain equipment reliably.

Why you’ll love it
Lightweight and focused on what matters — record changes quickly, attach evidence, and get timely reminders so equipment is inspection-ready when it matters most.

What’s New (release notes template)
- vX.Y.Z — Date
  - Improvements: performance and stability improvements.
  - New: [briefly describe feature] (e.g., "Added attachment thumbnail preview" or "Improved reminder scheduling logic").
  - Fixes: bug fixes and minor UI improvements.
(Use a short, specific changelog for each release; highlight bug fixes and user-facing features.)

Permissions & privacy (customer-facing explanation)
This app requests only the permissions it needs to provide core functionality:
- Notifications: to deliver reminders and alerts.
- Boot completed: to reschedule reminders after device restart.
Attachments/photo support may request storage or camera permissions when you use those features — we only access files you explicitly choose to attach. We do not collect or share personal data externally by default. See the privacy policy for full details.

Support & contact
If you have questions or need help:
- In-app: Open the Help/Feedback screen (if available) or go to Settings → Contact Support.
- Email: [maintainer-email-or-placeholder] (replace with your contact)
- GitHub: https://github.com/A22051694/EMT-Equipment-Tracker (open issues for bugs or feature requests)

Screenshot captions (suggested, match screenshot order)
1. Home dashboard — quick overview of equipment & upcoming reminders.
2. Equipment detail — serials, notes, and attachments.
3. Add/edit equipment — fast input & custom fields.
4. Attachments — photos and PDFs attached to records.
5. Reminders — schedule and manage maintenance notifications.

ASO / Play listing tips (short)
- Lead with the problem and value: "Never miss equipment inspections" or "Keep lifesaving equipment ready."
- Use primary keywords in the first sentence of the long description (e.g., equipment tracker, maintenance logs, reminders).
- Provide clear screenshots showing the flow (add equipment → attach photo → set reminder → notification).
- Localize descriptions and screenshots for target markets where possible.

Privacy policy & Data safety
Add a clear privacy policy URL in the Play Console that explains:
- What data the app stores locally
- Any data shared or uploaded (if any)
- How to request deletion if the app starts syncing data externally in the future

FAQs (optional, small set)
Q: Does the app require an internet connection?
A: No — it works offline. Internet is only needed if you export or upload attachments (future feature).

Q: Can reminders survive device restarts?
A: Yes — the app uses BootCompletedReceiver to reschedule reminders after reboot.

Q: Is my data backed up?
A: The app references backup rules; check Settings for backup/export options before upgrading devices.
