// 🏅 Your mission is to validate and sharpen your test doubles skills 💜
// ✅ Whenever you see this icon, there's a TASK for you
// ✅🚀 - This is an Advanced task
// 💡 - This is an ADVICE symbol, it will appear nearby most tasks and help you in fulfilling the tasks

const sinon = require("sinon");
const nock = require("nock");
const util = require("util");
const { TripClipService } = require("../trip-clip-service");
const WeatherProvider = require("../weather-provider");
const mailSender = require("../mail-sender");
const videoProducer = require("../video-producer");
const testHelper = require("./test-helpers");
const DataAccess = require("../data-access");

// ✅ TASK: The weather service can't and shouldn't predict weather for the same day if it's after 3am (too late)
// Ensure that when the trip date is today after 3am, the response succeeded field is false
// 💡 TIP: Use Sinon fake timers to control the time: https://sinonjs.org/releases/latest/fake-timers/
let clock;

beforeEach(() => {
  // 💡 TIP: Leave this code, it's required to prevent access to the real YouTube
  nock("http://like-youtube.com")
    .post(/upload.*$/)
    .reply(200, { status: "all-good" });
});

test("When the trip date is today after 3am, Then the response succeeded field is false", async () => {
  //Arrange
  const startDate = new Date(2023, 11, 22, 17, 0, 0);
  const clipInstructions = testHelper.factorClipInstructions({ startDate });
  const tripClipServiceUnderTest = new TripClipService();
  clock = sinon.useFakeTimers(startDate.getTime());

  //Act
  const receivedResult = await tripClipServiceUnderTest.generateClip(
    clipInstructions
  );

  //Assert
  expect(receivedResult.succeed).toBe(false);
});
// ✅ TASK: With regard to the test above (weather before 3 am), ensure to clean-up the fake timers between tests
// 💡 TIP: Use Sinon fake timers to control the time: https://sinonjs.org/releases/latest/fake-timers/

afterEach(() => {
  clock.restore();
  jest.resetModules();
});

// ✅ TASK: The clip service is using the instructions validator  (instructions-validator.js) to validate the input.
// Stub the validator to return validation failure with reason 'no-photos', ensure that the generateClip response is not succeeded and it includes the reason
// 💡 TIP: You might struggle a bit to stub the validator, why? Hint: see how the the 'trip-clip-service' imports the validator
// 💡 TIP: You may need to use 'jest.resetModules()'
test("When validations fails due to 'no photos', then the generate clip should return succeeded equals false", async () => {
  // Arrange
  const instructionsValidator = require("../instructions-validator");
  sinon
    .stub(instructionsValidator, "validate")
    .returns({ succeeded: false, failures: ["no-photos"] });
  const { TripClipService } = require("../trip-clip-service");
  const tripClipServiceUnderTest = new TripClipService();
  const clipInstructions = testHelper.factorClipInstructions();

  // Act
  const receivedResult = await tripClipServiceUnderTest.generateClip(
    clipInstructions
  );

  // Assert
  expect(receivedResult).toMatchObject({
    instructionsValidation: {
      failures: ["no-photos"], //is it better to use expect.arrayContaining(["no-photos"])? or making sure that failures has only "no-photos" is a better option?
      succeeded: false,
    },
    succeed: false,
  });
});
