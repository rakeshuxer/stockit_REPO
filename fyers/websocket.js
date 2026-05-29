require("dotenv").config();

const { fyersDataSocket } = require("fyers-api-v3");
const accessToken =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiZDoxIiwiZDoyIiwieDowIiwieDoxIiwieDoyIl0sImF0X2hhc2giOiJnQUFBQUFCcF9HdjVXZHBpZnN6N3JBRXByZ3kybmpuQWdIN2kzMTN1bkVmbmZ5ajFLUGNrTkEwR2JBb0dvRXZEYU9uOTRBT2lPWjd4Z3ZST20zSndtYWNibEdDQnBvYlNCbkpRa1F2QWU2TmVBdmJyYWxlNlMwbz0iLCJkaXNwbGF5X25hbWUiOiIiLCJvbXMiOiJLMSIsImhzbV9rZXkiOiI0MDM4ZWQ4YzZjYTAxOTJhMDRmMzYwMzA2ZjcxOGE0M2Y2MzFmNTQ2ZTBjNWE3ZWZmOTY0NGFmNyIsImlzRGRwaUVuYWJsZWQiOiJOIiwiaXNNdGZFbmFibGVkIjoiTiIsImZ5X2lkIjoiRkFKNTc2MDQiLCJhcHBUeXBlIjoxMDAsImV4cCI6MTc3ODIwMDIwMCwiaWF0IjoxNzc4MTUwMzkzLCJpc3MiOiJhcGkuZnllcnMuaW4iLCJuYmYiOjE3NzgxNTAzOTMsInN1YiI6ImFjY2Vzc190b2tlbiJ9.UhYPo3JGtSyujJvbts7NieXWLfiQkt-SlbaeIez-eoE";

// Create socket instance
const fyers = new fyersDataSocket(
 accessToken
);

// Symbols to subscribe
const symbols = [
  "NSE:SBIN-EQ",
  "NSE:RELIANCE-EQ",
  "NSE:NIFTY50-INDEX",
   "NSE:SBIN-EQ",
    "NSE:UPL-EQ",
    "NSE:ADANIPORTS-EQ"
];

// Connection opened
fyers.on("connect", () => {
  console.log("WebSocket Connected");

  // Subscribe to symbols
  fyers.subscribe(symbols);

  // Enable Lite mode
  fyers.mode(fyers.LiteMode);
});

// Receive market data
fyers.on("message", (message) => {
  console.log("Market Data:");
  console.log(message);
});

// Connection closed
fyers.on("close", () => {
  console.log("Connection Closed");
});

// Error handling
fyers.on("error", (error) => {
  console.log("Error:");
  console.log(error);
});

// Reconnect handling
fyers.on("reconnect", () => {
  console.log("Reconnecting...");
});

// Connect socket
fyers.connect();