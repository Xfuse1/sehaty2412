
"use client";

import { useSiteSettings } from '@/providers/site-settings-provider';
import Image from 'next/image';

export function BrandLogo() {
    const { settings } = useSiteSettings();

    return (
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center relative overflow-hidden shadow-sm">
                {settings.general?.logoUrl ? (
                    <Image src={settings.general.logoUrl} alt="Logo" fill className="object-contain p-0.5" />
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" fill="#A78BFA" />
                    </svg>
                )}
            </div>
            <span className="font-bold text-xl">{settings.general?.siteName || 'صحتي'}</span>
        </div>
    );
}
