// helper functions for local storage
// ensure twisted threads data is namespaced
// and catch errors
// LS is used for recent patterns when the user is not logged in
// note local storage is insecure
// We could use IndexedBD but that requires the user to give permission
const LS_PREFIX = 'twistedthreads';

export const setLocalStorageItem = (key, item) => {
	try {
		localStorage.setItem(`${LS_PREFIX}${key}`, item);
	} catch (err) {
		return '';
	}
};

export const getLocalStorageItem = (key) => {
	try {
		return localStorage.getItem(`${LS_PREFIX}${key}`);
	} catch (err) {
		return '';
	}
};
