export const PINK = "#FF009C";
export const BLUE = "#5400FF";
export const API_URL = process.env.NODE_ENV === 'production' ? "https://api.flux.market" : "http://localhost:3001";
export const YES_WINS_PAYOUT = [0, 10000];
export const NO_WINS_PAYOUT = [10000, 0];
export const INVALID_MARKET_PAYOUT = [5000, 5000];