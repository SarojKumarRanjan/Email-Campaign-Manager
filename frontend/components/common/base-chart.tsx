"use client";

import React from 'react';
import ReactECharts, { EChartsOption } from 'echarts-for-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export interface BaseChartProps {
    option: EChartsOption;
    className?: string;
    style?: React.CSSProperties;
    height?: string;
}

export const BaseChart: React.FC<BaseChartProps> = ({ 
    option, 
    className, 
    style = {}, 
    height = '300px' 
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Default theme overrides
    const defaultOption: EChartsOption = {
        backgroundColor: 'transparent',
        textStyle: {
            color: isDark ? '#9ca3af' : '#4b5563', // gray-400 : gray-600
        },
        tooltip: {
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? '#374151' : '#e5e7eb',
            textStyle: {
                color: isDark ? '#f3f4f6' : '#111827',
            },
        },
        ...option,
    };

    return (
        <ReactECharts 
            option={defaultOption} 
            style={{ height, width: '100%', ...style }} 
            className={cn("w-full h-full", className)}
            theme={isDark ? 'dark' : undefined}
            opts={{ renderer: 'svg' }}
        />
    );
};
