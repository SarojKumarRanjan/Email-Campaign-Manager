"use client";

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';

interface DeliveryStatusChartProps {
    delivered: number;
    bounced: number;
    failed: number;
}

export const DeliveryStatusChart: React.FC<DeliveryStatusChartProps> = ({ delivered, bounced, failed }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center',
            textStyle: {
                color: isDark ? '#ccc' : '#333'
            }
        },
        series: [
            {
                name: 'Delivery Status',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: isDark ? '#1f2937' : '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: isDark ? '#fff' : '#333'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: delivered, name: 'Delivered', itemStyle: { color: '#22c55e' } }, // Green
                    { value: bounced, name: 'Bounced', itemStyle: { color: '#ef4444' } },   // Red
                    { value: failed, name: 'Failed', itemStyle: { color: '#f97316' } }     // Orange
                ]
            }
        ]
    };

    return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />;
};
