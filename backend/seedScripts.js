// require('dotenv').config();
// const mongoose = require('mongoose');
// const Scrip = require('./models/Scrip.js');  // use your existing model

// (async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             serverSelectionTimeoutMS: 30000,
//         });
//         console.log("DB Connected");

//         const scripts = [
//             { scriptName: "Tata Consultancy Services", symbol: "TCS",        scriptToken: 11536 },
//             { scriptName: "State Bank of India",        symbol: "SBIN",       scriptToken: 3045  },
//             { scriptName: "Adani Transmission",         symbol: "ADANITRANS", scriptToken: 15044 },
//             { scriptName: "Adani Ports",                symbol: "ADANIPORTS", scriptToken: 15083 },
//             { scriptName: "Adani Power",                symbol: "ADANIPOWER", scriptToken: 467   },
//             { scriptName: "Adani Green Energy",         symbol: "ADANIGREEN", scriptToken: 236   },
//             { scriptName: "UPL Limited",                symbol: "UPL",        scriptToken: 2963  },
//             { scriptName: "Bajaj Finserv",              symbol: "BAJAJFINSV", scriptToken: 16675 },
//             { scriptName: "Bajaj Finance",              symbol: "BAJFINANCE", scriptToken: 317   },
//             { scriptName: "Oil and Natural Gas Corp",   symbol: "ONGC",       scriptToken: 2475  },
//             { scriptName: "Tata Steel",                 symbol: "TATASTEEL",  scriptToken: 3868  },
//         ].map(s => ({
//             ...s,
//             exchange:    "NSE",
//             segment:     "Capital Market",
//             scriptType:  "EQ",
//             scriptKey:   `NSE_${s.symbol}`,
//             lastPrice:        0,
//             percentageChange: 0,
//             changeInPrice:    0,
//             low:  0,
//             high: 0,
//             open: 0,
//             close: 0,
//         }));

//         for (const scrip of scripts) {
//             await Scrip.findOneAndUpdate(
//                 { scriptKey: scrip.scriptKey },
//                 scrip,
//                 { upsert: true, new: true }
//             );
//             console.log(`✅ Inserted: ${scrip.scriptName} (${scrip.symbol})`);
//         }

//         console.log("\n✅ All scripts seeded successfully!");
//         process.exit(0);
//     } catch (err) {
//         console.log("❌ Error:", err.message);
//         process.exit(1);
//     }
// })();
require('dotenv').config();
const mongoose = require('mongoose');
const { fyersModel } = require('fyers-api-v3');
const Scrip = require('./models/Scrip.js');

const fyers = new fyersModel();
fyers.setAppId(process.env.FYERS_APP_ID);
fyers.setAccessToken(process.env.FYERS_ACCESS_TOKEN);

const symbols = [
    "NSE:TCS-EQ",
    "NSE:SBIN-EQ",
    "NSE:ADANITRANS-EQ",
    "NSE:ADANIPORTS-EQ",
    "NSE:ADANIPOWER-EQ",
    "NSE:ADANIGREEN-EQ",
    "NSE:UPL-EQ",
    "NSE:BAJAJFINSV-EQ",
    "NSE:BAJFINANCE-EQ",
    "NSE:ONGC-EQ",
    "NSE:TATASTEEL-EQ"
];

(async () => {
    try {
        // 1. Connect DB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
        });
        console.log("✅ DB Connected");

        // 2. Fetch live data from Fyers for all symbols at once
        console.log("Fetching data from Fyers...");
        const response = await fyers.getQuotes(symbols);
        console.log("Fyers response:", JSON.stringify(response, null, 2));

        if (!response?.d?.length) {
            console.log("❌ No data returned from Fyers:", response);
            process.exit(1);
        }

        // 3. Insert each symbol into DB using Fyers data
        for (const item of response.d) {
            const v = item.v;
            const symbolKey = item.n; // e.g. "NSE:TCS-EQ"
            const parts = symbolKey.split(':');           // ["NSE", "TCS-EQ"]
            const exchange = parts[0];                    // "NSE"
            const symbolPart = parts[1].split('-');       // ["TCS", "EQ"]
            const symbol = symbolPart[0];                 // "TCS"
            const scriptType = symbolPart[1];             // "EQ"
            const scriptKey = `${exchange}_${symbol}`;   // "NSE_TCS"

            const scripData = {
                scriptName:      v.description || v.short_name || symbol,
                symbol:          symbol,
                exchange:        exchange,
                segment:         "Capital Market",
                scriptType:      scriptType,
                scriptToken:     v.token || 0,
                scriptKey:       scriptKey,
                lastPrice:       parseFloat(v.lp) || 0,
                changeInPrice:   v.ch  || 0,
                percentageChange: v.chp || 0,
                open:            v.open_price  || 0,
                high:            v.high_price  || 0,
                low:             v.low_price   || 0,
                close:           v.prev_close_price || 0,
                volume:          v.volume      || 0,
                shortName:       v.short_name  || '',
                description:     v.description || '',
                originalName:    v.original_name || '',
                spread:          v.spread || '',
                ask:             v.ask    || '',
                bid:             v.bid    || '',
                tt:              v.tt     || '',
            };

            await Scrip.findOneAndUpdate(
                { scriptKey },
                scripData,
                { upsert: true, new: true }
            );
            console.log(`✅ Seeded: ${scripData.scriptName} (${symbol}) — ₹${scripData.lastPrice}`);
        }

        console.log("\n✅ All scripts seeded from Fyers successfully!");
        process.exit(0);

    } catch (err) {
        console.log("❌ Error:", err.message);
        process.exit(1);
    }
})();