# Getting Started with Create React App

## Stripe POS checkout

The API server uses one platform Stripe account for all restaurant POS payments. Configure these variables on the backend (for example, Render), never in this React app:

```dotenv
STRIPE_POS_SUCCESS_URL=https://your-deployed-frontend.example/payment/success
STRIPE_POS_CANCEL_URL=https://your-deployed-frontend.example/payment/cancel # optional; defaults to success URL
STRIPE_SECRET_KEY=<Stripe platform secret key>
STRIPE_POS_WEBHOOK_SECRET=<platform account webhook signing secret>
```

Configure the platform webhook at `https://your-api.example/api/v1/payments/stripe/pos/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. The webhook verifies payment and marks the order paid.

Create and save a POS order before requesting `POST /api/v1/restaurant/pos_order/:id/payment-link` (or the employee equivalent under `/api/v1/employee/pos_order`). The API calculates the amount from the saved order; do not convert XOF to minor units or request split payments. The optional `idempotency_key` defaults to the order ID. Reusing the same key returns the active Checkout Session; another key while checkout is active returns HTTP 409.

Order totals are rounded to the precision of the restaurant's configured currency before saving, so zero-decimal currencies are stored as whole amounts.

Open the returned `data.checkout_url` for the customer. A successful browser redirect is not proof of payment. The app calls `POST /api/v1/restaurant/pos_order/:id/payment/confirm` (or employee equivalent) to refresh status: HTTP 202 means pending and HTTP 200 means Stripe confirms payment. The cancel return route calls the matching `/payment/cancel` endpoint to release an unpaid order for edits.

## Restaurant signup subscription checkout

The public plan cards start checkout at `POST /api/v1/restaurant/admin_plan_buy_restaurant/checkout`. The browser sends the business name, email, selected `Admin_Plan_id`, optional `Country_id`, and `currency: "usd"` with an `Idempotency-Key` header. The API calculates the amount from the selected admin plan's price in major currency units; the frontend must not send a client-supplied amount. The API converts USD to Stripe minor units; it also accepts XOF and keeps those amounts in whole units. It returns a PaymentIntent client secret, which the frontend confirms with Stripe.js Payment Element. Card details must never be collected or sent directly by this app.

Set `REACT_APP_STRIPE_PUBLISHABLE_KEY` in the frontend build environment. Keep the Stripe secret and webhook signing secret only on the API server. After Stripe redirects to `/signup/payment-result`, the frontend checks `/checkout/:checkoutId/status` using the same idempotency key and does not report success or send the customer to sign in until the API reports `succeeded`. The webhook remains responsible for creating and activating the restaurant account and subscription.

Bar tabs use the same platform Stripe account, but require a backend-supported mapping from each tab to a POS order before checkout can be safely enabled.

Use test-mode keys/accounts for testing and live-mode keys/accounts for real payments. Never expose Stripe API keys or webhook signing secrets to the frontend or customers.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
