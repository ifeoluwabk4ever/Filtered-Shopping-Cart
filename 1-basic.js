const menu = [
  {
    id: 1,
    title: "buttermilk pancakes",
    category: "breakfast",
    price: 15.99,
    img: "./images/item-1.jpeg",
    desc: `I'm baby woke mlkshk wolf bitters live-edge blue bottle, hammock freegan copper mug whatever cold-pressed `,
  },
  {
    id: 2,
    title: "diner double",
    category: "lunch",
    price: 13.99,
    img: "./images/item-2.jpeg",
    desc: `vaporware iPhone mumblecore selvage raw denim slow-carb leggings gochujang helvetica man braid jianbing. Marfa thundercats `,
  },
  {
    id: 3,
    title: "godzilla milkshake",
    category: "shakes",
    price: 6.99,
    img: "./images/item-3.jpeg",
    desc: `ombucha chillwave fanny pack 3 wolf moon street art photo booth before they sold out organic viral.`,
  },
  {
    id: 4,
    title: "country delight",
    category: "breakfast",
    price: 20.99,
    img: "./images/item-4.jpeg",
    desc: `Shabby chic keffiyeh neutra snackwave pork belly shoreditch. Prism austin mlkshk truffaut, `,
  },
  {
    id: 5,
    title: "egg attack",
    category: "lunch",
    price: 22.99,
    img: "./images/item-5.jpeg",
    desc: `franzen vegan pabst bicycle rights kickstarter pinterest meditation farm-to-table 90's pop-up `,
  },
  {
    id: 6,
    title: "oreo dream",
    category: "shakes",
    price: 18.99,
    img: "./images/item-6.jpeg",
    desc: `Portland chicharrones ethical edison bulb, palo santo craft beer chia heirloom iPhone everyday`,
  },
  {
    id: 7,
    title: "bacon overflow",
    category: "breakfast",
    price: 8.99,
    img: "./images/item-7.jpeg",
    desc: `carry jianbing normcore freegan. Viral single-origin coffee live-edge, pork belly cloud bread iceland put a bird `,
  },
  {
    id: 8,
    title: "american classic",
    category: "lunch",
    price: 12.99,
    img: "./images/item-8.jpeg",
    desc: `on it tumblr kickstarter thundercats migas everyday carry squid palo santo leggings. Food truck truffaut  `,
  },
  {
    id: 9,
    title: "quarantine buddy",
    category: "shakes",
    price: 16.99,
    img: "./images/item-9.jpeg",
    desc: `skateboard fam synth authentic semiotics. Live-edge lyft af, edison bulb yuccie crucifix microdosing.`,
  },
];

const sectionCenter = document.querySelector(".section-center");

window.addEventListener("DOMContentLoaded", function () {
  let displayMenu = menu.map(function (item) {
    // console.log(item);

    return `<article class="menu-item">
          <img src=${item.img} alt=${item.title} class="photo" />
          <div class="item-info">
            <header>
              <h4>${item.title}</h4>
              <h4 class="price">$${item.price}</h4>
            </header>
            <p class="item-text">
              ${item.desc}
            </p>
          </div>
        </article>`;
  });
  displayMenu = displayMenu.join("");
  console.log(displayMenu);

  sectionCenter.innerHTML = displayMenu;
});
const stripe = Stripe('pk_test_51HRJEaLSmKybmvwezgtqydr2R8cdjhIep6xe7LT9tK3LXnKuufrVfpjzTNTOMtL2MpJuYM7y1QbtGuddFx3egkv100sJCn6Cet', {
  apiVersion: "2020-08-27",
});

const paymentRequest = stripe.paymentRequest({
  country: 'US',
  currency: 'usd',
  total: {
    label: 'Demo total',
    amount: 1099,
  },
  requestPayerName: true,
  requestPayerEmail: true,
});

const elements = stripe.elements();
const prButton = elements.create('paymentRequestButton', {
  paymentRequest,
});

(async () => {
  // Check the availability of the Payment Request API first.
  const result = await paymentRequest.canMakePayment();
  if (result) {
    prButton.mount('#payment-request-button');
  } else {
    document.getElementById('payment-request-button').style.display = 'none';
  }
})();

