<script context="module">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './button.svelte';
	// import type { ArgTypes } from '@storybook/svelte';

	// const argTypes = {
	// 	size: {
	// 		type: 'string',
	// 		options: ['sm', 'md', 'lg'],
	// 		control: {
	// 			type: 'select'
	// 		}
	// 	},
	// 	shape: {
	// 		type: 'string',
	// 		options: ['circular', 'square', 'rounded'],
	// 		control: {
	// 			type: 'select'
	// 		}
	// 	},
	// 	appearance: {
	// 		type: 'string',
	// 		options: ['subtle', 'outline', 'secondary', 'primary', 'transparent'],
	// 		control: {
	// 			type: 'select'
	// 		}
	// 	}
	// } satisfies ArgTypes;

	// const default_args: Partial<Record<keyof typeof argTypes, any>> = {
	// 	size: 'md',
	// 	appearance: 'secondary',
	// 	shape: 'rounded'
	// };

	const { Story } = defineMeta({
		title: 'Components/Button',
		component: Button,

	});
</script>

<script>
	// let theme = webLightTheme;

	// onMount(() => {
	// 	function handler(schemeMedia: MediaQueryListEvent) {
	// 		theme = schemeMedia.matches ? webLightTheme : webDarkTheme;
	// 	}

	// 	const schemeMedia = matchMedia('(prefers-color-scheme: light)');

	// 	schemeMedia.addEventListener('change', handler);

	// 	theme = schemeMedia.matches ? webLightTheme : webDarkTheme;

	// 	return () => {
	// 		schemeMedia.removeEventListener('change', handler);
	// 	};
	// });
</script>

<!-- content here -->
<Story id="b" name="Button T">
	{#snippet children(args)}
		<Button {...args} />
	{/snippet}
</Story>
