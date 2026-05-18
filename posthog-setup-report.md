<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurrly subscription tracker app. The SDK was already partially installed (`posthog-react-native` and `PostHogProvider` were present), so the wizard built on that foundation by:

- Installing missing peer dependencies (`expo-application`, `expo-device`, `expo-localization`)
- Creating a centralized PostHog config at `src/config/posthog.ts` using existing `EXPO_PUBLIC_` environment variables
- Upgrading `app/_layout.tsx` to use a shared `posthog` client instance with `PostHogProvider` and adding **automatic screen tracking** for every route change via Expo Router
- Adding **user identification** (`posthog.identify`) on successful sign-in and sign-up via Clerk, linking analytics events to individual users
- Adding **`posthog.reset()`** on sign-out to clear the anonymous session
- Adding event capture across 5 key user interactions (see table below)

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signs in to the app | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User creates a new account and verifies their email | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signs out of the app | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User expands a subscription card on the home screen to view details | `app/(tabs)/index.tsx` |
| `subscription_viewed` | User navigates to a subscription detail screen | `app/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1595770)
- [New sign-ups over time](/insights/whKdzUga)
- [Daily sign-ins](/insights/FejOGflC)
- [Sign-up to sign-in conversion funnel](/insights/LCinXsgC)
- [Subscription card engagements](/insights/LMzZbk2c)
- [User churn (sign-outs)](/insights/c2usg7vZ)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
