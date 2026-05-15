import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const signIn = () => {
  return (
    <View>
      <Text>Sign In</Text>
      <Link href="/">GO Back</Link>
    </View>
  )
}

export default signIn