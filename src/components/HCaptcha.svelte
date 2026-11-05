<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { PUBLIC_HCAPTCHA_SITE_KEY } from '$env/static/public';
	import { setIsVerified } from '../stores/index.js';
	import { loadHCaptcha, registerHCaptchaWidget, removeHCaptchaWidget } from '../utils/hcaptcha.js';

	let errorMessage = '';

	const hCaptchaAttachment: Attachment<HTMLElement> = (element) => {
		let widgetId: string | undefined;
		let isDestroyed = false;

		setIsVerified(false);
		errorMessage = '';

		void loadHCaptcha()
			.then(() => {
				if (isDestroyed) return;

				widgetId = window.hcaptcha.render(element, {
					sitekey: PUBLIC_HCAPTCHA_SITE_KEY,
					callback: () => {
						errorMessage = '';
						setIsVerified(true);
					},
					'expired-callback': () => {
						setIsVerified(false);
						errorMessage = 'Your hCaptcha verification expired. Please complete it again.';
					},
					'error-callback': () => {
						setIsVerified(false);
						errorMessage =
							'hCaptcha encountered an error. Please try again. If the problem continues, reload this page.';
					},
				});

				registerHCaptchaWidget(widgetId);
			})
			.catch(() => {
				if (isDestroyed) return;

				setIsVerified(false);
				errorMessage =
					'Unable to load hCaptcha. Check your connection or browser settings, then reload this page.';
			});

		return () => {
			isDestroyed = true;
			setIsVerified(false);
			if (widgetId !== undefined) {
				removeHCaptchaWidget(widgetId);
			}
		};
	};
</script>

<div class="h-captcha" {@attach hCaptchaAttachment}></div>

{#if errorMessage}
	<p class="h-captcha__message" role="alert" aria-live="polite">
		{errorMessage}
	</p>
{/if}

<style lang="scss">
	.h-captcha {
		grid-column: 1/-1;
		justify-self: center;
	}

	.h-captcha__message {
		grid-column: 1/-1;
		margin: 0;
		font-size: 0.875rem;
		text-align: center;
	}
</style>