paymentRequest.on('paymentmethod', async (ev) => {
  // Confirm the PaymentIntent without handling potential next actions (yet).
  const {
    paymentIntent,
    error: confirmError
  } = await stripe.confirmCardPayment(
    clientSecret, {
      payment_method: ev.paymentMethod.id
    }, {
      handleActions: false
    }
  );

  if (confirmError) {
    // Report to the browser that the payment failed, prompting it to
    // re-show the payment interface, or show an error message and close
    // the payment interface.
    ev.complete('fail');
  } else {
    // Report to the browser that the confirmation was successful, prompting
    // it to close the browser payment method collection interface.
    ev.complete('success');
    // Check if the PaymentIntent requires any actions and if so let Stripe.js
    // handle the flow. If using an API version older than "2019-02-11" instead
    // instead check for: `paymentIntent.status === "requires_source_action"`.
    if (paymentIntent.status === "requires_action") {
      // Let Stripe.js handle the rest of the payment flow.
      const {
        error
      } = await stripe.confirmCardPayment(clientSecret);
      if (error) {
        // The payment failed -- ask your customer for a new payment method.
      } else {
        // The payment has succeeded.
      }
    } else {
      // The payment has succeeded.
    }
  }
});

const paymentRequest = stripe.paymentRequest({
  country: 'US',
  currency: 'usd',
  total: {
    label: 'Demo total',
    amount: 1099,
  },

  requestShipping: true,
  // `shippingOptions` is optional at this point:
  shippingOptions: [
    // The first shipping option in this list appears as the default
    // option in the browser payment interface.
    {
      id: 'free-shipping',
      label: 'Free shipping',
      detail: 'Arrives in 5 to 7 days',
      amount: 0,
    },
  ],
});


paymentRequest.on('shippingaddresschange', async (ev) => {
  if (ev.shippingAddress.country !== 'US') {
    ev.updateWith({
      status: 'invalid_shipping_address'
    });
  } else {
    // Perform server-side request to fetch shipping options
    const response = await fetch('/calculateShipping', {
      data: JSON.stringify({
        shippingAddress: ev.shippingAddress
      })
    });
    const result = await response.json();

    ev.updateWith({
      status: 'success',
      shippingOptions: result.supportedShippingOptions,
    });
  }
});

elements.create('paymentRequestButton', {
  paymentRequest,
  style: {
    paymentRequestButton: {
      type: 'default',
      // One of 'default', 'book', 'buy', or 'donate'
      // Defaults to 'default'

      theme: 'dark',
      // One of 'dark', 'light', or 'light-outline'
      // Defaults to 'dark'

      height: '64px',
      // Defaults to '40px'. The width is always '100%'.
    },
  },
});

const stripe = Stripe('pk_test_51HRJEaLSmKybmvwezgtqydr2R8cdjhIep6xe7LT9tK3LXnKuufrVfpjzTNTOMtL2MpJuYM7y1QbtGuddFx3egkv100sJCn6Cet', {
  apiVersion: "2020-08-27",
  stripeAccount: 'CONNECTED_STRIPE_ACCOUNT_ID',
});


// Node JS Section
var stripe = require("stripe")("sk_live_••••••••••••••••••••••••");

const domain = await stripe.applePayDomains.create({
    domain_name: 'example.com',
});

// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')
('sk_test_51HRJEaLSmKybmvwehSdGZeFLFoqNUfAdjRcleZP6p1sSgyHI8xZ5wxa8fcf9j2yklJsgvEx5bRzakvC6ACq7DWBW00GjUv7plK');

const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'usd',
  // Verify your integration in this guide by including this parameter
    metadata: {integration_check: 'accept_a_payment'},
});

var stripe = require("stripe")("sk_live_••••••••••••••••••••••••");

const domain = await stripe.applePayDomains.create({
    domain_name: 'example.com',
}, {
    stripe_account: '{{CONNECTED_STRIPE_ACCOUNT_ID}}',
});
