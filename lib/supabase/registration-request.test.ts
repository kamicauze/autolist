import assert from "node:assert/strict";
import {
  EMAIL_ALREADY_REGISTERED_MESSAGE,
  getRegistrationErrorMessage,
  isExistingRegistration,
  RegistrationRequestTimeoutError,
  withRegistrationRequestTimeout,
} from "./registration-request";

assert.match(
  getRegistrationErrorMessage("Error sending confirmation email"),
  /verification email.*try again.*sign in/i
);

assert.match(getRegistrationErrorMessage("email rate limit exceeded"), /wait a few minutes/i);

assert.match(getRegistrationErrorMessage("User already registered"), /sign in instead/i);

assert.equal(getRegistrationErrorMessage("Password is too weak"), "Password is too weak");

assert.equal(isExistingRegistration({ identities: [] }), true);
assert.equal(isExistingRegistration(null), false);
assert.equal(isExistingRegistration({}), false);
assert.equal(isExistingRegistration({ identities: [{ id: "email-identity" }] }), false);
assert.equal(getRegistrationErrorMessage("User already exists"), EMAIL_ALREADY_REGISTERED_MESSAGE);

async function run() {
  assert.equal(await withRegistrationRequestTimeout(Promise.resolve("created"), 50), "created");

  await assert.rejects(
    withRegistrationRequestTimeout(new Promise(() => undefined), 5),
    RegistrationRequestTimeoutError
  );

  await assert.rejects(
    withRegistrationRequestTimeout(Promise.reject(new Error("Network unavailable")), 50),
    /Network unavailable/
  );
}

void run();
