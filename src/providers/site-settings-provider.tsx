
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { SiteSettings } from "@/types";

const defaultSettings: SiteSettings = {
    general: {
        siteName: 'صحتي',
        description: 'منصة الرعاية الصحية المتكاملة',
        logoUrl: '',
    },
    contact: {
        whatsapp: '',
        phone: '',
        email: '',
        facebookUrl: '',
        instagramUrl: '',
        location: '',
    },
    theme: {
        primaryColor: '#8b5cf6', // Indigo-500 fallback
        accentColor: '#a78bfa',
    },
    hero: {
        title: 'رعاية صحية تثق بها، بين يديك',
        subtitle: 'نوفر لك الوصول السريع والموثوق للخدمات الصحية المتنوعة.',
        imageUrl: '',
    }
};

interface SiteSettingsContextType {
    settings: SiteSettings;
    isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    settings: defaultSettings,
    isLoading: true,
});

export const useSiteSettings = () => useContext(SiteSettingsContext);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const firestore = useFirestore();

    // Helper to convert hex to hsl values (simplified)
    const updateThemeColors = (primaryHex: string) => {
        if (!primaryHex) return;

        // This is a basic implementation. Ideally, we would use a library to convert Hex to HSL
        // For now, we mainly rely on the fact that Shadcn uses HSL variables.
        // Since converting Hex to HSL properly requires math, we will inject the HEX directly 
        // into a style tag or css variable if the system supports it.
        // OR, we assume the user provides a Valid Hex and we try to set it.

        // Better approach for now: modifying the root style property
        // Note: Shadcn uses HSL values like "222.2 47.4% 11.2%" for variables.
        // Direct HEX injection into HSL variables WON'T work directly.
        // We will simple set a new variable --primary-hex and use that or try to force it.

        // Actually, let's try to update the style directly.
        document.documentElement.style.setProperty('--primary', hexToHSL(primaryHex));
        document.documentElement.style.setProperty('--ring', hexToHSL(primaryHex));
    };

    // Simple Hex to HSL converter for Tailwind/Shadcn compatibility
    // Returns string like "262 80% 67%"
    function hexToHSL(H: string) {
        // Convert hex to RGB first
        let r = 0, g = 0, b = 0;
        if (H.length == 4) {
            r = parseInt("0x" + H[1] + H[1]);
            g = parseInt("0x" + H[2] + H[2]);
            b = parseInt("0x" + H[3] + H[3]);
        } else if (H.length == 7) {
            r = parseInt("0x" + H[1] + H[2]);
            g = parseInt("0x" + H[3] + H[4]);
            b = parseInt("0x" + H[5] + H[6]);
        }
        // Then to HSL
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        if (delta == 0)
            h = 0;
        else if (cmax == r)
            h = ((g - b) / delta) % 6;
        else if (cmax == g)
            h = (b - r) / delta + 2;
        else
            h = (r - g) / delta + 4;

        h = Math.round(h * 60);

        if (h < 0)
            h += 360;

        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return `${h} ${s}% ${l}%`;
    }

    useEffect(() => {
        if (!firestore) return;

        const docRef = doc(firestore, 'settings', 'general');

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as SiteSettings;
                setSettings(data);

                if (data.theme?.primaryColor) {
                    updateThemeColors(data.theme.primaryColor);
                }
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to load site settings:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);

    return (
        <SiteSettingsContext.Provider value={{ settings, isLoading }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}
