# English Vocabulary App

A web-based vocabulary learning app focused on recall-based learning and efficient review.

This app was created as a portfolio project to support English vocabulary learning through repeated recall, pronunciation practice, random review, favorite word management, and difficult word review.

## Screenshots

![Main Screen](./images/main.png)

## Demo

https://rementia.github.io/vocab-app/

## Overview

This app focuses on recall-based learning, rather than simple memorization, to improve long-term retention of English vocabulary.

Users can practice recalling word meanings, listen to pronunciation, switch between vocabulary levels, register favorite words, mark difficult words, and review them later.

For the public portfolio demo, the app uses a small sample vocabulary dataset prepared separately for demonstration purposes.

## Public Version Design

This repository is the public portfolio version of the vocabulary app.

The public version is separated from the private study version so that demo users, sample vocabulary data, and browser storage do not mix with the private study environment.

| Area                      | Public portfolio version                             |
| ------------------------- | ---------------------------------------------------- |
| Repository                | `vocab-app`                                          |
| Demo URL                  | GitHub Pages public demo                             |
| Vocabulary data           | Google Sheets CSV sample dataset                     |
| Firestore user collection | `portfolioUsers`                                     |
| localStorage key prefix   | `portfolio_tango_`                                   |
| Main purpose              | Portfolio presentation and safe public demonstration |

## Features

* Level-based learning: vol.1–4
* English word and meaning display
* Pronunciation feature
* Auto-pronunciation mode
* Random mode
* 四択問題 mode with English-to-Japanese and Japanese-to-English questions
* Favorite word management
* Difficult word management
* Favorite word list
* Difficult word list
* Recall mode with adjustable time
* Review history that makes frequently missed words appear more often in frequency mode
* Progress display
* Keyboard shortcuts for PC
* Responsive design for mobile devices
* Google login for cloud-based user data storage

## Technologies

* HTML
* CSS
* JavaScript
* Firebase Authentication
* Cloud Firestore
* Google Sheets
* GitHub Pages

## Data Management

The public demo uses a dedicated sample vocabulary sheet.

Vocabulary data is loaded from a Google Sheets CSV export URL. The demo sheet uses `word`, `meaning`, and `level` columns, and the app maps `level` values 1-4 to vol.1-vol.4.

Only demonstration data is included in this public version. The dataset is intentionally kept small to avoid reproducing any specific commercial textbook, word list, example sentences, translations, ordering, or classification.

## Storage Design

This app separates data by purpose.

| Storage                          | Data                         | Scope               | Purpose                                                  |
| -------------------------------- | ---------------------------- | ------------------- | -------------------------------------------------------- |
| Google Sheets CSV                | Sample vocabulary data       | Public demo app     | Provides small demo vocabulary data                      |
| Firestore `portfolioUsers/{uid}` | User-specific learning data  | Same Google account | Saves favorites, difficult words, and related timestamps |
| localStorage                     | Browser-local UI state       | Same browser only   | Restores the previous browser state                      |

## Data Flow

```txt
Google Sheets
  ↓
CSV export
  ↓
Web App
  ↓
Cloud Firestore: portfolioUsers/{uid}
```

## Firestore Design

The public version uses the following Firestore collection for logged-in user data.

```txt
portfolioUsers/{uid}
```

Example structure:

```txt
portfolioUsers
└─ {uid}
   ├─ favorites
   ├─ favoritesUpdatedAt
   ├─ difficults
   └─ difficultsUpdatedAt
```

This keeps public portfolio demo user data separate from the private study version.

## localStorage Design

The public version uses the following localStorage key prefix.

```txt
portfolio_tango_
```

Main localStorage keys:

```txt
portfolio_tango_current_vol
portfolio_tango_current_mode
portfolio_tango_index_by_vol
portfolio_tango_sidebar_open
portfolio_tango_speech_sync
portfolio_tango_review_scores
portfolio_tango_challenge_mode
portfolio_tango_challenge_time
portfolio_tango_display_time
portfolio_tango_translation_mode
portfolio_tango_multiple_choice_mode
portfolio_tango_auto_play
portfolio_tango_random_mode
portfolio_tango_frequency_mode
```

