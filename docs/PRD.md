# Product Requirements Document — Rinse

> Clean your photo gallery with a swipe.

## 1. Overview

Rinse is a mobile application that helps users review their photo libraries using a swipe interface. Photos are grouped by month and presented one at a time as draggable cards. Users swipe left to mark a photo for local Trash review, right to keep. Permanent deletion requires a separate confirmation. Automatic purge is a proposed feature and is not implemented.

## 2. Problem Statement

- Large photo libraries are hard to review one image at a time.
- A month-by-month review gives users a smaller, clear task.
- Users need a chance to restore a marked photo before permanent deletion.

## 3. Target Users

- **Primary:** Users with 1,000+ photos who want to reduce clutter
- **Secondary:** Users who want more storage space without paying for iCloud/Google One
- **Tertiary:** Privacy-conscious users who want on-device-only photo management

## 4. Goals & Non-Goals

### Goals

- Provide a fast, tactile, satisfying photo cleaning experience
- Group photos by month for manageable chunks
- Track progress and stats to motivate users
- Offer undo and trash to prevent accidental data loss
- Keep gallery photos and review records on the device in the app implementation.

### Non-Goals

- Photo editing or filters
- Cloud backup or sync
- AI-powered photo categorization
- Social sharing
- Photo tagging or albums

## 5. User Stories

### Onboarding

| # | Story | Priority |
|---|-------|----------|
| 1 | As a new user, I want to grant photo permission so I can start cleaning | P0 |
| 2 | As a new user, I want to see an explanation of what the app does before granting permission | P1 |

### Months List

| # | Story | Priority |
|---|-------|----------|
| 3 | As a user, I want to see my photos grouped by month, newest first | P0 |
| 4 | As a user, I want to see how many photos are in each month | P0 |
| 5 | As a user, I want to see a thumbnail preview for each month | P0 |
| 6 | As a user, I want to see progress for each month (reviewed/deleted/kept) | P0 |
| 7 | As a user, I want to tap a month to start a cleaning session | P0 |
| 8 | As a user, I want to see which months are already complete | P1 |

### Swipe Session

| # | Story | Priority |
|---|-------|----------|
| 9 | As a user, I want to swipe left to mark a photo for Trash | P0 |
| 10 | As a user, I want to swipe right to keep a photo | P0 |
| 11 | As a user, I want to see the next card behind the current one | P0 |
| 12 | As a user, I want to tap buttons to mark/keep/skip as an alternative to swiping | P0 |
| 13 | As a user, I want haptic feedback when swiping | P1 |
| 14 | As a user, I want to see a progress bar during the session | P0 |
| 15 | As a user, I want to close the session and resume later from where I left off | P0 |
| 16 | As a user, I want to undo a delete within 5 seconds | P0 |
| 17 | As a user, I want to see a celebration when I finish a month | P1 |

### Trash

| # | Story | Priority |
|---|-------|----------|
| 18 | As a user, I want to see all items in my trash | P0 |
| 19 | As a user, I want to restore items from trash | P0 |
| 20 | As a user, I want to empty my trash | P0 |
| 21 | As a user, I want items to auto-purge from trash after 30 days (not implemented; would require explicit consent and native testing) | P1 |

### Stats

| # | Story | Priority |
|---|-------|----------|
| 22 | As a user, I want to see total photos reviewed and marked for Trash | P1 |
| 23 | As a user, I want to see space freed estimates (not implemented; no reliable size data) | P2 |

## 6. Design Specifications

### Theme

- **Background:** #0D0D0F (deep black)
- **Primary:** #6C63FF (purple)
- **Delete:** #FF3B30 (red)
- **Keep:** #34C759 (green)
- **Text:** #FFFFFF (white)
- **Style:** Dark and minimal

### Typography

- Title: 32px / 700 weight
- Heading: 24px / 600 weight
- Body: 16px / 400 weight
- Caption: 13px / 400 weight

### Card Dimensions

- Card height: 70% of screen
- Card width: 100% of screen with padding
- Border radius: 24px
- Swipe threshold: 33% of screen width

## 7. Technical Requirements

### Platform

- iOS 15+
- Android 8+ (API 26)

### Performance

- Library scan: paginated metadata; a complete scan is still needed to build the month list
- Selected month: load photo records in batches of 20 before showing cards
- Card rendering: current card and next card
- Session resume: persisted position; no measured time target yet

### Privacy

- No gallery-photo or review-metadata uploads in app code; Expo development and build services may use the network
- No analytics/tracking
- No cloud storage
- All timestamps stored as Unix epoch ms

## 8. Milestones

| Milestone | Description | Status |
|-----------|-------------|--------|
| M1 | Project setup, types, theme, constants | ✅ Done |
| M2 | Storage layer (session, trash, stats) | ✅ Done |
| M3 | Providers (Gallery, CleanSession) | ✅ Done |
| M4 | UI Components (SwipeCard, MonthCard, etc.) | ✅ Done |
| M5 | Screens (Months list, Clean session, Trash) | ✅ Done |
| M6 | Integration & Navigation | ✅ Done |
| M7 | Testing & Polish | In progress: storage/session tests and Android bundle pass; native photo flow still requires emulator verification |
