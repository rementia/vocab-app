# Manual Test Checklist

This checklist is used to confirm that the public portfolio version still works after changes.

## 1. Startup

* [ ] The app opens on GitHub Pages
* [ ] The app opens in the local environment
* [ ] No critical JavaScript error appears in the console
* [ ] Vocabulary data is displayed
* [ ] The first word is displayed correctly
* [ ] The meaning is displayed correctly
* [ ] Main buttons and controls are visible

## 2. Google Sheets CSV Loading

* [ ] The sample vocabulary CSV is loaded
* [ ] `word` values are displayed correctly
* [ ] `meaning` values are displayed correctly
* [ ] `level` values are mapped to vol.1-vol.4
* [ ] The app does not stop completely if CSV loading fails
* [ ] The public demo does not include private study vocabulary data

## 3. Volume Switching

* [ ] vol.1 can be selected
* [ ] vol.2 can be selected
* [ ] vol.3 can be selected
* [ ] vol.4 can be selected
* [ ] Words are displayed after switching volume
* [ ] The current index does not become invalid after switching volume
* [ ] The last selected volume is restored after reload

## 4. Word Navigation

* [ ] The next word button works
* [ ] The previous word button works
* [ ] Navigation does not break at the first word
* [ ] Navigation does not break at the last word
* [ ] The current word position is saved
* [ ] The current word position is restored after reload

## 5. Mode Switching

* [ ] Normal volume mode works
* [ ] Random mode works
* [ ] Favorites mode works
* [ ] Difficults mode works
* [ ] Mode switching does not break word display
* [ ] Button states match the current mode
* [ ] The last selected mode is restored after reload

## Multiple Choice Mode

* [ ] 四択問題モードに切り替えられる
* [ ] UI上の表示が「四択問題」になっている
* [ ] 英→日で、問題文が英単語、選択肢が日本語訳になる
* [ ] 日→英で、問題文が日本語訳、選択肢が英単語になる
* [ ] 正解時に正解色・正解スタイルが表示される
* [ ] 正解時に「正解」テキストが表示されない
* [ ] 不正解時に不正解色と正解色が表示される
* [ ] 回答後、不正解選択肢を再タップすると訳語に切り替わる
* [ ] もう一度タップすると元の表示に戻る
* [ ] 回答後に不正解選択肢を何度タップしても correct / wrong が再加算されない
* [ ] 次の問題に進むと表示切替状態がリセットされる
* [ ] `portfolio_tango_review_scores` に正誤履歴が保存される
* [ ] reload 後も正誤履歴が復元される
* [ ] frequency mode で不正解の多い単語が出やすくなる

## 6. Favorites

* [ ] A word can be added to favorites
* [ ] A word can be removed from favorites
* [ ] Favorite state is reflected in the UI
* [ ] Favorites mode displays favorite words
* [ ] Removing a favorite in favorites mode does not break the display
* [ ] When logged in, favorites are saved to Firestore `portfolioUsers/{uid}`

## 7. Difficult Words

* [ ] A word can be added to difficult words
* [ ] A word can be removed from difficult words
* [ ] Difficult state is reflected in the UI
* [ ] Difficults mode displays difficult words
* [ ] Removing a difficult word in difficults mode does not break the display
* [ ] When logged in, difficult words are saved to Firestore `portfolioUsers/{uid}`

## 8. localStorage

* [ ] `portfolio_tango_current_vol` is saved
* [ ] `portfolio_tango_current_mode` is saved
* [ ] `portfolio_tango_index_by_vol` is saved
* [ ] `portfolio_tango_sidebar_open` is saved
* [ ] `portfolio_tango_speech_sync` is saved
* [ ] `portfolio_tango_review_scores` is saved
* [ ] `portfolio_tango_multiple_choice_mode` is saved
* [ ] Volume is restored after reload
* [ ] Mode is restored after reload
* [ ] Word position is restored after reload
* [ ] UI state is restored after reload
* [ ] Review scores are restored after reload
* [ ] Multiple choice mode setting is restored after reload

## 9. Pronunciation

* [ ] The pronunciation button works
* [ ] Auto-pronunciation works when enabled
* [ ] Auto-pronunciation does not run when disabled
* [ ] Moving to another word updates pronunciation state correctly
* [ ] The app does not stop completely if pronunciation loading fails
* [ ] On iOS Safari, the first pronunciation may require tapping the pronunciation button or the screen
* [ ] If pronunciation is blocked because of browser restrictions, the audio enable prompt is shown
* [ ] After one tap or the audio enable button, pronunciation sync works on word navigation
* [ ] Pronunciation sync disabled does not play audio on swipe
* [ ] Browser autoplay restrictions may still require one tap before pronunciation starts

## 10. UI

* [ ] Sidebar opens
* [ ] Sidebar closes
* [ ] Sidebar state is saved
* [ ] Buttons are easy to click
* [ ] Button visual states match the current app state
* [ ] Layout does not break badly when the window size changes

## 11. Mobile Layout

* [ ] The app is usable on a smartphone-width screen
* [ ] The app is usable in landscape orientation
* [ ] Text is readable
* [ ] Buttons are large enough to tap
* [ ] Sidebar can be operated
* [ ] No important content overflows outside the screen
* [ ] Swipe left/right on the word card to move between words
* [ ] Short horizontal swipes return the card to the center without changing words
* [ ] Vertical scrolling is not blocked by card swipe handling
* [ ] Pronunciation sync still follows the existing browser audio policy after word changes

## 12. Google Login

* [ ] Google login works
* [ ] Logout works
* [ ] The app can still be used without login
* [ ] After login, user-specific data is loaded
* [ ] Different users' data does not mix
* [ ] Logout does not leave the UI in a broken state

## 13. GitHub Pages

* [ ] After `git push`, GitHub Pages is updated
* [ ] The public URL opens correctly
* [ ] CSV loading works on GitHub Pages
* [ ] Firebase Authentication works on GitHub Pages
* [ ] Firestore saving works on GitHub Pages
* [ ] localStorage restoration works on GitHub Pages
* [ ] No critical console errors appear on the deployed page

## 14. Final Check Before Commit

* [ ] `git status` shows only intended changes
* [ ] Changed files were reviewed
* [ ] The app was tested locally
* [ ] The app was tested after GitHub Pages deployment
* [ ] README or docs were updated if the behavior changed
