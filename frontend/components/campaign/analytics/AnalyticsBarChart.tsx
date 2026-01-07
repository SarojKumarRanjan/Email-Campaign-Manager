"use client";

import React from 'react';
import { BaseChart } from '@/components/common/base-chart';
import { useTheme } from 'next-themes';

interface AnalyticsBarChartProps {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
}

export const AnalyticsBarChart: React.FC<AnalyticsBarChartProps> = ({ 
    sent, 
    delivered, 
    opened, 
    clicked, 
    bounced 
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const option = {
        grid: {
            top: '10%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['Sent', 'Delivered', 'Opened', 'Clicked', 'Bounced'],
            axisLabel: {
                color: isDark ? '#9ca3af' : '#4b5563',
            },
            axisLine: {
                lineStyle: {
                    color: isDark ? '#374151' : '#e5e7eb',
                }
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: isDark ? '#9ca3af' : '#4b5563',
            },
            splitLine: {
                lineStyle: {
                    color: isDark ? '#374151' : '#e5e7eb',
                    type: 'dashed'
                }
            }
        },
        series: [
            {
                name: 'Count',
                type: 'bar',
                barWidth: '50%',
                data: [
                    { value: sent, itemStyle: { color: '#3b82f6' } },      // Blue
                    { value: delivered, itemStyle: { color: '#22c55e' } }, // Green
                    { value: opened, itemStyle: { color: '#eab308' } },    // Yellow
                    { value: clicked, itemStyle: { color: '#a855f7' } },   // Purple
                    { value: bounced, itemStyle: { color: '#ef4444' } }    // Red
                ],
                itemStyle: {
                    borderRadius: [4, 4, 0, 0]
                },
                label: {
                    show: true,
                    position: 'top',
                    color: isDark ? '#9ca3af' : '#4b5563'
                }
            }
        ]
    };

    return <BaseChart option={option} height="350px" />;
};
