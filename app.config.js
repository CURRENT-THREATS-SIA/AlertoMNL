module.exports = {
  expo: {
    name: "ALERTO MNL",
    slug: "alerto-mnl",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.alertomnl.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.alertomnl.app"
    },
    web: {
      favicon: "./assets/favicon.png",
      headers: {
        "Content-Security-Policy": [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.mapbox.com",
          "style-src 'self' 'unsafe-inline' https://*.mapbox.com",
          "img-src 'self' data: blob: https://*.mapbox.com",
          "connect-src 'self' https://*.mapbox.com https://api.mapbox.com",
          "worker-src 'self' blob:",
          "child-src 'self' blob:",
          "frame-src 'self'",
          "object-src 'none'",
          "base-uri 'none'"
        ].join("; ")
      }
    },
    plugins: [
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsImpl: "mapbox",
          RNMapboxMapsDownloadToken: process.env.MAPBOX_TOKEN
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
}; 