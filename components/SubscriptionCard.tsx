import {View, Text, Image, Pressable} from 'react-native'
import React from 'react'
import {formatCurrency, formatStatusLabel, formatSubscriptionDateTime} from "@/lib/utils";
import clsx from "clsx";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";

const ICON_LIBRARIES = {
    MaterialCommunityIcons,
    Ionicons,
    FontAwesome5,
} as const;

const SubscriptionIcon = ({ icon, vectorIcon }: { icon?: SubscriptionCardProps["icon"]; vectorIcon?: SubscriptionCardProps["vectorIcon"] }) => {
    if (vectorIcon) {
        const IconComponent = ICON_LIBRARIES[vectorIcon.library];
        return (
            <View className="sub-icon items-center justify-center rounded-2xl bg-muted">
                {/* @ts-ignore – dynamic icon component */}
                <IconComponent name={vectorIcon.name} size={30} color={vectorIcon.color ?? "#081126"} />
            </View>
        );
    }

    if (icon) {
        return <Image source={icon} className="sub-icon" />;
    }

    // Fallback: generic icon
    return (
        <View className="sub-icon items-center justify-center rounded-2xl bg-muted">
            <MaterialCommunityIcons name="package-variant" size={30} color="#081126" />
        </View>
    );
};

const SubscriptionCard = ({ name, price, currency, icon, vectorIcon, billing, color, category, plan, renewalDate, expanded, onPress, paymentMethod, startDate, status}: SubscriptionCardProps) => {
    return (
        <Pressable onPress={onPress} className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')} style={!expanded && color ? { backgroundColor: color } : undefined}>
            <View className="sub-head">
                <View className="sub-main">
                    <SubscriptionIcon icon={icon} vectorIcon={vectorIcon} />
                    <View className="sub-copy">
                        <Text numberOfLines={1} className="sub-title">
                            {name}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
                            {category?.trim() || plan?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : '')}
                        </Text>
                    </View>
                </View>

                <View className="sub-price-box">
                    <Text className="sub-price">{formatCurrency(price, currency)}</Text>
                    <Text className="sub-billing">{billing}</Text>
                </View>
            </View>

            {expanded && (
                <View className="sub-bdy">
                    <View className="sub-details">
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Payment:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{paymentMethod?.trim() ?? 'Not provided'}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Category:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{(category?.trim() || plan?.trim()) ?? 'Not provided'}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Started:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{startDate ? formatSubscriptionDateTime(startDate) : 'Not provided'}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Renewal date:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{renewalDate ? formatSubscriptionDateTime(renewalDate) : 'Not provided'}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Status:</Text>
                                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">{status ? formatStatusLabel(status) : 'Not provided'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </Pressable>
    )
}
export default SubscriptionCard