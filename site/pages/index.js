import TipJar from '@tipkit/react-jar'

export default function Home() {
	return (
		<TipJar stripePublishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} paypalClientId="test" />
	)
}