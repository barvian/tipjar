import TipJar from '@tipjar/react-tipjar'

export default function Home() {
	return (
		<TipJar stripePublishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} />
	)
}