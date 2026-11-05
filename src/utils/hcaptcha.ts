let hCaptchaLoadPromise: Promise<void> | undefined;
let hCaptchaWidgetId: string | undefined;

declare global {
	interface Window {
		webshotHCaptchaOnload?: () => void;
	}
}

export const loadHCaptcha = (): Promise<void> => {
	if (hCaptchaLoadPromise) {
		return hCaptchaLoadPromise;
	}

	if (typeof window === 'undefined') {
		return Promise.reject(new Error('hCaptcha can only be loaded in a browser.'));
	}

	if (window.hcaptcha) {
		return Promise.resolve();
	}

	hCaptchaLoadPromise = new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');

		window.webshotHCaptchaOnload = () => {
			delete window.webshotHCaptchaOnload;
			resolve();
		};

		script.src = 'https://js.hcaptcha.com/1/api.js?onload=webshotHCaptchaOnload&render=explicit';

		script.async = true;
		script.defer = true;

		script.onerror = () => {
			delete window.webshotHCaptchaOnload;
			script.remove();

			reject(new Error('Unable to load the hCaptcha API.'));
		};

		document.head.append(script);
	}).catch((cause: unknown) => {
		hCaptchaLoadPromise = undefined;
		throw cause;
	});

	return hCaptchaLoadPromise;
};

export const registerHCaptchaWidget = (id: string) => {
	hCaptchaWidgetId = id;
};

export const resetHCaptcha = () => {
	if (hCaptchaWidgetId !== undefined) {
		window.hcaptcha?.reset(hCaptchaWidgetId);
	}
};

export const removeHCaptchaWidget = (id: string) => {
	window.hcaptcha?.remove(id);

	if (hCaptchaWidgetId === id) {
		hCaptchaWidgetId = undefined;
	}
};
