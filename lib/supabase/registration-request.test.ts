import assert from "node:assert/strict";
import {
  EMAIL_ALREADY_REGISTERED_MESSAGE,
  getPasswordRequirementError,
  getRegistrationErrorMessage,
  isExistingRegistration,
  PASSWORD_REQUIREMENTS,
  RegistrationRequestTimeoutError,
  withRegistrationRequestTimeout,
} from "./registration-request";

assert.match(
  getRegistrationErrorMessage("Error sending confirmation email"),
  /verification email.*try again.*sign in/i
);

assert.match(getRegistrationErrorMessage("email rate limit exceeded"), /email service is busy.*details are still here.*try again in a few minutes/i);
assert.doesNotMatch(getRegistrationErrorMessage("email rate limit exceeded"), /too many|attempts/i);

const throttled = getRegistrationErrorMessage("For security purposes, you can only request this after 28 seconds.");
assert.match(throttled, /just sent a verification email to this address/i);
assert.match(throttled, /inbox and spam folder/i);
assert.match(throttled, /request another in 28 seconds\./);
assert.doesNotMatch(throttled, /for security purposes/i);
assert.match(getRegistrationErrorMessage("For security purposes, you can only request this after 1 seconds."), /in 1 second\./);
assert.match(getRegistrationErrorMessage("For security purposes, you can only request this once every 60 seconds"), /request another shortly\./);

assert.deepEqual(PASSWORD_REQUIREMENTS.map((item) => item.label), ["8 characters", "Capital letter", "Number"]);
assert.equal(getPasswordRequirementError("abcdefgh"), "Your password needs a capital letter and a number.");
assert.equal(getPasswordRequirementError("Abc1"), "Your password needs at least 8 characters.");
assert.equal(getPasswordRequirementError(""), "Your password needs at least 8 characters, a capital letter, and a number.");
assert.equal(getPasswordRequirementError("Abcdefg1"), null);

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
