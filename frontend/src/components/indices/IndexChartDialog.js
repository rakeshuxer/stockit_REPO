import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y'];
const UP = '#23a15a';
const DOWN = '#e0552f';

const fmt = (n, digits = 2) =>
    typeof n === 'number'
        ? n.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
        : '-';

// Intraday ranges show time; longer ranges show dates.
function formatTime(ms, range) {
    const d = new Date(ms);
    if (range === '1D') {
        return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    }
    if (range === '1W' || range === '1M' || range === '3M') {
        return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAxis(ms, range) {
    const d = new Date(ms);
    if (range === '1D') return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    if (range === '1W' || range === '1M' || range === '3M') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

export default function IndexChartDialog({ index, open, onClose }) {
    const [range, setRange] = useState('1D');
    const [chart, setChart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset to 1D whenever a different index is opened.
    useEffect(() => {
        if (open) setRange('1D');
    }, [open, index?.symbol]);

    useEffect(() => {
        if (!open || !index?.symbol) return;
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/historical/index-chart`, {
                    params: { symbol: index.symbol, range },
                });
                if (!cancelled) setChart(response.data);
            } catch (err) {
                console.log(err);
                if (!cancelled) {
                    setChart(null);
                    setError('Chart data is unavailable right now.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [open, index?.symbol, range]);

    const points = useMemo(() => chart?.points || [], [chart]);

    // Header numbers: 1D uses the live quote; other ranges use the chart's own change.
    const lastPrice = index?.lastPrice;
    const change = range === '1D' ? index?.change : chart?.change;
    const percentChange = range === '1D' ? index?.percentChange : chart?.percentChange;
    const up = (change ?? 0) >= 0;
    const color = up ? UP : DOWN;

    // x = position in the series, so overnight/weekend gaps don't show as flat lines.
    const series = [{ name: index?.name || '', data: points.map((p, i) => [i, p[1]]) }];

    const options = {
        chart: {
            type: 'line',
            toolbar: { show: false },
            zoom: { enabled: false },
            animations: { enabled: false },
            fontFamily: 'inherit',
        },
        colors: [color],
        stroke: { width: 2.5, curve: 'straight' },
        grid: { show: false, padding: { left: 8, right: 8 } },
        dataLabels: { enabled: false },
        legend: { show: false },
        markers: { size: 0, hover: { size: 5 } },
        xaxis: {
            type: 'numeric',
            tickAmount: 6,
            labels: {
                formatter: (val) => {
                    const p = points[Math.round(val)];
                    return p ? formatAxis(p[0], range) : '';
                },
                style: { colors: '#888' },
            },
            axisTicks: { show: false },
            axisBorder: { show: true, color: '#e0e0e0' },
            tooltip: { enabled: false },
            crosshairs: { show: true, stroke: { color: '#ccc', width: 1, dashArray: 0 } },
        },
        yaxis: {
            show: true,
            opposite: true,
            tickAmount: 4,
            labels: { formatter: (v) => fmt(v, 0), style: { colors: '#888' } },
        },
        annotations: {
            yaxis: chart?.baseline != null ? [{
                y: chart.baseline,
                borderColor: '#bbb',
                strokeDashArray: 5,
            }] : [],
        },
        tooltip: {
            x: {
                formatter: (val) => {
                    const p = points[Math.round(val)];
                    return p ? formatTime(p[0], range) : '';
                },
            },
            y: { formatter: (v) => fmt(v), title: { formatter: () => '' } },
            marker: { show: false },
        },
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography sx={{ fontSize: '1.6rem', fontWeight: 600 }}>{index?.name}</Typography>
                        {index?.description && index.description !== index.name && (
                            <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                                {index.description}
                            </Typography>
                        )}
                    </Box>
                    <IconButton aria-label="Close" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Stack direction="row" alignItems="baseline" spacing={1.5} sx={{ mt: 1.5 }} flexWrap="wrap">
                    <Typography sx={{ fontSize: '2rem', fontWeight: 600 }}>{fmt(lastPrice)}</Typography>
                    {change != null && (
                        <Typography sx={{ color, fontSize: '1rem' }}>
                            {up ? '+' : ''}{fmt(change)} ({up ? '+' : ''}{fmt(percentChange)}%)
                        </Typography>
                    )}
                    <Typography sx={{ color: 'text.secondary', fontSize: '1rem' }}>{range}</Typography>
                </Stack>

                <Box sx={{ height: 360, mt: 2, position: 'relative' }}>
                    {loading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                            <CircularProgress size={28} />
                        </Stack>
                    ) : error || points.length === 0 ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                            <Typography color="text.secondary">{error || 'No chart data found.'}</Typography>
                        </Stack>
                    ) : (
                        <ReactApexChart key={`${index?.symbol}-${range}`} options={options} series={series} type="line" height={360} />
                    )}
                </Box>

                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                    {RANGES.map((r) => (
                        <Button
                            key={r}
                            size="small"
                            variant="outlined"
                            onClick={() => setRange(r)}
                            sx={{
                                minWidth: 52,
                                borderRadius: 5,
                                color: '#333',
                                borderColor: r === range ? '#999' : '#e0e0e0',
                                background: r === range ? '#eee' : 'transparent',
                                '&:hover': { borderColor: '#999', background: '#f5f5f5' },
                            }}
                        >
                            {r}
                        </Button>
                    ))}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
