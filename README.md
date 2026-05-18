# English Vocabulary App

A web-based vocabulary learning app focused on recall-based learning and efficient review.

This app was created as a portfolio project to support English vocabulary learning through repeated recall, pronunciation practice, random review, and favorite word management.

## Screenshots

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

Vocabulary data is loaded from a Google Sheets CSV export URL. Only demonstration data is included in this public version, and the dataset is intentionally kept small to avoid reproducing any specific commercial textbook or word list.

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
