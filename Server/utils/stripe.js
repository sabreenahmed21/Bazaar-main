import dotenv from 'dotenv';
dotenv.config();
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);
export default stripe;
