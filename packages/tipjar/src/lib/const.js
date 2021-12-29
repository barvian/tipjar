// https://stackoverflow.com/a/51398471
export class Frequency {
  static ONE_TIME  = new Frequency('onetime', 'One-time')
  static WEEKLY    = new Frequency('weekly', 'Weekly')
  static BIWEEKLY  = new Frequency('biweekly', 'Biweekly')
  static MONTHLY   = new Frequency('monthly', 'Monthly')
  static QUARTERLY = new Frequency('quarterly', 'Quarterly')
  static YEARLY    = new Frequency('yearly', 'Yearly')

  static RECURRING = [
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
  ].map(key => [key, this[key]])

  // private to disallow creating other instances of this type
  constructor(value, label) {
    this.value = value
    this.label = label
  }

  toString() {
    return this.value
  }
}

export const firebaseKey = Symbol()
export const stripeKey = Symbol()
export const paypalKey = Symbol()
