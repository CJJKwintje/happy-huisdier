import { Client, cacheExchange, fetchExchange } from 'urql';

const SHOPIFY_STORE_URL = 'https://yvdedm-5e.myshopify.com/api/2024-01/graphql';
const SHOPIFY_STOREFRONT_TOKEN = 'f2891c0e910edc30275cac0cc8e32cff';

// Maximum number of retry attempts
const MAX_RETRIES = 3;
// Base delay between retries (in milliseconds)
const BASE_RETRY_DELAY = 1000;

export const shopifyClient = new Client({
  url: SHOPIFY_STORE_URL,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: {
    headers: {
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
  },
});

// New Cart API mutations
const CREATE_CART_MUTATION = `
  mutation cartCreate {
    cartCreate {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADD_TO_CART_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  retryCount = 0
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retryCount >= MAX_RETRIES) {
      throw error;
    }

    const backoffDelay = BASE_RETRY_DELAY * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000;
    const totalDelay = backoffDelay + jitter;

    await delay(totalDelay);
    
    return executeWithRetry(operation, retryCount + 1);
  }
};

export const createCheckout = async (
  lineItems: { variantId: string; quantity: number }[]
) => {
  try {
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      throw new Error('Winkelwagen is leeg');
    }

    // First create a new cart
    const createCartResult = await executeWithRetry(async () => {
      const response = await shopifyClient
        .mutation(CREATE_CART_MUTATION, {})
        .toPromise();

      if (!response.data && response.error) {
        console.error('Cart creation error:', response.error);
        throw new Error('Netwerkfout: Kan geen verbinding maken met de betaalservice');
      }

      return response;
    });

    if (createCartResult.data?.cartCreate?.userErrors?.length > 0) {
      const error = createCartResult.data.cartCreate.userErrors[0];
      console.error('Cart creation error:', error);
      throw new Error(`Fout bij aanmaken winkelwagen: ${error.message}`);
    }

    const cartId = createCartResult.data?.cartCreate?.cart?.id;
    if (!cartId) {
      console.error('No cart ID received:', createCartResult);
      throw new Error('Geen winkelwagen ID ontvangen van de betaalservice');
    }

    // Then add items to the cart
    const addToCartResult = await executeWithRetry(async () => {
      const response = await shopifyClient
        .mutation(ADD_TO_CART_MUTATION, {
          cartId,
          lines: lineItems.map(item => ({
            merchandiseId: item.variantId,
            quantity: item.quantity
          }))
        })
        .toPromise();

      if (!response.data && response.error) {
        console.error('Add to cart error:', response.error);
        throw new Error('Netwerkfout: Kan geen producten toevoegen aan de winkelwagen');
      }

      return response;
    });

    if (addToCartResult.data?.cartLinesAdd?.userErrors?.length > 0) {
      const error = addToCartResult.data.cartLinesAdd.userErrors[0];
      console.error('Add to cart error:', error);
      throw new Error(`Fout bij toevoegen producten: ${error.message}`);
    }

    const checkoutUrl = addToCartResult.data?.cartLinesAdd?.cart?.checkoutUrl;
    if (!checkoutUrl) {
      console.error('No checkout URL received:', addToCartResult);
      throw new Error('Geen checkout URL ontvangen van de betaalservice');
    }

    return {
      id: cartId,
      webUrl: checkoutUrl
    };
  } catch (error) {
    console.error('Checkout creation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        throw new Error('Controleer je internetverbinding en probeer het opnieuw');
      }
      throw error;
    }
    
    throw new Error('Er is een onverwachte fout opgetreden. Probeer het later opnieuw');
  }
};