require("dotenv").config();

const { fyersModel } = require("fyers-api-v3");

const fyers = new fyersModel();

fyers.setAppId(process.env.FYERS_APP_ID);

// Paste generated access token
fyers.setAccessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiZDoxIiwiZDoyIiwieDowIiwieDoxIiwieDoyIl0sImF0X2hhc2giOiJnQUFBQUFCcURGbzQzcGpDS1dlMy16d2R2TW56S0RQQXJJZ3AteGJ5d1NhYnNKdEY1ZDMwMFhHNmphNTlUQTBkYlNMdk5YeWc5THhtZGhSUklWYm5KZmpQRldSbk5DVnNYTUYtUmR3bXR1dlBobWZUUVh6SW5CZz0iLCJkaXNwbGF5X25hbWUiOiIiLCJvbXMiOiJLMSIsImhzbV9rZXkiOiI0MDM4ZWQ4YzZjYTAxOTJhMDRmMzYwMzA2ZjcxOGE0M2Y2MzFmNTQ2ZTBjNWE3ZWZmOTY0NGFmNyIsImlzRGRwaUVuYWJsZWQiOiJOIiwiaXNNdGZFbmFibGVkIjoiTiIsImZ5X2lkIjoiRkFKNTc2MDQiLCJhcHBUeXBlIjoxMDAsImV4cCI6MTc3OTIzNzAwMCwiaWF0IjoxNzc5MTk0NDI0LCJpc3MiOiJhcGkuZnllcnMuaW4iLCJuYmYiOjE3NzkxOTQ0MjQsInN1YiI6ImFjY2Vzc190b2tlbiJ9.0MPRkN3rrn5ERGaRe4_bL5ij8Ds3OFCS9Xa9VssFIJo")
const getProfile = async () => {
  try {
    const response = await fyers.get_profile();

    console.log("\nProfile Data:\n");
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

getProfile();