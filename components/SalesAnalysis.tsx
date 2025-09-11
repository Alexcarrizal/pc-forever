import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SaleRecord } from '../types';

// @ts-ignore
const Chart = window.Chart;

interface SalesAnalysisProps {
  salesHistory: SaleRecord[];
}

const SalesAnalysis: React.FC<SalesAnalysisProps> = ({ salesHistory }) => {
    const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('week');
    const chartContainer = useRef(null);
    const chartInstance = useRef<any>(null);

    const topProductsData = useMemo(() => {
        const now = new Date();
        const salesInPeriod = salesHistory.filter(sale => {
            const saleDate = new Date(sale.date);
            if (timePeriod === 'week') {
                const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                return saleDate >= oneWeekAgo;
            }
            if (timePeriod === 'month') {
                const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return saleDate >= oneMonthAgo;
            }
            if (timePeriod === 'year') {
                const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                return saleDate >= oneYearAgo;
            }
            return false;
        });

        const productQuantities = salesInPeriod
            .flatMap(sale => sale.items)
            .reduce((acc, item) => {
                if (item.id.startsWith('time-')) return acc;
                acc[item.name] = (acc[item.name] || 0) + item.quantity;
                return acc;
            }, {} as Record<string, number>);

        const sortedProducts = Object.entries(productQuantities)
            .sort(([, qtyA], [, qtyB]) => qtyB - qtyA)
            .slice(0, 10);

        return {
            labels: sortedProducts.map(([name]) => name),
            data: sortedProducts.map(([, qty]) => qty),
        };
    }, [salesHistory, timePeriod]);
    
    useEffect(() => {
        if (chartContainer.current && topProductsData) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            const ctx = (chartContainer.current as HTMLCanvasElement).getContext('2d');
            if (ctx) {
                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: topProductsData.labels,
                        datasets: [{
                            label: 'Unidades Vendidas',
                            data: topProductsData.data,
                            backgroundColor: 'rgba(59, 130, 246, 0.6)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 1,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context: any) => `${context.raw} unidades`
                                }
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(100, 116, 139, 0.2)'
                                },
                                ticks: {
                                  color: '#64748b'
                                }
                            },
                            y: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                  color: '#64748b'
                                }
                            }
                        }
                    }
                });
            }
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [topProductsData]);


    return (
        <div className="text-slate-800 dark:text-slate-200">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg mb-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Análisis de Ventas de Productos</h2>
                    <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex">
                        {(['week', 'month', 'year'] as const).map(period => (
                            <button
                                key={period}
                                onClick={() => setTimePeriod(period)}
                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${timePeriod === period ? 'bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}
                            >
                                {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[60vh] relative">
                    <canvas ref={chartContainer}></canvas>
                </div>
            </div>
        </div>
    )
}

export default SalesAnalysis;