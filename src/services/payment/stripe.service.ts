import Stripe from "stripe";
import logger from "../logger";

const apiKey = process.env.STRIPE_SECRET_KEY || "STRIPE_KEY";

const stripeClient = new Stripe(apiKey, {
  apiVersion: "2022-11-15",
});

export async function createCustomer(data: { email: string; name: string }) {
  const customer = await stripeClient.customers.create({
    email: data.email,
    name: data.name,
  });
  return customer.id;
}

export async function addPaymentMethod(
  email: string,
  name: string,
  paymentMethodId: string
) {
  const customers = await stripeClient.customers.search({
    query: `email:'${email}'`,
  });
  let customerId = null;
  if (customers.data.length) {
    await stripeClient.paymentMethods.attach(paymentMethodId, {
      customer: customers.data[0].id,
    });
    customerId = customers.data[0].id;
  } else {
    const data = { email, name };
    const newCustomerId = await createCustomer(data);
    await stripeClient.paymentMethods.attach(paymentMethodId, {
      customer: newCustomerId,
    });
    customerId = newCustomerId;
  }
  return customerId;
}

export async function makePayment(
  customerId: string,
  amount: number,
  paymentMethod: string
) {
  try {
    const paymentMethods = await stripeClient.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    if (!paymentMethods.data.length) {
      throw Error("No payment method found.");
    }

    // Confirm payment instantly.
    const { id, status, client_secret, currency } =
      await stripeClient.paymentIntents.create({
        amount,
        currency: "usd",
        payment_method: paymentMethod,
        off_session: true,
        confirm: true,
        payment_method_types: ["card"],
        customer: customerId,
      });

    return id;
  } catch (error) {
    logger.error("Payment Error ", JSON.stringify(error));
  }
}

export async function removePaymentMethod(paymentId: string) {
  try {
    await stripeClient.paymentMethods.detach(paymentId);
  } catch (error) {
    throw new Error("Detach Failed!");
  }
}

export async function createAccountLink(accountId: string) {
  const accountLink = await stripeClient.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.FRONTEND_URL}/settings/payment/stripe_onboarding_redirect`,
    return_url: `${process.env.FRONTEND_URL}/settings/payment?accountId=${accountId}`,
    type: "account_onboarding",
  });
  return accountLink;
}

export async function createStripeSellerAccount(data: { email: string }) {
  const { email } = data;
  const stripeSellerAccount = await stripeClient.accounts.create({
    type: "express",
    email,
    business_type: "individual",
    country: "US",
    capabilities: {
      card_payments: {
        requested: true,
      },
      transfers: {
        requested: true,
      },
    },
    settings: {
      payouts: {
        schedule: {
          interval: "weekly",
          weekly_anchor: "monday",
        },
      },
    },
  });
  return stripeSellerAccount.id;
}

export async function getStripeAccount(accountId: string) {
  const account = await stripeClient.accounts.retrieve(accountId);
  return account;
}

export async function cancelPayment(paymentIntentId: string) {
  const refund = await stripeClient.refunds.create({
    payment_intent: paymentIntentId,
  });
  return refund;
}

export async function transferMoneyToConnectedAccount(
  accountId: string,
  amount: number
) {
  const transfer = await stripeClient.transfers.create({
    amount,
    currency: "usd",
    destination: accountId,
  });
  return transfer;
}

export async function listBankAccounts(accountId: string) {
  const accountCards = await stripeClient.accounts.listExternalAccounts(
    accountId,
    { object: "card", limit: 1 }
  );
  if (accountCards.data.length) {
    return accountCards.data[0];
  } else {
    const accountBanks = await stripeClient.accounts.listExternalAccounts(
      accountId,
      { object: "bank_account", limit: 1 }
    );
    return accountBanks.data[0];
  }
}
