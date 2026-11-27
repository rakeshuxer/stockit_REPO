// const { fyersModel } = require("fyers-api-v3");

// const fyers = new fyersModel();

// fyers.setAppId(process.env.FYERS_APP_ID);
// fyers.setAccessToken(process.env.FYERS_ACCESS_TOKEN);

// module.exports.get_historical_scrip_data = async (req, res) => {
//     const { scrip, timeFrame, fromDate, toDate } = req.query;
//     try {
//         let history = new fyers.history()
//         let result = await history.setSymbol(scrip)
//             .setResolution(timeFrame)
//             .setDateFormat(1)
//             .setRangeFrom(fromDate) 
//             .setRangeTo(toDate)
//             .getHistory()
//         return res.status(200).json({
//             message: 'success',
//             data: result
//         });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({
//             message: 'Internal server error',
//             err: err
//         });
//     }
// }
const { fyersModel } = require("fyers-api-v3");

const fyers = new fyersModel();
fyers.setAppId(process.env.FYERS_APP_ID);
fyers.setAccessToken(process.env.FYERS_ACCESS_TOKEN);

module.exports.get_historical_scrip_data = async (req, res) => {
    const { scrip, timeFrame, fromDate, toDate } = req.query;
    try {
        const result = await fyers.getHistory({
            symbol:      scrip,
            resolution:  timeFrame,
            date_format: 1,
            range_from:  fromDate,
            range_to:    toDate,
            cont_flag:   1
        });

        return res.status(200).json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Internal server error',
            err: err.message
        });
    }
}

// ---------------------------------------------------------------------------
// Index chart (view-only line chart on the dashboard)
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_SEC = 5.5 * 60 * 60;
const MAX_DAILY_SPAN_DAYS = 365; // Fyers: max days per daily request

// range -> { resolution, days back }
const CHART_RANGES = {
    '1D': { resolution: '1',  days: 7 },   // trimmed to last trading day below
    '1W': { resolution: '5',  days: 7 },
    '1M': { resolution: '15', days: 31 },
    '3M': { resolution: '60', days: 92 },
    '6M': { resolution: 'D',  days: 183 },
    '1Y': { resolution: 'D',  days: 365 },
    '3Y': { resolution: 'D',  days: 3 * 365 },
    '5Y': { resolution: 'D',  days: 5 * 365 - 7 }, // stay inside Fyers' 5-year limit
};

const toYMD = (d) => d.toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fyers Standard plan allows 5 requests/second — cache results and space calls.
const chartCache = new Map(); // key -> { body, at }
const cacheTtl = (range) => (range === '1D' || range === '1W' ? 60 * 1000 : 15 * 60 * 1000);
const istDay = (epochSec) => Math.floor((epochSec + IST_OFFSET_SEC) / 86400);

async function fetchCandles(symbol, resolution, from, to) {
    // Daily data must be requested in <= 1 year chunks.
    const span = resolution === 'D' ? MAX_DAILY_SPAN_DAYS : 100;
    const candles = [];
    let start = new Date(from);
    let first = true;
    while (start <= to) {
        if (!first) await sleep(300);
        first = false;
        const end = new Date(Math.min(to.getTime(), start.getTime() + (span - 1) * DAY_MS));
        const result = await fyers.getHistory({
            symbol,
            resolution,
            date_format: 1,
            range_from: toYMD(start),
            range_to: toYMD(end),
            cont_flag: 1,
        });
        if (result?.s !== 'ok') throw new Error(result?.message || 'Fyers history request failed');
        candles.push(...(result.candles || []));
        start = new Date(end.getTime() + DAY_MS);
    }
    // de-dupe + sort by time
    const seen = new Map(candles.map((c) => [c[0], c]));
    return [...seen.values()].sort((a, b) => a[0] - b[0]);
}

