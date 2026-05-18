import { useSignIn } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { usePostHog } from 'posthog-react-native'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { styled } from 'nativewind'
import clsx from 'clsx'

const SafeAreaView = styled(RNSafeAreaView)

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()
  const posthog = usePostHog()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // MFA / client-trust verification state
  const [verificationCode, setVerificationCode] = useState('')

  const isSubmitting = fetchStatus === 'fetching'
  const canSubmit = emailAddress.trim().length > 0 && password.length > 0 && !isSubmitting

  // ─── Primary sign-in handler ───────────────────────────────────
  const handleSignIn = useCallback(async () => {
    const { error } = await signIn.password({ emailAddress, password })
    if (error) return

    if (signIn.status === 'complete') {
      posthog.identify(emailAddress, { $set: { email: emailAddress } })
      posthog.capture('user_signed_in', { method: 'password' })
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return
          const url = decorateUrl('/')
          router.replace(url as Href)
        },
      })
    } else if (signIn.status === 'needs_second_factor') {
      // App uses email-code MFA by default if enabled
    } else if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (f) => f.strategy === 'email_code',
      )
      if (emailCodeFactor) await signIn.mfa.sendEmailCode()
    }
  }, [signIn, emailAddress, password, router, posthog])

  // ─── MFA verification handler ──────────────────────────────────
  const handleVerify = useCallback(async () => {
    await signIn.mfa.verifyEmailCode({ code: verificationCode })

    if (signIn.status === 'complete') {
      posthog.identify(emailAddress, { $set: { email: emailAddress } })
      posthog.capture('user_signed_in', { method: 'mfa' })
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return
          const url = decorateUrl('/')
          router.replace(url as Href)
        },
      })
    }
  }, [signIn, verificationCode, router, posthog, emailAddress])

  // ═══════════════════════════════════════════════════════════════
  // MFA / Client-Trust verification screen
  // ═══════════════════════════════════════════════════════════════
  if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="auth-screen"
        >
          <ScrollView
            className="auth-scroll"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-content">
              {/* ── Brand block ── */}
              <View className="auth-brand-block">
                <View className="auth-logo-wrap">
                  <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">R</Text>
                  </View>
                  <View>
                    <Text className="auth-wordmark">Recurrly</Text>
                    <Text className="auth-wordmark-sub">Subscription Tracker</Text>
                  </View>
                </View>
              </View>

              {/* ── Verification card ── */}
              <View className="auth-card">
                <Text className="auth-title" style={{ textAlign: 'center' }}>
                  Verify your identity
                </Text>
                <Text className="auth-subtitle" style={{ alignSelf: 'center', marginBottom: 8 }}>
                  We sent a verification code to your email. Enter it below to continue.
                </Text>

                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={clsx(
                        'auth-input',
                        errors?.fields?.code && 'auth-input-error',
                      )}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      autoFocus
                    />
                    {errors?.fields?.code && (
                      <Text className="auth-error">{errors.fields.code.message}</Text>
                    )}
                  </View>

                  <Pressable
                    className={clsx(
                      'auth-button',
                      (!verificationCode || isSubmitting) && 'auth-button-disabled',
                    )}
                    onPress={handleVerify}
                    disabled={!verificationCode || isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#081126" size="small" />
                    ) : (
                      <Text className="auth-button-text">Verify</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signIn.mfa.sendEmailCode()}
                    disabled={isSubmitting}
                  >
                    <Text className="auth-secondary-button-text">Resend code</Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signIn.reset()}
                  >
                    <Text className="auth-secondary-button-text">Start over</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  // ═══════════════════════════════════════════════════════════════
  // Primary sign-in screen
  // ═══════════════════════════════════════════════════════════════
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            {/* ── Brand block ── */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurrly</Text>
                  <Text className="auth-wordmark-sub">Subscription Tracker</Text>
                </View>
              </View>

              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to manage your subscriptions and stay on top of your spending.
              </Text>
            </View>

            {/* ── Form card ── */}
            <View className="auth-card">
              <View className="auth-form">
                {/* Email */}
                <View className="auth-field">
                  <Text className="auth-label">Email address</Text>
                  <TextInput
                    className={clsx(
                      'auth-input',
                      errors?.fields?.identifier && 'auth-input-error',
                    )}
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    returnKeyType="next"
                  />
                  {errors?.fields?.identifier && (
                    <Text className="auth-error">{errors.fields.identifier.message}</Text>
                  )}
                </View>

                {/* Password */}
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      className={clsx(
                        'auth-input',
                        errors?.fields?.password && 'auth-input-error',
                      )}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      secureTextEntry={!showPassword}
                      textContentType="password"
                      returnKeyType="done"
                      onSubmitEditing={canSubmit ? handleSignIn : undefined}
                      style={{ paddingRight: 52 }}
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                      }}
                      hitSlop={8}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: 'sans-semibold',
                          color: 'rgba(0,0,0,0.45)',
                        }}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </Pressable>
                  </View>
                  {errors?.fields?.password && (
                    <Text className="auth-error">{errors.fields.password.message}</Text>
                  )}
                </View>

                {/* Global / non-field errors */}
                {errors?.global && errors.global.length > 0 && (
                  <View className="rounded-xl bg-destructive/10 px-4 py-3">
                    {errors.global.map((e, i) => (
                      <Text key={i} className="auth-error">
                        {e.message}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Submit */}
                <Pressable
                  className={clsx('auth-button', !canSubmit && 'auth-button-disabled')}
                  onPress={handleSignIn}
                  disabled={!canSubmit}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="auth-button-text">Sign In</Text>
                  )}
                </Pressable>
              </View>
            </View>

            {/* ── Footer link ── */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Don&apos;t have an account?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable hitSlop={8}>
                  <Text className="auth-link">Create one</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}