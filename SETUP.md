# ALERTO MNL Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

## Installation Steps

1. Clone the repository:
```bash
git clone [repository-url]
cd ALERTO_MNL_WEB-APP
```

2. Install dependencies:
```bash
npm install
```
or
```bash
yarn install
```

3. Verify Expo SDK version:
```bash
expo --version
```
Should match: 53.0.11

4. Start the development server:
```bash
npm start
```
or
```bash
yarn start
```

## Troubleshooting

If you encounter any issues:

1. Clear the cache:
```bash
expo start -c
```

2. Delete node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

3. Check for version mismatches:
```bash
npm ls expo-location
```
Should show: expo-location@18.1.5

## Common Issues

### Location Services Not Working
If you encounter location-related errors:
1. Make sure you have the correct permissions set up
2. Verify that expo-location is properly installed
3. Check that your device/emulator has location services enabled

### Map Display Issues
If maps are not displaying correctly:
1. Verify your Mapbox token is properly configured
2. Check your internet connection
3. Ensure you're using the correct version of react-native-maps 