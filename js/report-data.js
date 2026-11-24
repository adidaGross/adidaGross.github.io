// Real data from the AI QA Lab recorded run (github.com/adidaGross/ai-qa-lab), generated, do not edit by hand.
window.REPORT = {
 "passed": 14,
 "failures": [
  {
   "title": "GET product by id returns that product",
   "file": "api/products-api.spec.ts",
   "error": "Error: expect(received).toBe(expected) // Object.is equality",
   "verdict": "test-bug",
   "severity": null,
   "category": null,
   "summary": "The test calls the wrong URL (/api/product/2 instead of /api/products/2), so the server correctly answers 404 Not Found.",
   "healed": true
  },
  {
   "title": "GET missing product returns 404",
   "file": "api/products-api.spec.ts",
   "error": "Error: expect(received).toBe(expected) // Object.is equality",
   "verdict": "app-bug",
   "severity": "medium",
   "category": "api",
   "summary": "When someone asks the shop's API for a product that doesn't exist, it says \"OK\" (200) and sends back an empty object when it should say \"not found\" (404).",
   "healed": false
  },
  {
   "title": "an expired 2FA code is rejected",
   "file": "auth/account.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "app-bug",
   "severity": "high",
   "category": "security",
   "summary": "The server accepts 2FA codes up to 10 minutes old, so a code from 5 minutes ago still signs the user in when it should be rejected.",
   "healed": false
  },
  {
   "title": "account page shows the signed-in user after 2FA",
   "file": "auth/account.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "test-bug",
   "severity": null,
   "category": null,
   "summary": "The test types in a fixed 2FA code (\"492039\"), but these codes change every 30 seconds, so the server correctly rejects it and the user is never signed in.",
   "healed": true
  },
  {
   "title": "signing out ends the session on the server",
   "file": "auth/account.spec.ts",
   "error": "Error: expect(received).toBe(expected) // Object.is equality",
   "verdict": "app-bug",
   "severity": "high",
   "category": "security",
   "summary": "Signing out only deletes the cookie in the browser and leaves the session active on the server, so a copied session cookie still works after logout.",
   "healed": false
  },
  {
   "title": "browsing stays fast while many users sign in",
   "file": "load/load.spec.ts",
   "error": "Error: 95% of product requests must answer within 150 ms during the sign-ins. Browsing: 81 requests (27/s), 0 errors, p50 150 ms, p95 459 ms",
   "verdict": "app-bug",
   "severity": "high",
   "category": "performance",
   "summary": "Each sign-in hashes the password in a way that stalls the whole server, so product browsing slows down for everyone while people log in.",
   "healed": false
  },
  {
   "title": "API responses disable content-type sniffing",
   "file": "security/security.spec.ts",
   "error": "Error: expect(received).toBe(expected) // Object.is equality",
   "verdict": "test-bug",
   "severity": null,
   "category": null,
   "summary": "The shop does send the anti-sniffing header on API responses, but the test looks it up with capital letters, and Playwright always stores header names in lowercase, so it finds nothing.",
   "healed": true
  },
  {
   "title": "2FA code guessing is blocked after 5 wrong codes",
   "file": "security/security.spec.ts",
   "error": "Error: 6th attempt must be refused",
   "verdict": "app-bug",
   "severity": "high",
   "category": "security",
   "summary": "The server allows 50 wrong 2FA codes before blocking instead of 5, so attackers can brute-force the 6-digit code far more easily than intended.",
   "healed": false
  },
  {
   "title": "error responses do not reveal server internals",
   "file": "security/security.spec.ts",
   "error": "Error: the error response contains server file paths (node_modules)",
   "verdict": "app-bug",
   "severity": "medium",
   "category": "security",
   "summary": "When the server gets a broken request, its error message includes the full internal stack trace and file paths, which gives attackers details about how the server is built.",
   "healed": false
  },
  {
   "title": "cart total multiplies price by quantity",
   "file": "ui/cart.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "app-bug",
   "severity": "high",
   "category": "functional",
   "summary": "The cart total ignores item quantities, so two Coffee Mugs are charged as one ($12.50 instead of $25.00).",
   "healed": false
  },
  {
   "title": "discount code SAVE10 gives 10% off",
   "file": "ui/cart.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "app-bug",
   "severity": "high",
   "category": "functional",
   "summary": "The SAVE10 discount code takes off only 1% instead of 10%, so customers pay $39.50 for a $39.90 lamp when they should pay $35.91.",
   "healed": false
  },
  {
   "title": "remove deletes the clicked item",
   "file": "ui/cart.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "app-bug",
   "severity": "high",
   "category": "functional",
   "summary": "Clicking \"Remove\" on a cart item deletes the item after it, so the wrong product gets removed from the cart.",
   "healed": false
  },
  {
   "title": "quantity cannot go below 1",
   "file": "ui/cart.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "app-bug",
   "severity": "medium",
   "category": "validation",
   "summary": "In the cart, the \"-\" button keeps lowering the quantity past 1, so the cart can show 0 or negative quantities.",
   "healed": false
  },
  {
   "title": "checkout succeeds for a customer email",
   "file": "ui/checkout.spec.ts",
   "error": "Error: expect(locator).toContainText(expected) failed",
   "verdict": "test-bug",
   "severity": null,
   "category": null,
   "summary": "The test enters an invalid email (\"customer@example\", with no domain ending like .com), so the shop correctly refuses the order.",
   "healed": true
  },
  {
   "title": "order confirmation shows the customer's email",
   "file": "ui/checkout.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "test-bug",
   "severity": null,
   "category": null,
   "summary": "The test clicks \"Place order\" before it adds a product to the cart, so the shop correctly says \"Your cart is empty\".",
   "healed": true
  },
  {
   "title": "checkout rejects an email without @",
   "file": "ui/checkout.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "app-bug",
   "severity": "medium",
   "category": "validation",
   "summary": "The checkout accepts email addresses without an \"@\" (like \"hello.world\") because its email check only looks for a dot.",
   "healed": false
  },
  {
   "title": "login succeeds with correct credentials",
   "file": "ui/login.spec.ts",
   "error": "Error: expect(received).toBe(expected) // Object.is equality",
   "verdict": "test-bug",
   "severity": null,
   "category": null,
   "summary": "The test reads the login message right after clicking \"Log in\" and doesn't wait for the server's reply, so it sees an empty message before \"Welcome, admin!\" shows up.",
   "healed": true
  },
  {
   "title": "login fails with a wrong password",
   "file": "ui/login.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "app-bug",
   "severity": "critical",
   "category": "security",
   "summary": "You can log in as \"admin\" with any password at all, because the server only checks that the username exists and never checks the password.",
   "healed": false
  },
  {
   "title": "password field has an accessible label",
   "file": "ui/login.spec.ts",
   "error": "Error: expect(locator).toHaveAccessibleName(expected) failed",
   "verdict": "app-bug",
   "severity": "medium",
   "category": "accessibility",
   "summary": "The password box in the header login form has no label, so screen readers can't tell users what the field is for.",
   "healed": false
  },
  {
   "title": "shows product names in the list",
   "file": "ui/products.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "test-bug",
   "severity": null,
   "category": null,
   "summary": "The test looks for a page element called \"product-title\", but the shop labels product names as \"product-name\", so the test never finds anything even though the names show up correctly.",
   "healed": true
  },
  {
   "title": "shows the correct price for Notebook",
   "file": "ui/products.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "test-bug",
   "severity": null,
   "category": null,
   "summary": "The test expects the wrong Notebook price ($4.57 has two digits swapped). The shop correctly shows the real price of $4.75.",
   "healed": true
  },
  {
   "title": "search finds products regardless of capitalization",
   "file": "ui/products.spec.ts",
   "error": "Error: expect(locator).toHaveText(expected) failed",
   "verdict": "app-bug",
   "severity": "medium",
   "category": "functional",
   "summary": "Product search only matches exact capitals, so searching \"mug\" doesn't find \"Coffee Mug\".",
   "healed": false
  },
  {
   "title": "search shows user input as plain text",
   "file": "ui/products.spec.ts",
   "error": "Error: expect(locator).toContainText(expected) failed",
   "verdict": "app-bug",
   "severity": "high",
   "category": "security",
   "summary": "The search \"no results\" message puts the user's search text into the page as HTML. Anyone who can control the search text can run their own script in the page (XSS).",
   "healed": false
  }
 ]
};
