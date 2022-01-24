// https://stackoverflow.com/a/51398471
module.exports = class APIErrorCode {
  static STRIPE_TOO_SMALL  = new APIErrorCode('stripe_too_small')

  constructor(code) {
    this.code = code
  }

  static fromJSON(json) {
    switch (json) {
      case this.STRIPE_TOO_SMALL.code: return this.STRIPE_TOO_SMALL
      default: return json
    }
  }

  toString() {
    return this.code
  }

  toJSON() {
    return this.code
  }
}