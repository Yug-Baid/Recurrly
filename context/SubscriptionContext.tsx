import { createContext, useContext, useState, type ReactNode } from "react";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";

interface SubscriptionContextValue {
    subscriptions: Subscription[];
    addSubscription: (sub: Subscription) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);

    const addSubscription = (sub: Subscription) => {
        setSubscriptions((prev) => [sub, ...prev]);
    };

    return (
        <SubscriptionContext.Provider value={{ subscriptions, addSubscription }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscriptions = (): SubscriptionContextValue => {
    const ctx = useContext(SubscriptionContext);
    if (!ctx) throw new Error("useSubscriptions must be used within SubscriptionProvider");
    return ctx;
};
