"use client";

import React, { useState, useEffect } from "react";
import { Heading, MutedText } from "@/components/common/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getAxiosForUseFetch, postAxiosForUseFetch, putAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { useFetch, useConfigurableMutation } from "@/hooks/useApiCalls";
import GeneralSettings from "./components/GeneralSettings";
import FileSettings from "./components/FileSettings";
import SMTPSettings from "./components/SMTPSettings";
import PrivacySettings from "./components/PrivacySettings";
import PageHeader from "@/components/common/page-header";

export default function SettingsPage() {
    const { data: settings, isLoading, refetch } = useFetch(
        getAxiosForUseFetch,
        ['settings'],
        { url: { template: API_PATH.USER_SETTINGS.GET_SETTINGS } }
    );

    const { mutate: updateGeneral } = useConfigurableMutation(
        putAxiosForUseFetch,
        ['settings'],
        {
            onSuccess: () => {
                toast.success("General settings updated");
                refetch();
            }
        }
    );

    const { mutate: updateFiles } = useConfigurableMutation(
        putAxiosForUseFetch,
        ['settings'],
        {
            onSuccess: () => {
                toast.success("File settings updated");
                refetch();
            }
        }
    );

    const { mutate: updateSMTP } = useConfigurableMutation(
        putAxiosForUseFetch,
        ['settings'],
        {
            onSuccess: () => {
                toast.success("SMTP settings updated");
                refetch();
            }
        }
    );

    const { mutate: updatePrivacy } = useConfigurableMutation(
        putAxiosForUseFetch,
        ['settings'],
        {
            onSuccess: () => {
                toast.success("Privacy settings updated");
                refetch();
            }
        }
    );

    const { mutate: testSMTP, isPending: testing } = useConfigurableMutation(
        postAxiosForUseFetch,
        [],
        {
            onSuccess: () => {
                toast.success("Test email sent");
            }
        }
    );

    const handleUpdateGeneral = (data: any) => {
        updateGeneral({
            url: { template: API_PATH.USER_SETTINGS.UPDATE_SETTINGS },
            data
        });
    };

    const handleUpdateFiles = (data: any) => {
        updateFiles({
            url: { template: API_PATH.USER_SETTINGS.UPDATE_FILES },
            data
        });
    };

    const handleUpdateSMTP = (data: any) => {
        updateSMTP({
            url: { template: API_PATH.USER_SETTINGS.UPDATE_SMTP },
            data
        });
    };

    const handleUpdatePrivacy = (data: any) => {
        updatePrivacy({
            url: { template: API_PATH.USER_SETTINGS.UPDATE_PRIVACY },
            data
        });
    };

    const handleTestSMTP = (email: string) => {
        testSMTP({
            url: { template: API_PATH.USER_SETTINGS.TEST_SMTP },
            data: { email }
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-full flex-1 flex-col space-y-4 p-4 md:flex">
                <div className="space-y-2">
                    <PageHeader title="Settings" />
                    <MutedText>Loading settings...</MutedText>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-1 flex-col space-y-4 p-4 md:flex">
            <div>
               <PageHeader title="Settings" />
            </div>

            <Tabs defaultValue="general" className="space-y-1">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="files">Files & Uploads</TabsTrigger>
                    <TabsTrigger value="smtp">SMTP</TabsTrigger>
                    <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="space-y-4">
                    <GeneralSettings initialSettings={settings} onSave={handleUpdateGeneral} />
                </TabsContent>
                <TabsContent value="files" className="space-y-4">
                    <FileSettings initialSettings={settings} onSave={handleUpdateFiles} />
                </TabsContent>
                <TabsContent value="smtp" className="space-y-4">
                    <SMTPSettings initialSettings={settings} onSave={handleUpdateSMTP} onTest={handleTestSMTP} testing={testing} />
                </TabsContent>
                <TabsContent value="privacy" className="space-y-4">
                    <PrivacySettings initialSettings={settings} onSave={handleUpdatePrivacy} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
