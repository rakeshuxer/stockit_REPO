require("dotenv").config();

const { fyersModel } = require("fyers-api-v3");

const fyers = new fyersModel();

fyers.setAppId("0YY77287KP-100");

fyers.setAccessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiZDoxIiwiZDoyIiwieDowIiwieDoxIiwieDoyIl0sImF0X2hhc2giOiJnQUFBQUFCcF9zZ2p1N0dFVmNycmJ5NmtJbDZSZnJBa3lMa0tzY2lxaWdkUWlLNG5yaGZ2MHZwSFVYQ2x6WmR5cTkycnM0VzQ1aWJvY3NROXpYaUpER050bVdnTE1GanRybHIyRjBLSDhVZnZRMm1FY0NVU2JXND0iLCJkaXNwbGF5X25hbWUiOiIiLCJvbXMiOiJLMSIsImhzbV9rZXkiOiI0MDM4ZWQ4YzZjYTAxOTJhMDRmMzYwMzA2ZjcxOGE0M2Y2MzFmNTQ2ZTBjNWE3ZWZmOTY0NGFmNyIsImlzRGRwaUVuYWJsZWQiOiJOIiwiaXNNdGZFbmFibGVkIjoiTiIsImZ5X2lkIjoiRkFKNTc2MDQiLCJhcHBUeXBlIjoxMDAsImV4cCI6MTc3ODM3MzAwMCwiaWF0IjoxNzc4MzA1MDU5LCJpc3MiOiJhcGkuZnllcnMuaW4iLCJuYmYiOjE3NzgzMDUwNTksInN1YiI6ImFjY2Vzc190b2tlbiJ9.F7mxJ-K9ay8ZiAxwdNf4XjUKJUT9u4CK7rk5fXhfAOo");

async function getQuotes(scrip) {

    try {

        const response = await fyers.getQuotes([
            `NSE:${scrip}-EQ`
        ]);

        return response;

    } catch (err) {

        console.log("Error:", err);

    }
}

async function run() {

    const data = await getQuotes("ASIANPAINT");

    console.log("Live Data:");

    console.log(JSON.stringify(data, null, 2));

}

run();