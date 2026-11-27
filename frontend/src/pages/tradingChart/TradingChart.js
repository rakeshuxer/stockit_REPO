import { Box, Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import Loading from '../../components/loading/Loading';
import { useLocation } from 'react-router-dom';

const RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y'];
const INTERVAL_LABEL = { '5m': '5 min', '30m': '30 min', '60m': '1 hour', '1D': 'Daily', '1W': 'Weekly' };
const UP = '#23a15a';
const DOWN = '#e0452f';

const fmt = (n, digits = 2) =>
    typeof n === 'number'
        ? n.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
        : '-';

function axisLabel(ms, range) {
    const d = new Date(ms);
    if (range === '1D') return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    if (range === '1W' || range === '1M') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (range === '3M' || range === '6M') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function tooltipLabel(ms, range) {
    const d = new Date(ms);
    if (range === '1D' || range === '1W' || range === '1M') {
        return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
    const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return range === '3Y' || range === '5Y' ? `Week of ${date}` : date;
}

function TradingChart() {
    const location = useLocation();
    const scrip = new URLSearchParams(location.search).get('symbol');
    const [range, setRange] = useState('1D');
    const [chart, setChart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!scrip) return;
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/historical/candles`, {
                    params: { symbol: scrip, range },
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
    }, [scrip, range]);

    const candles = useMemo(() => chart?.candles || [], [chart]);

    // Change over the selected period: first candle's open -> last close.
    const first = candles[0];
    const last = candles[candles.length - 1];
    const lastPrice = last?.[4];
    const change = first && last ? last[4] - first[1] : null;
    const percentChange = change != null && first[1] ? (change / first[1]) * 100 : null;
    const up = (change ?? 0) >= 0;

    // x = candle position, so nights/weekends/holidays don't leave gaps.
    const series = [{
        name: scrip || '',
        data: candles.map((c, i) => ({ x: i, y: [c[1], c[2], c[3], c[4]] })),
    }];

    const options = {
        chart: {
            type: 'candlestick',
            fontFamily: 'inherit',
            animations: { enabled: false },
            zoom: { enabled: true, type: 'x', autoScaleYaxis: true },
            toolbar: {
                show: true,
                tools: { download: false, selection: false, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true },
            },
        },
        plotOptions: {
            candlestick: { colors: { upward: UP, downward: DOWN }, wick: { useFillColor: true } },
        },
        grid: { borderColor: '#e6e6ef' },
        xaxis: {
            type: 'numeric',
            tickAmount: 8,
            labels: {
                formatter: (val) => {
                    const c = candles[Math.round(val)];
                    return c ? axisLabel(c[0], range) : '';
                },
                style: { colors: '#777' },
            },
            tooltip: { enabled: false },
        },
        yaxis: {
            opposite: true,
            tooltip: { enabled: true },
            labels: { formatter: (v) => fmt(v), style: { colors: '#777' } },
        },
        tooltip: {
            custom: ({ dataPointIndex }) => {
                const c = candles[dataPointIndex];
                if (!c) return '';
                const color = c[4] >= c[1] ? UP : DOWN;
                return `
                    <div style="padding:8px 10px;font-size:12px;line-height:1.6">
                        <div style="color:#666;margin-bottom:2px">${tooltipLabel(c[0], range)}</div>
                        <div>O <b>${fmt(c[1])}</b> &nbsp; H <b>${fmt(c[2])}</b></div>
                        <div>L <b>${fmt(c[3])}</b> &nbsp; C <b style="color:${color}">${fmt(c[4])}</b></div>
                        ${c[5] ? `<div style="color:#666">Vol ${c[5].toLocaleString('en-IN')}</div>` : ''}
                    </div>`;
            },
        },
    };

    if (!scrip) {
        return (
            <Box sx={{ flexGrow: 1, padding: 2 }}>
                <Typography>Select a stock from your watchlist to view its chart.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Stack direction="row" alignItems="baseline" spacing={1.5} flexWrap="wrap" sx={{ px: 1 }}>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 600 }}>
                    {scrip.replace(/^[A-Z]+:/, '').replace(/-(EQ|INDEX)$/, '')}
                </Typography>
                {lastPrice != null && (
                    <>
                        <Typography sx={{ fontSize: '1.4rem', fontWeight: 600 }}>{fmt(lastPrice)}</Typography>
                        <Typography sx={{ color: up ? UP : DOWN }}>
                            {up ? '+' : ''}{fmt(change)} ({up ? '+' : ''}{fmt(percentChange)}%)
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                            {range}{chart?.interval ? ` · ${INTERVAL_LABEL[chart.interval] || chart.interval} candles` : ''}
                        </Typography>
                    </>
                )}
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ px: 1, mt: 2 }}>
                {RANGES.map((r) => (
                    <Button
                        key={r}
                        size="small"
                        variant="outlined"
                        onClick={() => setRange(r)}
                        sx={{
                            minWidth: 52,
                            borderRadius: 5,
                            color: r === range ? '#fff' : '#333',
                            borderColor: r === range ? '#396dff' : '#d6d6e6',
                            background: r === range ? '#396dff' : '#fff',
                            '&:hover': { borderColor: '#396dff', background: r === range ? '#2f5de0' : '#f3f5ff' },
                        }}
                    >
                        {r}
                    </Button>
                ))}
            </Stack>

            <Box sx={{ mt: 2, height: 500 }}>
                {loading ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                        <Loading />
                    </Stack>
                ) : error || candles.length === 0 ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                        <Typography color="text.secondary">{error || 'No chart data found.'}</Typography>
                    </Stack>
                ) : (
                    <ReactApexChart
                        key={`${scrip}-${range}`}
                        options={options}
                        series={series}
                        type="candlestick"
                        height={500}
                    />
                )}
            </Box>
        </Box>
    );
}

export default TradingChart;
