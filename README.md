# English Vocabulary App

[![Test](https://github.com/rementia/vocab-app/actions/workflows/test.yml/badge.svg)](https://github.com/rementia/vocab-app/actions/workflows/test.yml)

A browser-based English vocabulary learning app built as a portfolio project.

The app focuses on recall-based learning and efficient review through pronunciation, random review, frequency-based review, favorites, difficult words, recall mode, and 四択問題 mode.

## Demo

https://rementia.github.io/vocab-app/

## Overview

This repository is the public portfolio/demo version of the vocabulary learning app.

The app is a static frontend built with HTML, CSS, JavaScript, Firebase Authentication, Cloud Firestore, Google Sheets CSV, and GitHub Pages. It does not require a backend server or build step.

The public version uses a small demo vocabulary dataset and separates its Firestore collection and localStorage prefix from the private study version. A separate private study version exists with Firestore-backed vocabulary syncing through Google Apps Script.

## Main Features

* Level-based vocabulary display: vol.1-vol.4
* English word and Japanese meaning display
* Pronunciation and pronunciation sync
* Auto-play review
* Random order review
* Frequency order review
* Recall learning mode
* 四択問題 mode for English-to-Japanese and Japanese-to-English practice
* Per-word review scores and answer stats
* Favorite words and difficult words after Google login
* Search and keyboard shortcuts
* Responsive layout for desktop and mobile

## Browser Audio Note

iOS Safari may require tapping the pronunciation button or the screen once before Web Speech audio can play. After audio is enabled, pronunciation sync can be used with swipes and keyboard navigation.

## Technologies

* HTML
* CSS
* JavaScript modules
* Firebase Authentication
* Cloud Firestore
* Google Sheets CSV export
* GitHub Pages
* Node.js test runner

## Directory Structure

```txt
app.js                       App initialization and module wiring
bootstrap.js                 Startup entry point
data.js                      Google Sheets CSV fetching and parsing
dom.js                       DOM element lookup
ui.js                        DOM rendering and button state updates
events.js                    Keyboard, touch, and viewport events
storage.js                   localStorage keys and safe storage helpers
savedStateController.js      Saved localStorage state restore and validation
autoPlayController.js        Auto-play timers and playback flow
speechSyncController.js      Pronunciation sync timers and user activation handling
cloudSyncController.js       Authentication and Firestore sync orchestration
favorites.js                 Firestore sync helpers for user learning data
favoritesManager.js          Favorite word behavior
difficultsManager.js         Difficult word behavior
reviewManager.js             Review scores and review stats
multipleChoice.js            四択問題 option generation
wordOrderService.js          Random and frequency word ordering
wordReloadService.js         Current word position handling after CSV reload
reloadStatusService.js       Reload status messages and auto-clear timers
wordIdentity.js              Stable word key normalization
wordList.js                  Shared word-list helpers
navigation.js                Word navigation history
pronunciation.js             Pronunciation lookup and speech playback
.github/workflows/test.yml   GitHub Actions workflow for npm test
firestore.rules              Firestore access rules for portfolio user data
package-lock.json            Locked npm dependency resolution for reproducible CI
test/                        Node-based tests
docs/                        Storage flow and manual test notes
```

## Data Flow

```txt
Google Sheets
  ↓
CSV export
  ↓
JavaScript fetch
  ↓
CSV parser
  ↓
Browser UI
```

Logged-in user learning data is stored separately:

```txt
Firebase Authentication
  ↓
uid
  ↓
Cloud Firestore portfolioUsers/{uid}
```

Browser-local UI state is restored from localStorage:

```txt
localStorage portfolio_tango_*
```

Vocabulary data is normally loaded from Google Sheets CSV when the app starts. After editing the spreadsheet, use the `単語更新` button in the sidebar or reload the page to fetch the latest CSV. Explicit reloads add a cache-busting query so the browser is less likely to reuse an old CSV response. Favorites, difficult words, and review scores are tied to word IDs based on the English word, so changing the English word can make it behave like a different word; editing only the meaning is generally safer.

## Public and Study Versions

The public portfolio app and the private study app are intentionally separated.

| Area | vocab-app | vocab-app-study |
| --- | --- | --- |
| Purpose | Public portfolio/demo version | Private study version |
| Vocabulary source | Google Sheets CSV direct fetch | Google Sheets -> Apps Script -> Firestore |
| User collection | `portfolioUsers/{uid}` | `privateUsers/{uid}` |
| Word collection | none | `privateWords/{vol}` |
| localStorage prefix | `portfolio_tango_` | `vocab_app_study_` |
| Demo/public usage | Public GitHub Pages demo | Private/personal study usage |

This separation prevents demo users, sample vocabulary data, Firestore documents, and browser-local state from mixing with the private study environment.

## Firebase Authentication and Firestore

Google login is handled by Firebase Authentication.

After login, the app uses the Firebase UID to read and write user-specific learning data under:

```txt
portfolioUsers/{uid}
```

Firestore stores user learning data such as:

* favorites
* favoritesUpdatedAt
* difficults
* difficultsUpdatedAt

Firestore Security Rules should restrict each `portfolioUsers/{uid}` document to the matching authenticated user. This repository includes `firestore.rules` as the intended rule set for the public version.

## Firebase API Key

The Firebase Web API key in `firebaseClient.js` is part of the public client configuration. For Firebase web apps, this API key is not a secret key by itself.

The important protection is Firestore Security Rules and Firebase Authentication. The API key identifies the Firebase project, while the rules decide which authenticated users can read or write protected data.

## localStorage

Without login, the app can still display vocabulary and restore browser-local UI state in the same browser.

The public version uses this prefix:

```txt
portfolio_tango_
```

Main localStorage data:

* selected volume
* current mode
* word position by volume
* sidebar state
* pronunciation sync setting
* recall and display time settings
* translation mode
* 四択問題 mode setting
* auto-play, random mode, and frequency mode settings
* review scores / review stats used by 四択問題 and frequency mode

User-specific learning data such as favorites and difficult words is available after Google login and is saved to Firestore under `portfolioUsers/{uid}`.

## Review Scores

四択問題 mode records answer stats per word.

Correct answers:

* increase `correct`
* increase `streakCorrect`
* reset `streakWrong`
* update `lastAnsweredAt`

Wrong answers:

* increase `wrong`
* increase `streakWrong`
* reset `streakCorrect`
* update `lastAnsweredAt`

Frequency mode uses these stats so words with more wrong answers appear more often, while words with repeated correct answers become slightly less frequent. A lower bound keeps every word eligible for review.

## Error Handling

The app keeps local features usable when possible.

* CSV fetch failure shows a loading error.
* Empty CSV results are treated as load failures for that volume.
* Firebase login failure shows an error message.
* Firestore sync failure shows a non-blocking warning and keeps the local UI usable.
* localStorage write failure shows a non-blocking warning and continues the current session.

## Testing

Run the test suite with:

```bash
npm test
```

The tests use Node.js and the built-in `assert` module. No additional test framework is required.

GitHub Actions runs the same `npm test` command automatically on pushes to `main`, pull requests targeting `main`, and manual `workflow_dispatch` runs. CI uses `npm ci` to reproduce dependencies from `package-lock.json`. The badge at the top of this README shows the current `Test` workflow status. To run it manually on GitHub, open the Actions tab, select the `Test` workflow, and click `Run workflow`.

Current test coverage includes:

* data loading: CSV parsing, vocabulary mapping, word identity, and word list helpers
* ordering and reload flow: random/frequency ordering, saved state restore, word reload index preservation, and reload status auto-clear
* learning behavior: multiple choice, review scores, pronunciation helpers, navigation, and search
* controllers: auto play, speech sync, and cloud sync
* persistence and marks: storage, favorites manager, difficults manager, and review manager
* UI behavior: rendering helpers, events, and keyboard shortcuts

## Security Notes

This app is hosted on GitHub Pages, but Google login is handled by Firebase Authentication.

Logging in to this app is different from logging in to GitHub. GitHub does not manage the app's user data.

For deployment, the GitHub Pages domain must be added to Firebase Authentication authorized domains.

## Copyright Notice

This project is intended for portfolio and learning purposes.

The public demo uses a small, independently prepared sample vocabulary dataset. It is not intended to reproduce any specific commercial textbook, word list, example sentences, translations, ordering, or classification.

## Future Improvements

* Continue reducing `app.js` responsibilities into small controller modules
* Improve non-blocking error messages with an in-page status area
* Add more detailed learning history
* Improve progress visualization
* Expand UI tests for mobile layout-sensitive behavior

## Author

Anonymous
