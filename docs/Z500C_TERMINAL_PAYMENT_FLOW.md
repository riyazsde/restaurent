# Multi-Restaurant Z500C Terminal & Card Payment Configuration Flow

## 1. Overall Configuration Flow
1. **Restaurant logs in** (`POST /api/v1/user/login-restaurant`)
2. **Adds Card as payment option** (`POST /api/v1/restaurant/payment_options/create`)
3. **Configures its acquiring-bank Merchant ID** (`PUT /api/v1/payments/merchant-payment-config/ACQUIRING_BANK`)
4. **Registers and pairs its Z500C terminal** (`POST /api/v1/master/myDevices/create` & `POST /api/v1/master/myDevices/:id/bridge/rotate-token`)
5. **Bank adapter and credentials are configured**
6. **Test payment and enable Card**
7. **Customer pays → Restaurant bank account**

---

## 2. Restaurant A — Configure Card Payment

### Step 1. Login as Restaurant A
First, log in through the existing restaurant login API and obtain the restaurant JWT:
```bash
BASE_URL="https://pos-backend-7xuw.onrender.com"
TOKEN_A="RESTAURANT_A_JWT"
```

### Step 2. Add Card Payment Option
**API**: `POST /api/v1/restaurant/payment_options/create`
```bash
curl --request POST "$BASE_URL/api/v1/restaurant/payment_options/create" \
  --header "Authorization: Bearer $TOKEN_A" \
  --header "Content-Type: application/json" \
  --data '{
    "PaymentOption": [
      {
        "option": "Credit Card",
        "Details": "Z500C card terminal"
      },
      {
        "option": "Cash",
        "Details": "Pay at counter"
      }
    ],
    "Status": true
  }'
```

### Step 3. Configure Restaurant A Merchant Account
| Field | Restaurant A |
| :--- | :--- |
| **Provider** | `ACQUIRING_BANK` |
| **Merchant Account ID** | `MERCHANT_A_001` |
| **Currency** | `XOF` |
| **Terminal** | `Z500C_A_001` |
| **Settlement account** | Restaurant A's bank account |

**API**: `PUT /api/v1/payments/merchant-payment-config/ACQUIRING_BANK`
```bash
curl --request PUT "$BASE_URL/api/v1/payments/merchant-payment-config/ACQUIRING_BANK" \
  --header "Authorization: Bearer $TOKEN_A" \
  --header "Content-Type: application/json" \
  --data '{
    "merchant_account_id": "MERCHANT_A_001",
    "display_name": "Restaurant A Card Payments",
    "currency": "XOF",
    "webhook_secret": "REPLACE_WITH_SECURE_RANDOM_SECRET_A",
    "enabled": true
  }'
```

### Step 4. Get Restaurant A Payment Configuration
```bash
curl --request GET "$BASE_URL/api/v1/payments/merchant-payment-config" \
  --header "Authorization: Bearer $TOKEN_A"
```

### Step 5. Get Restaurant A Enabled Payment Options
```bash
curl --request GET "$BASE_URL/api/v1/restaurant/payment_options/auth/my-options" \
  --header "Authorization: Bearer $TOKEN_A"
```

### Step 6. Register and Pair the Card Terminal
**Register Terminal (`POST /api/v1/master/myDevices/create`)**:
```bash
curl --request POST "$BASE_URL/api/v1/master/myDevices/create" \
  --header "Authorization: Bearer $TOKEN_A" \
  --header "Content-Type: application/json" \
  --data '{
    "Name": "Front Counter Z500C",
    "type": "POS Terminal",
    "Serial_Number": "Z500C_A_001",
    "Devices_ModelNo": "Z500C",
    "Hardware_Model": "Z500C",
    "Status": true
  }'
```

**Generate Android Bridge Enrolment Token (`POST /api/v1/master/myDevices/:id/bridge/rotate-token`)**:
```bash
curl --request POST "$BASE_URL/api/v1/master/myDevices/3/bridge/rotate-token" \
  --header "Authorization: Bearer $TOKEN_A"
```

---

## 3. Restaurant B — Configure Separately
Restaurant B follows the same process using its own JWT (`TOKEN_B`) and merchant account (`MERCHANT_B_002`, `Z500C_B_001`). Each restaurant has independent merchant configuration, terminal ownership, and bank settlement.

---

## 4. Customer Pays by Card — cURL Flow

### Step 1. Fetch the Order
```bash
curl --request GET "$BASE_URL/api/v1/restaurant/pos_order/getbyid/1042" \
  --header "Authorization: Bearer $TOKEN_A"
```

### Step 2. Start Terminal Payment
**API**: `POST /api/v1/employee/terminal-payments/start`
```bash
curl --request POST "$BASE_URL/api/v1/employee/terminal-payments/start" \
  --header "Authorization: Bearer $EMPLOYEE_TOKEN_A" \
  --header "Content-Type: application/json" \
  --data '{
    "order_id": 1042,
    "device_serial": "Z500C_A_001",
    "idempotency_key": "ORDER-1042-CARD-ATTEMPT-001",
    "provider": "ACQUIRING_BANK",
    "merchant_account_id": "MERCHANT_A_001"
  }'
```

### Step 3. Customer Taps or Inserts Card
The Z500C terminal processes the card using the bank-approved SDK.

### Step 4. Bank Confirms Payment (Server-to-Server)
**API**: `POST /api/v1/employee/terminal-payments/confirmation/:merchant_id/:provider`
Example route: `POST /api/v1/employee/terminal-payments/confirmation/MERCHANT_A_001/ACQUIRING_BANK`

### Step 5. Verify Final Order Status
```bash
curl --request GET "$BASE_URL/api/v1/restaurant/pos_order/getbyid/1042" \
  --header "Authorization: Bearer $TOKEN_A"
```
The POS displays **Paid** when the backend returns `"payment_status": "Success"`.
