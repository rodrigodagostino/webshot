import puppeteer from 'puppeteer';

import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import type { ISettings } from '../stores/index.js';
import { HCAPTCHA_SECRET_KEY } from '$env/static/private';
import { PUBLIC_MODE, PUBLIC_HCAPTCHA_SITE_KEY } from '$env/static/public';

export const load: PageServerLoad = ({ cookies }) => {
	const settings = cookies.get('webshotSettings');
	const parsedSettings: ISettings | undefined = settings && JSON.parse(settings);

	return {
		settings: parsedSettings,
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();

		const targetProtocol = String(formData.get('targetProtocol')) as ISettings['targetProtocol'];
		const targetUrl = String(formData.get('targetUrl'));
		const fileWidth = Number(formData.get('fileWidth'));
		const fileHeight = Number(formData.get('fileHeight'));
		const fullPage = Boolean(formData.get('fullPage'));
		const fileType = String(formData.get('fileType')) as ISettings['fileType'];
		const fileQuality = Number(formData.get('fileQuality'));
		const captureDelay = Number(formData.get('captureDelay'));
		const hCaptchaResponse = formData.get('h-captcha-response');

		/**
		 * Verify captcha.
		 */
		if (PUBLIC_MODE === 'production') {
			if (typeof hCaptchaResponse !== 'string' || !hCaptchaResponse) {
				throw error(400, 'Please complete hCaptcha verification.');
			}

			let verificationData: unknown;

			try {
				const response = await fetch('https://api.hcaptcha.com/siteverify', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: new URLSearchParams({
						secret: HCAPTCHA_SECRET_KEY,
						sitekey: PUBLIC_HCAPTCHA_SITE_KEY,
						response: hCaptchaResponse,
					}),
					signal: AbortSignal.timeout(10_000),
				});

				if (!response.ok) {
					throw new Error('hCaptcha verification request failed.');
				}

				verificationData = await response.json();
			} catch {
				throw error(503, 'hCaptcha verification is temporarily unavailable. Please try again.');
			}

			const isVerified =
				typeof verificationData === 'object' &&
				verificationData !== null &&
				'success' in verificationData &&
				verificationData.success === true;

			if (!isVerified) {
				throw error(400, 'hCaptcha verification failed. Please complete the check again.');
			}
		}

		/**
		 * Generate screenshot.
		 */
		const settings: ISettings = {
			targetProtocol,
			targetUrl,
			fileWidth,
			fileHeight,
			fullPage,
			fileType,
			fileQuality,
			captureDelay,
		};

		cookies.set('webshotSettings', JSON.stringify(settings), { path: '/' });

		// Start browser.
		const browser = await puppeteer.launch({
			headless: true,
			ignoreDefaultArgs: ['--disable--extensions'],
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				// Disable cache.
				'--aggressive-cache-discard',
				'--disable-cache',
				'--disable-application-cache',
				'--disable-offline-load-stale-cache',
				'--disable-gpu-shader-disk-cache',
				'--media-cache-size=0',
				'--disk-cache-size=0',
				'--disable-extensions',
				// Speed up.
				'--disable-component-extensions-with-background-pages',
				'--disable-default-apps',
				'--mute-audio',
				'--no-default-browser-check',
				'--autoplay-policy=user-gesture-required',
				'--disable-background-timer-throttling',
				'--disable-backgrounding-occluded-windows',
				'--disable-notifications',
				'--disable-background-networking',
				'--disable-breakpad',
				'--disable-component-update',
				'--disable-domain-reliability',
				'--disable-sync',
			],
		});

		// Open page.
		const page = await browser.newPage();
		await page.goto(`${targetProtocol}://${targetUrl}`, { waitUntil: 'load', timeout: 0 });
		await page.setViewport({
			width: fileWidth,
			height: fileHeight,
		});
		if (fullPage) {
			await page.evaluate(() =>
				window.scrollTo({
					top: document.body.clientHeight,
					behavior: 'smooth',
				})
			);
		}

		// Execute delay (and transform the delay value to milliseconds).
		await new Promise((res) => setTimeout(res, captureDelay * 1000));

		// Take the screenshot.
		const screenshot = await page.screenshot({
			encoding: 'base64',
			fullPage: fullPage,
			...(fileType === 'jpeg' || fileType === 'webp' ? { quality: fileQuality } : null),
			type: fileType,
		});

		// Close browser.
		await browser.close();

		return {
			success: true,
			screenshot,
		};
	},
};