localStorage is used for browser-local UI state, such as the selected volume, current mode, word position, sidebar state, display settings, and review history used by 四択問題 and frequency mode.

四択問題 mode stores per-word correct and incorrect answer history in `portfolio_tango_review_scores`. Frequency mode uses that local review history so words answered incorrectly appear more often, while words with repeated correct answers appear slightly less often.

## Why Firestore and localStorage are separated

Firestore and localStorage have different roles.

```txt
Firestore
= account-based learning data

localStorage
= browser-based UI state
```

Firestore is used for data that should be linked to a Google login and shared across devices for the same user.

localStorage is used for data that only needs to be restored in the same browser.

This separation makes the public portfolio version easier to explain, safer to demonstrate, and less likely to conflict with the private study version.

## Key Design Ideas

This app is designed with the following principles:

* Treat vocabulary as connected meanings rather than isolated translations
* Improve retention through repeated recall
* Encourage active recall before checking the meaning
* Make review more efficient by focusing on favorite and difficult words
* Keep the interface simple and usable on both PC and mobile devices
* Separate public demo data from private study data

## Login and Data Storage

This app can be used with or without Google login.

### When using without login

If you do not log in, the app can still display vocabulary and restore browser-local UI state through localStorage.

Examples of locally saved data:

* selected volume
* current word position
* app mode
* display settings
* sidebar state

This data stays only in the same browser and device. It is not shared across devices.

### When using Google login

Google login is used through Firebase Authentication.

When you log in, Firebase Authentication manages login information such as your user ID and email address.

The app uses Cloud Firestore to save user-specific learning data, such as:

* favorite words
* difficult words
* last updated timestamps
* user-specific app state used by the learning features

User-specific learning data is saved under `portfolioUsers/{uid}`.

This data is used only to provide the learning, favorite, and difficult word features of this app.

### GitHub Pages and Firebase

This app is hosted on GitHub Pages, but Google login is handled by Firebase Authentication.

Logging in to this app is different from logging in to GitHub.

GitHub does not manage your app login data.

### Authorized domains

For Google login to work on GitHub Pages, the GitHub Pages domain must be added to the Firebase Authentication authorized domains list.

Example:

```txt
your-username.github.io
```

## Docs

* [Storage Flow](docs/storage-flow.md)
* [Manual Test Checklist](docs/manual-test-checklist.md)

## Copyright Notice

This project is intended for portfolio and learning purposes.

The public demo uses a small, independently prepared sample vocabulary dataset. It is not intended to reproduce any specific commercial textbook, word list, example sentences, translations, ordering, or classification.

English words themselves are general language information, but the selection, ordering, translations, examples, and classification of commercial learning materials may require careful handling. For that reason, this public version uses demo data prepared separately for safe presentation.

## Privacy Notice

This app uses Firebase Authentication for Google login and Cloud Firestore to save user-specific learning data.

When a user signs in with Google, Firebase Authentication may manage login-related information such as the user's UID and email address.

Cloud Firestore stores the following user-specific data:

* Firebase Authentication UID
* Favorite word data
* Difficult word data
* Last updated timestamps for learning data

This data is used only to provide the learning features and to save user-specific learning data. It is not used for advertising, sold to third parties, or used for purposes unrelated to this app.

### プライバシーについて

このアプリでは、Googleログイン機能に Firebase Authentication を使用しています。

ログイン時に、Firebase Authentication 上でユーザーID（UID）およびメールアドレスなどのログイン情報が管理される場合があります。

Firestoreには、ログインユーザーごとのお気に入り情報、苦手単語情報、更新日時を保存します。

これらの情報は、お気に入り機能、苦手単語機能、および学習状態の保存のためにのみ使用し、広告配信・第三者販売・目的外利用には使用しません。

## Future Improvements

* Improve mobile landscape layout
* Add detailed learning history
* Track correct and incorrect answers
* Improve weak-word review mode
* Improve progress visualization
* Add pronunciation cache

## Author

Anonymous

![Main Screen](./images/main.png)

## Demo

https://rementia.github.io/vocab-app/

## Overview

This app focuses on recall-based learning, rather than simple memorization, to improve long-term retention of English vocabulary.

Users can practice recalling word meanings, listen to pronunciation, switch between vocabulary levels, register difficult words as favorites, and review them later.

