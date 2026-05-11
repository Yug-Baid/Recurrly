import { Text, View } from "react-native";
import "../global.css";
import { Link } from "expo-router";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to My World!
      </Text>
      <Link href="/onboarding" className="bg-black rounded-full text-white p-5 mt-5" >Go To Onboarding</Link>
       <Link href="/(auth)/sign-in" className="bg-black rounded-full text-white p-5 mt-5" >Sign In</Link>
        <Link href="/(auth)/sign-up" className="bg-black rounded-full text-white p-5 mt-5" >Sign Up</Link>
    </View>
  );
}