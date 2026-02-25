// tests/setup.js
// Mocha test setup file

// Import chai for assertions
const chai = require("chai");
global.expect = chai.expect;
global.assert = chai.assert;
global.chai = chai;

// Import sinon for spies/stubs/mocks
const sinon = require("sinon");
global.sinon = sinon;

// Mock browser API
const mockBrowser = {
  runtime: {
    sendMessage: sinon.stub().resolves(),
    onMessage: {
      addListener: sinon.stub(),
    },
  },
  storage: {
    local: {
      get: sinon.stub().resolves({}),
      set: sinon.stub().resolves(),
    },
  },
  management: {
    setEnabled: sinon.stub().resolves(),
  },
  theme: {
    update: sinon.stub().resolves(),
    getCurrent: sinon.stub().resolves({}),
  },
};

global.browser = mockBrowser;

// Reset all mocks after each test
afterEach(() => {
  sinon.reset();
});
