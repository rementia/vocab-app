# AGENTS.md

## Purpose

This file defines project-specific instructions for Codex when working on this repository.

This project is a personal English vocabulary web app used for:
- Personal vocabulary learning
- Web development practice
- Portfolio presentation for interviews

Codex should help improve the app while preserving existing behavior and helping the owner understand the code.

---

## Project summary

This is a static frontend web app.

Primary technologies:
- HTML
- CSS
- JavaScript
- Firebase Authentication
- Cloud Firestore
- GitHub Pages

The app should remain compatible with static hosting on GitHub Pages.

Do not introduce a traditional backend server, build system, framework, or package manager unless explicitly requested.

---

## Core development policy

Prioritize the following:

1. Preserve existing behavior
2. Make small, focused, incremental changes
3. Prefer readability and maintainability over cleverness
4. Avoid broad rewrites unless explicitly requested
5. Explain important design and behavior changes
6. Keep the app compatible with GitHub Pages
7. Avoid weakening security, privacy, or data separation assumptions

Before making large or structural changes, explain:
- What will change
- Why the change is necessary
- What behavior may be affected
- What manual tests should be performed

---

## Do not do these unless explicitly requested

Do not:
- Remove existing features
- Rename major functions or variables only for style reasons
- Perform broad refactoring
- Introduce React, Vue, TypeScript, Vite, Webpack, npm, Node.js, or a backend server
- Change the app architecture
- Change Firebase project assumptions
- Change Firestore data paths without explaining migration impact
- Weaken authentication or authorization assumptions
- Expose private or sensitive data
- Add unnecessary dependencies
- Break GitHub Pages compatibility

---

## Important existing features to preserve

Do not remove or break these unless explicitly requested:

- Level-based vocabulary display, such as vol.1, vol.2, vol.3, vol.4
- Current word display
- Progress display
- Favorite toggle using star UI
- Favorites list
- Random mode
- Pronunciation button
- Auto pronunciation behavior
- Recall learning mode
- Recall time or recall UI behavior, if present
- Keyboard shortcuts, if present
- Mobile layout
- Landscape phone layout
- Google login using Firebase Authentication
- Firestore-based per-user saved data
- localStorage behavior for non-login or fallback usage, if present

If a requested change may affect one of these features, explicitly mention the risk.

---

## Data and state assumptions

Be careful with application state.

When editing JavaScript, consider:
- Current selected volume
- Current word index
- Current mode
- Random mode state
- Favorite state
- Favorites list state
- Login state
- Firestore synchronization state
- localStorage fallback state
- UI rendering state
- Speech/pronunciation state
- Recall learning state

Avoid changing state variables casually.

If a state variable is removed, renamed, or repurposed, explain:
- What it represented before
- What it represents after the change
- Which functions read it
- Which functions write it
- What manual tests are needed

---

## JavaScript rules

When modifying JavaScript:

- Prefer minimal patches over rewriting entire files.
- Preserve existing function behavior unless the requested task requires a change.
- Be careful with global variables.
- Be careful with event listeners.
- Be careful with DOM references.
- Be careful with asynchronous operations.
- Be careful with Firebase imports and initialization.
- Avoid duplicate event listeners.
- Avoid creating render loops or repeated unnecessary network requests.
- Avoid causing pronunciation or auto-pronunciation to trigger unexpectedly.
- Avoid mixing state between normal mode, random mode, favorites mode, and recall mode.

When explaining JavaScript changes, include:
- Execution flow
- State changes
- Data structures
- DOM updates
- Event timing
- Asynchronous timing
- Possible side effects

---

## HTML rules

When modifying HTML:

- Preserve element IDs and classes used by JavaScript unless the corresponding JavaScript is updated safely.
- Do not remove accessibility-relevant labels or button text without reason.
- Avoid changing structure in a way that breaks existing CSS layout.
- Avoid adding unnecessary scripts or external resources.
- Keep the file compatible with GitHub Pages.

If an element ID is changed, list all JavaScript and CSS references that must also change.

---

## CSS rules

When modifying CSS:

- Preserve the current visual intent unless the task asks for a design change.
- Be especially careful with mobile and landscape phone layouts.
- Avoid changes that make header controls overflow, wrap badly, or shift unexpectedly.
- Avoid unnecessary global resets.
- Prefer targeted fixes over broad layout rewrites.
- Be careful with viewport height, dynamic browser UI, safe areas, and orientation changes.
- Do not make one button visually heavier than others unless intended.

When fixing responsive layout issues, consider:
- Small iPhone screens
- Landscape phone screens
- Header height
- Button wrapping
- Central content stability
- Progress display position
- Favorite star placement
- Touch target size

---

## Firebase Authentication rules

When modifying authentication logic:

- Preserve Google login behavior unless explicitly requested.
- Distinguish clearly between Firebase/Google login and GitHub login.
- Do not assume GitHub login is related to app login.
- Use Firebase UID for user-specific data separation when relevant.
- Do not store unnecessary personal data.
- Do not expose private user information in the UI or repository.
- Be careful with logout behavior and post-login state restoration.

When explaining authentication changes, include:
- What is stored
- Where it is stored
- When it is read
- When it is written
- What happens when the user is logged out

---

## Firestore rules

When modifying Cloud Firestore logic:

