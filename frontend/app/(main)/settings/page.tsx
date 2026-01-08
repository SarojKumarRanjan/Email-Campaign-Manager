"use client";

import React from "react";
import { Heading, MutedText } from "@/components/common/typography";

export default function SettingsPage() {
    return (
        <div className="flex h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="space-y-2">
                <Heading>Settings</Heading>
                <MutedText>
                    General application settings will be here. The data table demo has been moved to /demo/table.
                </MutedText>
            </div>
        </div>
    );  
}
