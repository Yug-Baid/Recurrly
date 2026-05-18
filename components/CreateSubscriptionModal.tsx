import {
    View,
    Text,
    Modal,
    Pressable,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useState } from "react";
import clsx from "clsx";
import dayjs from "dayjs";

import { posthog } from "@/src/config/posthog";

const FREQUENCIES = ["Monthly", "Yearly"] as const;
type Frequency = (typeof FREQUENCIES)[number];

const CATEGORIES = [
    "Entertainment",
    "AI Tools",
    "Developer Tools",
    "Design",
    "Productivity",
    "Cloud",
    "Music",
    "Other",
] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
    Entertainment: "#f5c542",
    "AI Tools": "#b8d4e3",
    "Developer Tools": "#e8def8",
    Design: "#b8e8d0",
    Productivity: "#f0c8a8",
    Cloud: "#a8d8f0",
    Music: "#f0a8c8",
    Other: "#d4d4d4",
};

const CATEGORY_ICONS: Record<Category, SubscriptionVectorIcon> = {
    Entertainment: { name: "movie-open-outline", library: "MaterialCommunityIcons", color: "#b8860b" },
    "AI Tools": { name: "robot-outline", library: "MaterialCommunityIcons", color: "#3b6d8c" },
    "Developer Tools": { name: "code-braces", library: "MaterialCommunityIcons", color: "#6b4fa0" },
    Design: { name: "palette-outline", library: "MaterialCommunityIcons", color: "#2d8a56" },
    Productivity: { name: "clipboard-check-outline", library: "MaterialCommunityIcons", color: "#a0623b" },
    Cloud: { name: "cloud-outline", library: "MaterialCommunityIcons", color: "#3b7da0" },
    Music: { name: "music-note", library: "MaterialCommunityIcons", color: "#a03b6b" },
    Other: { name: "package-variant", library: "MaterialCommunityIcons", color: "#555555" },
};

interface CreateSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (subscription: Subscription) => void;
}

const CreateSubscriptionModal = ({
    visible,
    onClose,
    onCreate,
}: CreateSubscriptionModalProps) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("Monthly");
    const [category, setCategory] = useState<Category | null>(null);

    const [nameError, setNameError] = useState("");
    const [priceError, setPriceError] = useState("");

    const isValid = name.trim().length > 0 && parseFloat(price) > 0;

    const resetForm = () => {
        setName("");
        setPrice("");
        setFrequency("Monthly");
        setCategory(null);
        setNameError("");
        setPriceError("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = () => {
        let hasError = false;

        if (!name.trim()) {
            setNameError("Name is required");
            hasError = true;
        } else {
            setNameError("");
        }

        const parsedPrice = parseFloat(price);
        if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
            setPriceError("Enter a valid price");
            hasError = true;
        } else {
            setPriceError("");
        }

        if (hasError) return;

        const now = dayjs();
        const renewalDate =
            frequency === "Monthly"
                ? now.add(1, "month")
                : now.add(1, "year");

        const selectedCategory = category ?? "Other";

        const subscription: Subscription = {
            id: `sub-${Date.now()}`,
            name: name.trim(),
            price: parsedPrice,
            currency: "USD",
            vectorIcon: CATEGORY_ICONS[selectedCategory],
            billing: frequency,
            category: selectedCategory,
            plan: `${selectedCategory} Plan`,
            status: "active",
            startDate: now.toISOString(),
            renewalDate: renewalDate.toISOString(),
            color: CATEGORY_COLORS[selectedCategory],
        };

        onCreate(subscription);
        posthog.capture('subscription_created',{
            name,
            price: parsedPrice,
            frequency,
            category,
            plan: `${selectedCategory} Plan`,
        }   )
        resetForm();
        onClose();
    };



    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <Pressable className="modal-overlay" onPress={handleClose}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="modal-container"
                >
                    <Pressable>
                        {/* ── Header ──────────────────────── */}
                        <View className="modal-header">
                            <Text className="modal-title">New Subscription</Text>
                            <Pressable
                                className="modal-close"
                                onPress={handleClose}
                            >
                                <Text className="modal-close-text">✕</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            className="modal-body"
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* ── Name ────────────────────────── */}
                            <View className="auth-field">
                                <Text className="auth-label">Name</Text>
                                <TextInput
                                    className={clsx(
                                        "auth-input",
                                        nameError && "auth-input-error"
                                    )}
                                    placeholder="e.g. Netflix, Spotify…"
                                    placeholderTextColor="rgba(0,0,0,0.35)"
                                    value={name}
                                    onChangeText={(t) => {
                                        setName(t);
                                        if (t.trim()) setNameError("");
                                    }}
                                    autoCapitalize="words"
                                />
                                {nameError ? (
                                    <Text className="auth-error">
                                        {nameError}
                                    </Text>
                                ) : null}
                            </View>

                            {/* ── Price ───────────────────────── */}
                            <View className="auth-field">
                                <Text className="auth-label">
                                    Price (USD)
                                </Text>
                                <TextInput
                                    className={clsx(
                                        "auth-input",
                                        priceError && "auth-input-error"
                                    )}
                                    placeholder="0.00"
                                    placeholderTextColor="rgba(0,0,0,0.35)"
                                    value={price}
                                    onChangeText={(t) => {
                                        setPrice(t);
                                        if (
                                            !isNaN(parseFloat(t)) &&
                                            parseFloat(t) > 0
                                        )
                                            setPriceError("");
                                    }}
                                    keyboardType="decimal-pad"
                                />
                                {priceError ? (
                                    <Text className="auth-error">
                                        {priceError}
                                    </Text>
                                ) : null}
                            </View>

                            {/* ── Frequency ──────────────────── */}
                            <View className="auth-field">
                                <Text className="auth-label">Frequency</Text>
                                <View className="picker-row">
                                    {FREQUENCIES.map((f) => (
                                        <Pressable
                                            key={f}
                                            className={clsx(
                                                "picker-option",
                                                frequency === f &&
                                                    "picker-option-active"
                                            )}
                                            onPress={() => setFrequency(f)}
                                        >
                                            <Text
                                                className={clsx(
                                                    "picker-option-text",
                                                    frequency === f &&
                                                        "picker-option-text-active"
                                                )}
                                            >
                                                {f}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* ── Category ───────────────────── */}
                            <View className="auth-field">
                                <Text className="auth-label">Category</Text>
                                <View className="category-scroll">
                                    {CATEGORIES.map((c) => (
                                        <Pressable
                                            key={c}
                                            className={clsx(
                                                "category-chip",
                                                category === c &&
                                                    "category-chip-active"
                                            )}
                                            onPress={() =>
                                                setCategory((prev) =>
                                                    prev === c ? null : c
                                                )
                                            }
                                        >
                                            <Text
                                                className={clsx(
                                                    "category-chip-text",
                                                    category === c &&
                                                        "category-chip-text-active"
                                                )}
                                            >
                                                {c}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* ── Submit ──────────────────────── */}
                            <Pressable
                                className={clsx(
                                    "auth-button",
                                    !isValid && "auth-button-disabled"
                                )}
                                onPress={handleSubmit}
                                disabled={!isValid}
                            >
                                <Text className="auth-button-text">
                                    Add Subscription
                                </Text>
                            </Pressable>
                        </ScrollView>
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
};

export default CreateSubscriptionModal;
