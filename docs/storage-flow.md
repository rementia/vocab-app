# Storage Flow

This document explains the storage flow of the public portfolio version of the vocabulary app.

## Conclusion

The public version separates vocabulary data, user learning data, and browser UI state.

```txt
Sample vocabulary data
→ Google Sheets CSV

User-specific learning data
→ Firestore portfolioUsers/{uid}

Browser UI state
→ localStorage
```

## Storage Roles

| Storage                          | Data                             | Scope               | Purpose                                          |
| -------------------------------- | -------------------------------- | ------------------- | ------------------------------------------------ |
| Google Sheets CSV                | Sample vocabulary data           | Public demo app     | Provides demonstration vocabulary data           |
| Firestore `portfolioUsers/{uid}` | User-specific learning data      | Same Google account | Saves favorites, difficult words, and timestamps |
| localStorage                     | UI state and local fallback data | Same browser only   | Restores the previous browser state              |

## Overall Flow

```txt
[Google Sheets]
      ↓
[CSV export]
      ↓
[Web App]
      ↓
 ┌───────────────────────────────┐
 │                               │
 ↓                               ↓
[Firestore: portfolioUsers/{uid}] [localStorage]
favorites, difficults             current volume, mode, UI state
```

## 1. Vocabulary Data Flow

The public version uses a small sample vocabulary dataset.

```txt
Google Sheets
  ↓
CSV export URL
  ↓
Web App
```

The sheet uses the following columns.

```txt
word
meaning
level
```

The app maps `level` values 1-4 to vol.1-vol.4.

```txt
level: 1 → vol1
level: 2 → vol2
level: 3 → vol3
level: 4 → vol4
```

The public demo dataset is intentionally small so that the app can be shown safely as a portfolio project.

## 2. User Data Flow

When the user logs in with Google, Firebase Authentication provides a user ID.

The app uses that user ID to save user-specific learning data in Firestore.

```txt
Firebase Authentication
  ↓
uid
  ↓
Firestore portfolioUsers/{uid}
```

Firestore structure:

```txt
portfolioUsers
└─ {uid}
   ├─ favorites
   ├─ favoritesUpdatedAt
   ├─ difficults
   └─ difficultsUpdatedAt
```

## 3. localStorage Flow

localStorage is used for browser-local state.

The public version uses the following key prefix.

```txt
portfolio_tango_
```

Main keys:

```txt
portfolio_tango_current_vol
portfolio_tango_current_mode
portfolio_tango_index_by_vol
portfolio_tango_sidebar_open
portfolio_tango_speech_sync
portfolio_tango_favorites
portfolio_tango_favorites_updated_at
portfolio_tango_difficults
portfolio_tango_difficults_updated_at
portfolio_tango_review_scores
portfolio_tango_challenge_mode
portfolio_tango_challenge_time
portfolio_tango_display_time
portfolio_tango_translation_mode
portfolio_tango_auto_play
portfolio_tango_random_mode
portfolio_tango_frequency_mode
```

localStorage restores state only in the same browser.

Examples:

| Key                            | Purpose                                            |
| ------------------------------ | -------------------------------------------------- |
| `portfolio_tango_current_vol`  | Restores the last selected volume                  |
| `portfolio_tango_current_mode` | Restores the last selected mode                    |
| `portfolio_tango_index_by_vol` | Restores the current word position for each volume |
| `portfolio_tango_sidebar_open` | Restores the sidebar open/closed state             |
| `portfolio_tango_speech_sync`  | Restores the auto-pronunciation state              |

## 4. App Startup Flow

When the app starts, the data is loaded in this general order.

```txt
1. Open the app
2. Load saved state from localStorage
3. Initialize navigation, UI events, and pronunciation
4. Check Firebase Authentication login state
5. Load sample vocabulary data from Google Sheets CSV
6. If logged in, load user data from Firestore portfolioUsers/{uid}
7. Render the current word and UI state
```

## 5. Favorite Word Flow

When the user marks a word as favorite:

```txt
User clicks favorite button
  ↓
Update favorite state in memory
  ↓
Save local fallback data to localStorage
  ↓
If logged in, save to Firestore portfolioUsers/{uid}
  ↓
Update favorite mode and UI
```

## 6. Difficult Word Flow

When the user marks a word as difficult:

```txt
User clicks difficult button
  ↓
Update difficult state in memory
  ↓
Save local fallback data to localStorage
  ↓
If logged in, save to Firestore portfolioUsers/{uid}
  ↓
Update difficult mode and UI
```

## 7. Why this separation is used

Firestore and localStorage have different responsibilities.

| Item     | Firestore                    | localStorage                 |
| -------- | ---------------------------- | ---------------------------- |
| Location | Cloud database               | Browser storage              |
| Sharing  | Same Google account          | Same browser only            |
| Best for | Long-term user learning data | UI state and local fallback  |
| Example  | favorites, difficults        | current volume, current mode |

## 8. Summary for interviews

This app separates public demo data, account-based learning data, and browser-local UI state.

The vocabulary dataset is loaded from Google Sheets CSV because the public version only needs a small safe demo dataset.

User-specific learning data, such as favorites and difficult words, is saved in Firestore under `portfolioUsers/{uid}` so it can be associated with a Google login.

UI state, such as the current volume, current mode, and sidebar state, is saved in localStorage using the `portfolio_tango_` prefix. This prevents the public version from conflicting with the private study version.
