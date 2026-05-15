import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView as RNSafeViewArea} from "react-native-safe-area-context";
import {styled} from "nativewind"

const SafeAreaView = styled(RNSafeViewArea);

const subscriptions = () => {
  return (
  <SafeAreaView className="flex-1 bg-background p-5">
      <Text>subscriptions</Text>
    </SafeAreaView>
  )
}

export default subscriptions