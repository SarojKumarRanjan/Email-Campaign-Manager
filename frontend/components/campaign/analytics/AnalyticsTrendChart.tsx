"use client";

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';

interface AnalyticsTrendChartProps {
    data: {
        date: string; // ISO string 
        sent_count: number;
        opened_count: number;
        clicked_count: number;
    }[];
}

export const AnalyticsTrendChart: React.FC<AnalyticsTrendChartProps> = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const dates = data.map(d => new Date(d.date).toLocaleDateString());
    const sentData = data.map(d => d.sent_count);
    const openedData = data.map(d => d.opened_count);
    const clickedData = data.map(d => d.clicked_count);

    const option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['Sent', 'Opened', 'Clicked'],
            textStyle: {
                color: isDark ? '#ccc' : '#333'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates,
            axisLabel: {
                color: isDark ? '#ccc' : '#333'
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: isDark ? '#ccc' : '#333'
            }
        },
        series: [
            {
                name: 'Sent',
                type: 'line',
                data: sentData,
                smooth: true,
                itemStyle: { color: '#3b82f6' } // Blue
            },
            {
                name: 'Opened',
                type: 'line',
                data: openedData,
                smooth: true,
                itemStyle: { color: '#22c55e' } // Green
            },
            {
                name: 'Clicked',
                type: 'line',
                data: clickedData,
                smooth: true,
                itemStyle: { color: '#a855f7' } // Purple
            }
        ]
    };

    return <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />;
};
