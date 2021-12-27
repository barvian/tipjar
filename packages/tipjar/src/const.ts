// https://stackoverflow.com/a/51398471
export class Frequency {
  static readonly ONE_TIME  = new Frequency('onetime', 'One-time')
  static readonly WEEKLY    = new Frequency('weekly', 'Weekly')
  static readonly BIWEEKLY  = new Frequency('biweekly', 'Biweekly')
  static readonly MONTHLY   = new Frequency('monthly', 'Monthly')
  static readonly QUARTERLY = new Frequency('quarterly', 'Quarterly')
  static readonly YEARLY    = new Frequency('yearly', 'Yearly')

  static readonly RECURRING = [
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
  ].map(key => [key, this[key]])

  // private to disallow creating other instances of this type
  private constructor(private readonly value: string, public readonly label: any) {
  }

  toString() {
    return this.value
  }
}

export const stripeKey = Symbol()
export const paypalKey = Symbol()