require("dotenv").config();

const { fyersModel } = require("fyers-api-v3");

const fyers = new fyersModel();

fyers.setAppId(process.env.FYERS_APP_ID);
fyers.setRedirectUrl(process.env.FYERS_REDIRECT_URL);

const generateAuthURL = () => {
  const url = fyers.generateAuthCode();

  console.log("\nLogin URL:\n");
  console.log(url);
};

generateAuthURL();