- Be careful with collection paths.
- Be careful with document IDs.
- Be careful with per-user data separation.
- Be careful with read/write frequency.
- Do not weaken security assumptions.
- Do not move data between collections without explaining migration impact.
- Do not store copyrighted or private vocabulary content in public client-side code if the current design avoids that.
- Avoid unnecessary reads and writes.

When explaining Firestore changes, include:
- Collection path
- Document path
- Read timing
- Write timing
- Data shape
- Possible quota impact
- Behavior when offline or unauthenticated, if relevant

---

## localStorage rules

When modifying localStorage logic:

- Preserve fallback behavior unless explicitly requested.
- Do not mix unrelated app contexts.
- Avoid overwriting user data unexpectedly.
- Be careful with saved volume, saved mode, favorites, progress, and recall settings.
- Explain how localStorage and Firestore interact if both are used.

When changing storage keys, explain:
- Old key
- New key
- Migration behavior
- What happens to existing users

---

## Vocabulary data rules

The app may use vocabulary data from a protected or indirect source.

When modifying vocabulary loading logic:
- Do not expose protected source URLs unnecessarily.
- Do not hard-code private vocabulary data into public files unless explicitly requested.
- Preserve volume mapping behavior.
- Preserve data shape expected by the UI.
- Be careful with CSV/JSON parsing.
- Be careful with missing fields.
- Handle loading errors clearly.

If adding caching, explain:
- What is cached
- How long it is cached
- When it is refreshed
- What happens when data is missing or invalid

---

## GitHub Pages rules

This app is deployed on GitHub Pages.

When changing files:
- Keep relative paths working.
- Avoid server-only features.
- Avoid code requiring environment variables at runtime.
- Avoid code requiring a backend build step.
- Avoid assuming clean URLs or server routing.
- Be careful with image paths in README and HTML.

Manual testing should include opening the deployed GitHub Pages version when relevant.

---

## Security and privacy rules

Do not include secrets in code or documentation.

Do not write:
- Private API keys
- Secret tokens
- Private Google Apps Script URLs
- Private Firebase configuration beyond what is already intentionally public
- Personal email addresses
- Firebase UID allowlists
- Private Firestore paths that should not be documented publicly
- Copyright-sensitive vocabulary content

If a secret or sensitive value appears in the repository, recommend rotating or removing it instead of reusing it.

For privacy-related documentation, avoid overclaiming.
Use careful wording such as:
- This app uses Firebase Authentication for Google sign-in.
- Firestore may store per-user app data such as favorites and timestamps.
- localStorage may store non-login local app state.
- The app does not intentionally use this data for advertising or unrelated analytics, if true.

---

## Copyright and portfolio caution

This project may involve vocabulary lists or translations with copyright or database-right concerns.

When editing README, documentation, data loading, or demo-related logic:
- Avoid implying that copyrighted vocabulary content is freely redistributable.
- Avoid publishing protected word lists, translations, order, or classifications unless the owner explicitly confirms they are safe to publish.
- Prefer describing the app structure and functionality rather than exposing protected content.
- For portfolio presentation, emphasize implementation, UI, authentication, storage design, and learning features.

Do not give legal conclusions as certainty. If legal risk is discussed, separate:
- Confirmed facts
- General legal concepts
- Practical risk-reduction advice
- Uncertain points

---

## Documentation rules

When editing README or other documentation:

- Keep the explanation clear for recruiters and interviewers.
- Explain what the app does.
- Explain the technologies used.
- Explain the main features.
- Avoid overclaiming production readiness.
- Avoid overclaiming security.
- Distinguish Firebase/Google login from GitHub login if relevant.
- Mention GitHub Pages deployment only if accurate.
- Keep screenshots and image paths valid.

Good README focus:
- Overview
- Features
- Technologies
- Usage
- Keyboard shortcuts, if present
- Privacy notice, if appropriate
- Security note, if appropriate
- Development notes

---

## Code review response format

When reviewing code, use this structure:

1. Conclusion
2. Problem
3. Cause
4. Fix
5. Side effects
6. Manual test checklist

For bugs, explain:
- Cause
- Trigger condition
- What happens internally
- How to fix it
- How to verify the fix

For comparisons, prefer tables.

For uncertain issues, separate:
- Confirmed facts
- Assumptions
- General advice

---

## Change summary format

After making changes, summarize:

- Files changed
- Main changes
- Behavior preserved
- Possible side effects
- Manual test checklist

Manual test checklist should be specific to the change.

Example checklist:
- Load the app on desktop
- Load the app on mobile portrait
- Load the app on mobile landscape
- Switch between vol.1 to vol.4
- Toggle Random mode
- Toggle Favorites
- Open Favorites list
- Use pronunciation button
- Check auto-pronunciation behavior
- Use recall learning mode
- Log in with Google
- Log out
- Confirm Firestore data is separated by user
- Confirm localStorage fallback still works, if relevant

---

## Preferred explanation style

The owner prefers explanations that are:
- In Japanese when explaining concepts
- Structured
- Precise
- Not overly vague
- Focused on why something works
- Focused on internal behavior
- Helpful for learning and interviews

Use this order when explaining:
1. Conclusion
2. Reason
3. Concrete example

When using technical terms, explain the full name and meaning when useful.

Examples:
- DOM = Document Object Model
- UID = User Identifier
- API = Application Programming Interface
- SDK = Software Development Kit
- PWA = Progressive Web App

---

## Final instruction

When in doubt, choose the safer, smaller change.

Preserve the app.
Explain the reasoning.
Help the owner understand the code deeply.
