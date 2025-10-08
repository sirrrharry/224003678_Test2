# ShopEZ (Expo)

This is a React Native (Expo) sample app that demonstrates:
- Firebase Email/Password authentication
- Product listing from the Fake Store API
- Product detail screen
- (Planned) Cart stored per-user in Firebase Realtime Database

Prerequisites:
- Node.js 18+ recommended
- Expo CLI

Install:

```
npm install
```

Run:

```
npm start
```

Firebase:
- Create a Firebase project and enable Email/Password sign-in and Realtime Database.
- Replace the config in `firebase.js` with your project's config.

Notes:
- This commit implements Section B (auth) and Section C (product listing/navigation) basics. Cart and database syncing will follow next.
