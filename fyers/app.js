require("dotenv").config();

const { fyersModel } = require("fyers-api-v3");

const fyers = new fyersModel();

fyers.setAppId(process.env.FYERS_APP_ID);

fyers.setRedirectUrl(process.env.FYERS_REDIRECT_URL);

const authcode ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfaWQiOiIwWVk3NzI4N0tQIiwidXVpZCI6IjJlMjYzM2I5MWQ5NzRlZDJiOWE1NzIxYzgzOGI0ZDEyIiwiaXBBZGRyIjoiIiwibm9uY2UiOiIiLCJzY29wZSI6IiIsImRpc3BsYXlfbmFtZSI6IkZBSjU3NjA0Iiwib21zIjoiSzEiLCJoc21fa2V5IjoiOWQwMDFhM2RjN2RlY2Q1ZjY2MWIyZDA4YTE0ZmIwNTU2MDZiMDI2ZGNhMTViMGUzYzNjYjIwNTIiLCJpc0RkcGlFbmFibGVkIjoiTiIsImlzTXRmRW5hYmxlZCI6Ik4iLCJhdWQiOiJbXCJkOjFcIixcImQ6MlwiLFwieDowXCIsXCJ4OjFcIixcIng6MlwiXSIsImV4cCI6MTc3OTI4MzgyNSwiaWF0IjoxNzc5MjUzODI1LCJpc3MiOiJhcGkubG9naW4uZnllcnMuaW4iLCJuYmYiOjE3NzkyNTM4MjUsInN1YiI6ImF1dGhfY29kZSJ9.vbJ4oKm7AwKfZ6ppo74FOEVuHVBwzLR90iB9SAg3RW0"
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