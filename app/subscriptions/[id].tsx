import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Link, useLocalSearchParams } from 'expo-router'
import { usePostHog } from 'posthog-react-native'

const SubscriptionDetails = () => {
    const {id} = useLocalSearchParams<{id : string}>()
    const posthog = usePostHog()

    useEffect(() => {
        if (id) {
            posthog.capture('subscription_viewed', { subscription_id: id })
        }
    }, [id, posthog])

  return (
    <View>
      <Text>SubscriptionDetails : {id}</Text>
      <Link href="/"></Link>
    </View>
  )
}

export default SubscriptionDetails
