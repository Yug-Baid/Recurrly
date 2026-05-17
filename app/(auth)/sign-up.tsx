import { useAuth, useSignUp } from '@clerk/expo'
import { type Href, Link, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
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

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const isSubmitting = fetchStatus === 'fetching'

  // ─── Initial sign-up submission ────────────────────────────────
  const handleSignUp = useCallback(async () => {
    // Split full name into first/last
    const nameParts = fullName.trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const { error } = await signUp.password({
      emailAddress,
      password,
      firstName,
      lastName,
    })

    if (error) return

    // Trigger email verification
    if (!error) {
      await signUp.verifications.sendEmailCode()
    }
  }, [signUp, fullName, emailAddress, password])

  // ─── Email verification handler ────────────────────────────────
  const handleVerify = useCallback(async () => {
    await signUp.verifications.verifyEmailCode({ code: verificationCode })

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return
          const url = decorateUrl('/')
          router.replace(url as Href)
        },
      })
    }
  }, [signUp, verificationCode, router])

  // Already signed in — don't render
  if (signUp.status === 'complete' || isSignedIn) {
    return null
  }

  // ═══════════════════════════════════════════════════════════════
  // Email verification screen
  // ═══════════════════════════════════════════════════════════════
  const needsVerification =
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields?.includes('email_address') &&
    signUp.missingFields?.length === 0

  if (needsVerification) {
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
                  Verify your email
                </Text>
                <Text className="auth-subtitle" style={{ alignSelf: 'center', marginBottom: 8 }}>
                  We sent a 6-digit code to{' '}
                  <Text style={{ fontFamily: 'sans-bold' }}>{emailAddress}</Text>. Enter it below to
                  activate your account.
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
                      <Text className="auth-button-text">Verify & Continue</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signUp.verifications.sendEmailCode()}
                    disabled={isSubmitting}
                  >
                    <Text className="auth-secondary-button-text">Resend code</Text>
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
  // Primary sign-up form
  // ═══════════════════════════════════════════════════════════════
  const canSubmit =
    fullName.trim().length > 0 &&
    emailAddress.trim().length > 0 &&
    password.length >= 8 &&
    !isSubmitting

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

              <Text className="auth-title">Create your account</Text>
              <Text className="auth-subtitle">
                Join Recurrly to track every subscription in one place and never miss a renewal.
              </Text>
            </View>

            {/* ── Form card ── */}
            <View className="auth-card">
              <View className="auth-form">
                {/* Full name */}
                <View className="auth-field">
                  <Text className="auth-label">Full name</Text>
                  <TextInput
                    className={clsx(
                      'auth-input',
                      (errors?.fields?.firstName || errors?.fields?.lastName) &&
                        'auth-input-error',
                    )}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="John Doe"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    autoCapitalize="words"
                    textContentType="name"
                    returnKeyType="next"
                  />
                  {errors?.fields?.firstName && (
                    <Text className="auth-error">{errors.fields.firstName.message}</Text>
                  )}
                  {errors?.fields?.lastName && (
                    <Text className="auth-error">{errors.fields.lastName.message}</Text>
                  )}
                </View>

                {/* Email */}
                <View className="auth-field">
                  <Text className="auth-label">Email address</Text>
                  <TextInput
                    className={clsx(
                      'auth-input',
                      errors?.fields?.emailAddress && 'auth-input-error',
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
                  {errors?.fields?.emailAddress && (
                    <Text className="auth-error">{errors.fields.emailAddress.message}</Text>
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
                      placeholder="Min. 8 characters"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      secureTextEntry={!showPassword}
                      textContentType="newPassword"
                      returnKeyType="done"
                      onSubmitEditing={canSubmit ? handleSignUp : undefined}
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
                  {!errors?.fields?.password && password.length > 0 && password.length < 8 && (
                    <Text className="auth-helper">Must be at least 8 characters</Text>
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
                  onPress={handleSignUp}
                  disabled={!canSubmit}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="auth-button-text">Create Account</Text>
                  )}
                </Pressable>
              </View>
            </View>

            {/* ── Footer link ── */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable hitSlop={8}>
                  <Text className="auth-link">Sign in</Text>
                </Pressable>
              </Link>
            </View>

            {/* Required for Clerk bot protection */}
            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}