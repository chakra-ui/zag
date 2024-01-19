import { getControlDefaults, type ControlRecord, deepSet } from '@zag-js/shared';

export function useControls<T extends ControlRecord>(config: T) {
	const state = $state(getControlDefaults(config));

	const controls = {
		get config() {
			return config;
		},
		get state() {
			return state;
		},
		setState(key: string, value: any) {
			deepSet(state, key, value);
		}
	};

	return controls;
}

export type UseControlsReturn<T extends ControlRecord = ControlRecord> = ReturnType<
	typeof useControls<T>
>;
