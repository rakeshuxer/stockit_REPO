const { fyersModel } = require('fyers-api-v3');
const IndicesSnapshot = require('../../models/IndicesSnapshot');

const fyers = new fyersModel();
fyers.setAppId(process.env.FYERS_APP_ID);
fyers.setAccessToken(process.env.FYERS_ACCESS_TOKEN);

// Fyers public symbol masters. Every index appears here with a ticker
// ending in "-INDEX" (e.g. NSE:NIFTY50-INDEX, BSE:SENSEX-INDEX).
const SYMBOL_MASTERS = [
    'https://public.fyers.in/sym_details/NSE_CM.csv',
    'https://public.fyers.in/sym_details/BSE_CM.csv',
];

// Used when the symbol master can't be downloaded, and to decide what is
// shown first in the carousel.
const PRIORITY_INDICES = [
    'NSE:NIFTY50-INDEX',
    'NSE:NIFTYBANK-INDEX',
    'BSE:SENSEX-INDEX',
    'NSE:FINNIFTY-INDEX',
    'NSE:MIDCPNIFTY-INDEX',
    'BSE:BANKEX-INDEX',
    'NSE:NIFTYNXT50-INDEX',
    'NSE:INDIAVIX-INDEX',
    'NSE:NIFTYIT-INDEX',
    'NSE:NIFTYAUTO-INDEX',
    'NSE:NIFTYPHARMA-INDEX',
    'NSE:NIFTYFMCG-INDEX',
    'NSE:NIFTYMETAL-INDEX',
    'NSE:NIFTYENERGY-INDEX',
    'NSE:NIFTYREALTY-INDEX',
    'NSE:NIFTYMEDIA-INDEX',
    'NSE:NIFTYPSUBANK-INDEX',
    'NSE:NIFTYPVTBANK-INDEX',
    'NSE:NIFTY100-INDEX',
    'NSE:NIFTY200-INDEX',
    'NSE:NIFTY500-INDEX',
    'NSE:NIFTYMIDCAP50-INDEX',
    'BSE:BSE100-INDEX',
    'BSE:BSE200-INDEX',
    'BSE:BSE500-INDEX',
];

const SYMBOL_LIST_TTL = 24 * 60 * 60 * 1000; // refresh index list daily
const QUOTES_TTL = 30 * 1000;                 // cache quotes for 30s
const FYERS_BATCH_SIZE = 50;                  // getQuotes limit per call

let symbolCache = { symbols: null, fetchedAt: 0 };
let quotesCache = { data: null, fetchedAt: 0 };

const INDEX_TICKER_RE = /\b(NSE|BSE):[A-Z0-9&_.\-]+-INDEX\b/;

async function loadIndexSymbols() {
    if (symbolCache.symbols && Date.now() - symbolCache.fetchedAt < SYMBOL_LIST_TTL) {
        return symbolCache.symbols;
    }

    const found = new Set();
    for (const url of SYMBOL_MASTERS) {
        try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const text = await res.text();
            for (const line of text.split('\n')) {
                const m = line.match(INDEX_TICKER_RE);
                if (m) found.add(m[0]);
            }
        } catch (err) {
            console.log(`Index symbol master download failed (${url}):`, err.message);
        }
    }

    // Priority indices first, then the rest alphabetically.
    const rest = [...found].filter((s) => !PRIORITY_INDICES.includes(s)).sort();
    const symbols = found.size > 0
        ? [...PRIORITY_INDICES, ...rest]
        : PRIORITY_INDICES;

    symbolCache = { symbols, fetchedAt: Date.now() };
    return symbols;
}

async function fetchQuotes(symbols) {
    const results = [];
    for (let i = 0; i < symbols.length; i += FYERS_BATCH_SIZE) {
        const batch = symbols.slice(i, i + FYERS_BATCH_SIZE);
        // Fyers Standard plan: max 5 requests/second.
        if (i > 0) await new Promise((r) => setTimeout(r, 250));
        try {
            const response = await fyers.getQuotes(batch);
            (response?.d || []).forEach((item) => {
                const v = item?.v;
                if (item?.s !== 'ok' || !v || v.lp == null) return;
                const [exchange, ticker] = item.n.split(':');
                results.push({
                    symbol: item.n,
                    exchange,
                    name: (v.short_name || ticker).replace(/-INDEX$/, ''),
                    description: v.description,
                    lastPrice: v.lp,
                    change: v.ch,
                    percentChange: v.chp,
                    prevClose: v.prev_close_price,
                    open: v.open_price,
                    high: v.high_price,
                    low: v.low_price,
                    timestamp: v.tt,
                });
            });
        } catch (err) {
            console.log('Fyers index getQuotes failed:', err.message);
        }
    }

    // Keep the requested order.
    const order = new Map(symbols.map((s, i) => [s, i]));
    return results.sort((a, b) => order.get(a.symbol) - order.get(b.symbol));
}

module.exports.get_indices = async (req, res) => {
    try {
        if (quotesCache.data && Date.now() - quotesCache.fetchedAt < QUOTES_TTL) {
            return res.status(200).json({ indices: quotesCache.data });
        }

        const symbols = await loadIndexSymbols();
        const indices = await fetchQuotes(symbols);

        if (indices.length > 0) {
            quotesCache = { data: indices, fetchedAt: Date.now() };
            // Persist so last traded values survive restarts / Fyers outages.
            IndicesSnapshot.findOneAndUpdate({}, { indices }, { upsert: true })
                .catch((err) => console.log('Saving indices snapshot failed:', err.message));
            return res.status(200).json({ indices, updatedAt: new Date() });
        }

        // Fyers failed — fall back to the last good snapshot.
        if (quotesCache.data) {
            return res.status(200).json({ indices: quotesCache.data, updatedAt: new Date(quotesCache.fetchedAt), stale: true });
        }
        const snapshot = await IndicesSnapshot.findOne();
        if (snapshot?.indices?.length) {
            return res.status(200).json({ indices: snapshot.indices, updatedAt: snapshot.updatedAt, stale: true });
        }

        return res.status(200).json({ indices: [] });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Internal server error',
            error: err.message,
        });
    }
};
