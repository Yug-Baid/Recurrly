import "@/global.css"
import { FlatList, Image, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { icons } from "@/constants/icons";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useState, useMemo } from "react";
import { useSubscriptions } from "@/context/SubscriptionContext";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const { subscriptions } = useSubscriptions();

    const filteredSubscriptions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return subscriptions;

        return subscriptions.filter((sub) => {
            return (
                sub.name.toLowerCase().includes(query) ||
                (sub.category?.toLowerCase().includes(query)) ||
                (sub.plan?.toLowerCase().includes(query)) ||
                (sub.billing?.toLowerCase().includes(query)) ||
                (sub.status?.toLowerCase().includes(query))
            );
        });
    }, [searchQuery, subscriptions]);

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <FlatList
                ListHeaderComponent={
                    <>
                        <View className="subs-header">
                            <Text className="subs-page-title">Subscriptions</Text>
                            <Text className="subs-page-subtitle">
                                {subscriptions.length} total · {subscriptions.filter(s => s.status === 'active').length} active
                            </Text>
                        </View>

                        <View className="subs-search-wrap">
                            <Image source={icons.menu} className="subs-search-icon" />
                            <TextInput
                                className="subs-search-input"
                                placeholder="Search subscriptions..."
                                placeholderTextColor="rgba(0,0,0,0.35)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCapitalize="none"
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                            />
                        </View>

                        {searchQuery.trim().length > 0 && (
                            <Text className="subs-result-count">
                                {filteredSubscriptions.length} result{filteredSubscriptions.length !== 1 ? 's' : ''} found
                            </Text>
                        )}
                    </>
                }
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() =>
                            setExpandedSubscriptionId((currentId) =>
                                currentId === item.id ? null : item.id
                            )
                        }
                    />
                )}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={() => <View className="h-4" />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="subs-empty">
                        <Text className="subs-empty-title">No matches</Text>
                        <Text className="subs-empty-subtitle">
                            Try a different search term
                        </Text>
                    </View>
                }
                contentContainerClassName="pb-30"
                keyboardShouldPersistTaps="handled"
            />
        </SafeAreaView>
    );
};

export default Subscriptions;