module.exports.get_index_chart = async (req, res) => {
    const { symbol, range = '1D' } = req.query;
    const cfg = CHART_RANGES[range];

    if (!symbol || !/^(NSE|BSE):[A-Z0-9&_.\-]+-INDEX$/.test(symbol)) {
        return res.status(400).json({ message: 'Invalid index symbol' });
    }
    if (!cfg) {
        return res.status(400).json({ message: `Invalid range. Use one of ${Object.keys(CHART_RANGES).join(', ')}` });
    }

    const cacheKey = `${symbol}|${range}`;
    const cached = chartCache.get(cacheKey);
    if (cached && Date.now() - cached.at < cacheTtl(range)) {
        return res.status(200).json(cached.body);
    }

    try {
        const to = new Date();
        const from = new Date(to.getTime() - cfg.days * DAY_MS);
        let candles = await fetchCandles(symbol, cfg.resolution, from, to);

        let baseline = candles.length ? candles[0][1] : null; // first open

        if (range === '1D' && candles.length) {
            // Keep only the last trading day; baseline = previous day's close.
            const lastDay = istDay(candles[candles.length - 1][0]);
            const prev = candles.filter((c) => istDay(c[0]) < lastDay);
            candles = candles.filter((c) => istDay(c[0]) === lastDay);
            baseline = prev.length ? prev[prev.length - 1][4] : candles[0][1];
        }

        const points = candles.map((c) => [c[0] * 1000, c[4]]); // [ms, close]
        const last = points.length ? points[points.length - 1][1] : null;
        const change = last != null && baseline != null ? last - baseline : null;

        const body = {
            symbol,
            range,
            points,
            baseline,
            change,
            percentChange: change != null && baseline ? (change / baseline) * 100 : null,
        };
        if (points.length) chartCache.set(cacheKey, { body, at: Date.now() });
        return res.status(200).json(body);
    } catch (err) {
        console.log('Index chart error:', err?.message || err);
        if (cached) return res.status(200).json({ ...cached.body, stale: true });
        return res.status(500).json({
            message: 'Could not load chart data',
            err: err?.message || err?.data || String(err),
        });
    }
};


// ---------------------------------------------------------------------------
// Candlestick chart for any scrip / index (chart page)
// ---------------------------------------------------------------------------

// range -> candle size. 'W' = daily candles aggregated into weeks here.
const CANDLE_RANGES = {
    '1D': { resolution: '5',  days: 7, lastDayOnly: true },
    '1W': { resolution: '30', days: 7 },
    '1M': { resolution: '60', days: 31 },
    '3M': { resolution: 'D',  days: 92 },
    '6M': { resolution: 'D',  days: 183 },
    '1Y': { resolution: 'D',  days: 365 },
    '3Y': { resolution: 'D',  days: 3 * 365, weekly: true },
    '5Y': { resolution: 'D',  days: 5 * 365 - 7, weekly: true },
};

// Group daily candles into Monday-start weeks (IST).
function toWeekly(candles) {
    const weeks = new Map();
    for (const c of candles) {
        const week = Math.floor((istDay(c[0]) + 3) / 7); // epoch day 0 is a Thursday
        const w = weeks.get(week);
        if (!w) {
            weeks.set(week, [...c]);
        } else {
            w[2] = Math.max(w[2], c[2]);
            w[3] = Math.min(w[3], c[3]);
            w[4] = c[4];
            w[5] = (w[5] || 0) + (c[5] || 0);
        }
    }
    return [...weeks.values()];
}

module.exports.get_candles = async (req, res) => {
    const { symbol, range = '1D' } = req.query;
    const cfg = CANDLE_RANGES[range];

    if (!symbol || !/^(NSE|BSE|MCX):[A-Z0-9&_.\-]+$/.test(symbol)) {
        return res.status(400).json({ message: 'Invalid symbol' });
    }
    if (!cfg) {
        return res.status(400).json({ message: `Invalid range. Use one of ${Object.keys(CANDLE_RANGES).join(', ')}` });
    }

    const cacheKey = `candles|${symbol}|${range}`;
    const cached = chartCache.get(cacheKey);
    if (cached && Date.now() - cached.at < cacheTtl(range)) {
        return res.status(200).json(cached.body);
    }

    try {
        const to = new Date();
        const from = new Date(to.getTime() - cfg.days * DAY_MS);
        let candles = await fetchCandles(symbol, cfg.resolution, from, to);

        if (cfg.lastDayOnly && candles.length) {
            const lastDay = istDay(candles[candles.length - 1][0]);
            candles = candles.filter((c) => istDay(c[0]) === lastDay);
        }
        if (cfg.weekly) candles = toWeekly(candles);

        const body = {
            symbol,
            range,
            interval: cfg.weekly ? '1W' : cfg.resolution === 'D' ? '1D' : `${cfg.resolution}m`,
            // [ms, open, high, low, close, volume]
            candles: candles.map((c) => [c[0] * 1000, c[1], c[2], c[3], c[4], c[5]]),
        };
        if (body.candles.length) chartCache.set(cacheKey, { body, at: Date.now() });
        return res.status(200).json(body);
    } catch (err) {
        console.log('Candles error:', err?.message || err);
        if (cached) return res.status(200).json({ ...cached.body, stale: true });
        return res.status(500).json({
            message: 'Could not load chart data',
            err: err?.message || err?.data || String(err),
        });
    }
};
