// test whether uploaded string from file is a valid pattern format
// JSON for TWT2
// XML for GTT

export const testJSON = (text) => {
	if (typeof text!=='string'){
		return false;
	}
	try{
		JSON.parse(text);
		return true;
	}
	catch (error){
		return false;
	}
};
