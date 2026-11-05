<script lang="ts">
	import type { ActionData, PageServerData } from './$types.ts';
	import { setScreenshot, setSettings, setStatus, store } from '../stores/index.js';

	import Form from '../components/Form.svelte';
	import Notification from '../components/Notification.svelte';
	import Screenshot from '../components/Screenshot.svelte';
	import './styles.css';

	export let data: PageServerData;
	export let form: ActionData;

	$: {
		if (data.settings) {
			setSettings(data.settings);
		}
		if (form?.success) {
			setStatus('success');
			setScreenshot(form.screenshot);
		}
	}
</script>

<svelte:head>
	<title>Webshot</title>
</svelte:head>

<div class="container">
	<header class="app-header">
		<h1 class="app-title">Webshot</h1>
	</header>
	<main class="app-main">
		<Form />
		{#if $store.status !== 'idle'}
			<Notification status={$store.status} />
		{/if}
		{#if $store.status === 'success' && $store.screenshot}
			<Screenshot />
		{/if}
	</main>
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		width: 100%;
		max-width: 30rem;
		margin: 10vh auto 5vh;
		padding: 1rem;
		position: relative;
	}

	.app-header {
		text-align: center;
		line-height: 1;
		text-transform: uppercase;
	}

	.app-title {
		font-size: 3rem;
		font-weight: 700;
	}

	.app-main {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}
</style>
