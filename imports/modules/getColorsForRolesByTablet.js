// get colors for forward, backward roles in broken twill
// gets colors for tablets following a certain point
// to allow colours to be recreated when tablets are added / removed

import {
	BROKEN_TWILL_THREADING,
} from './parameters';

const getColorsForRolesByTablet = ({
	holes,
	numberOfTablets,
	startAt,
	threading,
	threadingStructure,
}) => {
	// find the foreground / background colour for each tablet from the start point onwards
	const colorsForRolesByTablet = [];
//console.log('in fn, threading', threading);
//console.log('numberOfTablets', numberOfTablets);
//console.log('startAt', startAt);
	// record colour roles for each tablet from the change onwards
	for (let i = startAt; i < numberOfTablets; i += 1) {
		const colorRolesForTablet = {};

		for (let j = 0; j < holes; j += 1) {
			const cellColorIndex = threadingStructure === 'byHole'
				? threading[j][i] : threading[i][j];
//console.log('cellColorIndex', cellColorIndex);
			if (BROKEN_TWILL_THREADING[j % holes][i % holes] === 'F') {
				colorRolesForTablet.F = cellColorIndex;
			} else if (BROKEN_TWILL_THREADING[j % holes][i % holes] === 'B') {
				colorRolesForTablet.B = cellColorIndex;
			}

			if (colorRolesForTablet.B && colorRolesForTablet.F) {
				//console.log('break');
				break;
			}
		}
		colorsForRolesByTablet.push(colorRolesForTablet);
	}
//console.log('about to return', colorsForRolesByTablet);
	return colorsForRolesByTablet;
};

export default getColorsForRolesByTablet;
