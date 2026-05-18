import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView as RNSafeViewArea } from "react-native-safe-area-context";
import { styled } from "nativewind"
import { useClerk, useUser } from '@clerk/expo'
import { usePostHog } from 'posthog-react-native'

const SafeAreaView = styled(RNSafeViewArea);

const Settings = () => {
  const { signOut } = useClerk()
  const { user } = useUser()
  const posthog = usePostHog()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      posthog.capture('user_signed_out')
      await posthog.flush()
      posthog.reset()
    } catch (e) {
      console.error('Sign-out error:', e)
      setSigningOut(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-2xl font-sans-bold text-primary mb-6">Settings</Text>

      {/* Account info */}
      <View className="rounded-2xl border border-border bg-card p-5 mb-4 gap-2">
        <Text className="text-sm font-sans-semibold text-muted-foreground">Signed in as</Text>
        <Text className="text-base font-sans-bold text-primary">
          {user?.emailAddresses[0]?.emailAddress || '—'}
        </Text>
      </View>

      {/* Sign out */}
      <Pressable
        className={`mt-2 items-center rounded-2xl bg-primary py-4 ${signingOut ? 'opacity-50' : ''}`}
        onPress={handleSignOut}
        disabled={signingOut}
      >
        {signingOut ? (
          <ActivityIndicator color="#fff9e3" size="small" />
        ) : (
          <Text className="text-base font-sans-bold text-background">Sign Out</Text>
        )}
      </Pressable>
    </SafeAreaView>
  )
}

export default Settings