<script lang="ts">
	import { enhance } from '$app/forms';
	import { setIsVerified, setScreenshot, setStatus, store } from '../stores/index.js';
	import { resetHCaptcha } from '../utils/hcaptcha.js';
	import { PUBLIC_MODE } from '$env/static/public';

	import FormButton from './FormButton.svelte';
	import FormField from './FormField.svelte';
	import FormGroup from './FormGroup.svelte';
	import HCaptcha from './HCaptcha.svelte';
</script>

<form
	class="form card"
	method="post"
	use:enhance={() => {
		setStatus('generating');
		setScreenshot(null);

		return ({ result }) => {
			setStatus(result.type);
			setIsVerified(false);
			if (PUBLIC_MODE === 'production') resetHCaptcha();
			if (result.type === 'success') setScreenshot(result.data?.screenshot as string);
		};
	}}
>
	<FormGroup id="targetUrl" label="Site URL" width="full">
		<FormField
			id="targetProtocol"
			type="select"
			label="Target protocol"
			options={[
				{ label: 'http://', value: 'http' },
				{ label: 'https://', value: 'https' },
			]}
		/>
		<FormField id="targetUrl" label="Target URL" placeholder="example.com" required={true} />
	</FormGroup>
	<FormField id="fileWidth" type="number" label="Width (in pixels)" min={0} required={true} />
	<FormField id="fileHeight" type="number" label="Height (in pixels)" min={0} required={true} />
	<FormField id="fullPage" type="checkbox" label="Full page" width="full" />
	<FormField
		id="fileType"
		type="select"
		label="Format"
		options={[
			{ label: 'JPG', value: 'jpeg' },
			{ label: 'PNG', value: 'png' },
			{ label: 'WEBP', value: 'webp' },
		]}
	/>
	<FormField id="fileQuality" type="number" label="Quality" min={0} max={100} required={true} />
	<FormField
		id="captureDelay"
		type="number"
		label="Delay before capture (in seconds)"
		min={0}
		max={120}
		required={true}
		width="full"
	/>
	{#if PUBLIC_MODE === 'production'}
		<HCaptcha />
	{/if}
	<FormButton
		type="submit"
		width="full"
		isDisabled={(PUBLIC_MODE === 'production' && !$store.isVerified) ||
			$store.status === 'generating'}
	>
		Capture
	</FormButton>
</form>

<style lang="scss">
	.form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
</style>
