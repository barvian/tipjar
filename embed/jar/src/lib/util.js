export const pageLoaded = new Promise(resolve => {
	if (document.readyState === 'complete') return resolve(true)
	window.addEventListener('load', event => {
		resolve(true)
	})
})

export const isInView = el => new Promise(resolve => {
	if (!el || typeof IntersectionObserver === 'undefined') return resolve() // TODO: polyfill

	const observer = new IntersectionObserver(([entry]) => {
		if (entry.isIntersecting) {
			observer.unobserve(el);
			resolve()
		}
	}, {
		threshold: 1
	});

	observer.observe(el)
})

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// Wrap value in Promise if it isn't one already
export const p = value => Promise.resolve(value)

// Return unresolved Promise
export const unresolved = () => new Promise(() => {})