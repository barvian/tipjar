<script>
	export let toEmail = false
</script>

<button class="tipkit-btn" on:click>
	{toEmail ? 'Continue' : 'Continue to payment'}
</button>