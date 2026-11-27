require("dotenv").config();

const { fyersModel } = require("fyers-api-v3");

const fyers = new fyersModel();

fyers.setAppId(process.env.FYERS_APP_ID);

fyers.setRedirectUrl(process.env.FYERS_REDIRECT_URL);

const authcode = process.env.FYERS_AUTH_CODE;
const generateAccessToken = async () => {
  try {
    console.log("APP ID:", process.env.FYERS_APP_ID);
    console.log("REDIRECT URL:", process.env.FYERS_REDIRECT_URL);

    const response = await fyers.generate_access_token({
      secret_key: process.env.FYERS_SECRET_KEY,
      auth_code: authcode,
    });

    console.log("\nAccess Token Response:\n");
    console.log(response);

  } catch (error) {
    console.log("\nError:\n");
    console.log(error);
  }
};

generateAccessToken();