For the public portfolio demo, the app uses a small sample vocabulary dataset prepared separately for demonstration purposes.

## Features

- Level-based learning: vol.1–4
- English word and meaning display
- Pronunciation feature
- Auto-pronunciation mode
- Random mode
- Favorite word management
- Favorite word list
- Recall mode with adjustable time
- Progress display
- Keyboard shortcuts for PC
- Responsive design for mobile devices
- Google login for cloud-based favorite storage

## Technologies

- HTML
- CSS
- JavaScript
- Firebase Authentication
- Cloud Firestore
- Google Sheets
- GitHub Pages

## Data Management

The public demo uses a dedicated sample vocabulary sheet.

Vocabulary data is loaded from a Google Sheets CSV export URL. The demo sheet uses `word`, `meaning`, and `level` columns, and the app maps `level` values 1-4 to vol.1-vol.4. Only demonstration data is included in this public version, and the dataset is intentionally kept small to avoid reproducing any specific commercial textbook or word list.

Favorite words are saved separately in Cloud Firestore for each logged-in user.

Data flow:

Google Sheets  
↓  
CSV export  
↓  
Web App  
↓  
Cloud Firestore for favorites

## Key Design Ideas

This app is designed with the following principles:

- Treat vocabulary as connected meanings rather than isolated translations
- Improve retention through spaced recall
- Encourage active recall before checking the meaning
- Make review more efficient by focusing on difficult words
- Keep the interface simple and usable on both PC and mobile devices

## Login and Data Storage

This app can be used with or without Google login.

### When using without login

If you do not log in, the app can still display vocabulary and restore browser-local UI state through localStorage.

Examples of locally saved data:

- selected volume
- current word position
- app mode
- display settings
- sidebar state

This data stays only in the same browser and device.  
It is not shared across devices.

### When using Google login

Google login is used through Firebase Authentication.

When you log in, Firebase Authentication manages login information such as your user ID and email address.

The app uses Cloud Firestore to save user-specific learning data, such as:

- favorite words
- difficult words
- last updated timestamps
- user-specific app state used by the learning features

User-specific learning data is saved under `portfolioUsers/{uid}`.

This data is used only to provide the learning, favorite, and difficult word features of this app.

### GitHub Pages and Firebase

This app is hosted on GitHub Pages, but Google login is handled by Firebase Authentication.

Logging in to this app is different from logging in to GitHub.

GitHub does not manage your app login data.

### Authorized domains

For Google login to work on GitHub Pages, the GitHub Pages domain must be added to the Firebase Authentication authorized domains list.

Example:

```text
your-username.github.io

## Copyright Notice

This project is intended for portfolio and learning purposes.

The public demo uses a small, independently prepared sample vocabulary dataset. It is not intended to reproduce any specific commercial textbook, word list, example sentences, translations, ordering, or classification.

English words themselves are general language information, but the selection, ordering, translations, examples, and classification of commercial learning materials may require careful handling. For that reason, this public version uses demo data prepared separately for safe presentation.

## Privacy Notice

This app uses Firebase Authentication for Google login and Cloud Firestore to save user-specific favorite word data.

When a user signs in with Google, Firebase Authentication may manage login-related information such as the user's UID and email address.

Cloud Firestore stores the following user-specific data:

- Firebase Authentication UID
- Favorite word data
- Last updated timestamp for favorite data

This data is used only to provide the favorite word feature and to save user-specific learning data.  
It is not used for advertising, sold to third parties, or used for purposes unrelated to this app.

### プライバシーについて

このアプリでは、Googleログイン機能に Firebase Authentication を使用しています。  
ログイン時に、Firebase Authentication 上でユーザーID（UID）およびメールアドレスなどのログイン情報が管理される場合があります。

Firestoreには、ログインユーザーごとのお気に入り情報と更新日時を保存します。  
これらの情報は、お気に入り機能および学習状態の保存のためにのみ使用し、広告配信・第三者販売・目的外利用には使用しません。

## Future Improvements

- Improve mobile landscape layout
- Add detailed learning history
- Track correct and incorrect answers
- Add weak-word review mode
- Improve progress visualization

## Author

Anonymous
