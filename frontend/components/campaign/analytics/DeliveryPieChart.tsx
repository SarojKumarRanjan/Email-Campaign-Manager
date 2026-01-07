"use client";

import React from 'react';
import { BaseChart } from '@/components/common/base-chart';
import { useTheme } from 'next-themes';

interface DeliveryPieChartProps {
    delivered: number;
    bounced: number;
    failed: number;
}

export const DeliveryPieChart: React.FC<DeliveryPieChartProps> = ({ 
    delivered, 
    bounced, 
    failed 
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const option = {
        labelLine: {
            show: true,
            smooth: true,
            
        },  
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            top: '0%',
            left: 'center',
            textStyle: {
                color: isDark ? '#9ca3af' : '#4b5563'
            }
        },
        series: [
            {
                name: 'Delivery Status',
                type: 'pie',
                radius: '70%',
                center: ['50%', '55%'],
                itemStyle: {
                    borderRadius: 4,
                    borderColor: isDark ? '#1f2937' : '#fff',
                    borderWidth: 1
                },
                label: {
                    show: true,
                    position: 'outside',
                    formatter: '{b}: {c} ({d}%)'
                },
                data: [
                    { value: delivered, name: 'Delivered', itemStyle: { color: '#22c55e' } }, 
                    { value: bounced, name: 'Bounced', itemStyle: { color: '#ef4444' } }, 
                    { value: failed, name: 'Failed', itemStyle: { color: '#f97316' } }       
                ]
            }
        ]
    };

    return <BaseChart option={option} height="300px" />;
};
