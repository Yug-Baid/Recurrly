import { Image, Text, View } from "react-native";
import "../../global.css";
import { Link } from "expo-router";
import { SafeAreaView as RNSafeViewArea} from "react-native-safe-area-context";
import {styled} from "nativewind"
import images from "@/constants/images";
import { HOME_USER } from "@/constants/data";

const SafeAreaView = styled(RNSafeViewArea);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="home-header ">
          <View className="home-user">
            <Image source={images.avatar} className="home-avatar"></Image>
            <Text className="home-user-name">{HOME_USER.name}</Text>
          </View>
      </View>
  
    </SafeAreaView>
  );
}