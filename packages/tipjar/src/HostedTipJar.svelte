<script>
	import TipJar from './TipJar.svelte'
	import { initializeApp } from 'firebase/app'
	  import { getFirestore } from 'firebase/firestore'

	export let kit

	async function initFirebaseApp() {
	const config = await fetch(%FIREBASE_CONFIG_URL%).then(r => r.json())
	return initializeApp(config)
	}
	export const appP = initFirebaseApp()
	export const dbP = appP.then(app => getFirestore(app))
</script>

<TipJar {...$$restProps} />