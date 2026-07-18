# Client build notes for AI - Tamago

Build 3 screens in a single-page flow (React or plain HTML/JS, your call):

## 1. Queue screen
- "Finding your frequency..." loading state
- Fake delay ~3-5s (setTimeout), then auto-advance to screen 2
- No real queue logic needed

## 2. Match reveal screen
- Fetch GET http://localhost:3001/api/match on load
- Show: compatibility_pct as a big number, shared_interests list, blind_spot_a / blind_spot_b in two side-by-side cards
- "Start chatting" button advances to screen 3

## 3. Chat screen
- Connect to Socket.io server at http://localhost:3001
- Simple message bubble UI, text input + send button
- Emit "chat-message" on send, listen for "chat-message" to render incoming messages
- Report/skip button: visual only, no click handler needed (or just console.log)

## Design notes
- Keep it flat, minimal, dark-mode friendly if time allows - not a priority
- No mobile layout needed
- No routing library needed - just conditional render based on a `screen` state variable ('queue' | 'reveal' | 'chat')
