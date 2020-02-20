// migrate threading, palette and design charts
// move weavingInstructions and picks into patternDesign
// leave threading and palette outside
// so patternDesign holds everything that varies with pattern type
import {
	Patterns,
} from '../../imports/modules/collection';
import {
	DEFAULT_PALETTE,
} from '../../imports/modules/parameters';

const migratePatternsDesign = () => {
	console.log('*** starting to migrate pattern design');
	// initially, work with one single pattern, simulation / auto
	// RabtJrCDWfpf489je from TWT1

	// compare with new pcwWAm9B9WsxxBrEs from TWT2
	const testPattern = Patterns.findOne({ '_id': 'RabtJrCDWfpf489je' });
	//console.log('testPattern', testPattern);

	const simStyes = JSON.parse('[{\"background_color\":\"#cc0000\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":1},{\"background_color\":\"#ffd966\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":2},{\"background_color\":\"#1c4587\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":3},{\"background_color\":\"#6aa84f\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":4},{\"background_color\":\"#674ea7\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":5,\"special\":false},{\"background_color\":\"#783f04\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":6,\"special\":false},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffffff\",\"warp\":\"none\",\"style\":7},{\"background_color\":\"#ffffff\",\"line_color\":\"#cc0000\",\"warp\":\"forward\",\"style\":8},{\"background_color\":\"#ffffff\",\"line_color\":\"#cc0000\",\"warp\":\"backward\",\"style\":9},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#cc0000\",\"warp\":\"forward\",\"style\":10,\"special\":false},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#cc0000\",\"warp\":\"backward\",\"style\":11,\"special\":false},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffd966\",\"warp\":\"forward\",\"style\":12,\"special\":false},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffd966\",\"warp\":\"backward\",\"style\":14,\"special\":false},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffd966\",\"warp\":\"forward\",\"style\":14},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffd966\",\"warp\":\"backward\",\"style\":15},{\"background_color\":\"#ffffff\",\"line_color\":\"#1c4587\",\"warp\":\"forward\",\"style\":16},{\"background_color\":\"#ffffff\",\"line_color\":\"#1c4587\",\"warp\":\"backward\",\"style\":17},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#1c4587\",\"warp\":\"forward\",\"style\":18},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#1c4587\",\"warp\":\"backward\",\"style\":19},{\"background_color\":\"#ffffff\",\"line_color\":\"#6aa84f\",\"warp\":\"forward\",\"style\":20},{\"background_color\":\"#ffffff\",\"line_color\":\"#6aa84f\",\"warp\":\"backward\",\"style\":21},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#6aa84f\",\"warp\":\"forward\",\"style\":22},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#6aa84f\",\"warp\":\"backward\",\"style\":23},{\"background_color\":\"#ffffff\",\"line_color\":\"#674ea7\",\"warp\":\"forward\",\"style\":24},{\"background_color\":\"#ffffff\",\"line_color\":\"#674ea7\",\"warp\":\"backward\",\"style\":25},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#674ea7\",\"warp\":\"forward\",\"style\":26},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#674ea7\",\"warp\":\"backward\",\"style\":27},{\"background_color\":\"#ffffff\",\"line_color\":\"#783f04\",\"warp\":\"forward\",\"style\":28},{\"background_color\":\"#ffffff\",\"line_color\":\"#783f04\",\"warp\":\"backward\",\"style\":29},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#783f04\",\"warp\":\"forward\",\"style\":30},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#783f04\",\"warp\":\"backward\",\"style\":31},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffffff\",\"warp\":\"forward\",\"style\":32},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffffff\",\"warp\":\"backward\",\"style\":33},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffffff\",\"warp\":\"forward\",\"style\":34},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffffff\",\"warp\":\"backward\",\"style\":35},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffffff\",\"warp\":\"forward_empty\",\"style\":36},{\"background_color\":\"#ffffff\",\"line_color\":\"#ffffff\",\"warp\":\"backward_empty\",\"style\":37},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffffff\",\"warp\":\"forward_empty\",\"style\":40},{\"background_color\":\"#bbbbbb\",\"line_color\":\"#ffffff\",\"warp\":\"backward_empty\",\"style\":41}]');

	const simSpecialStyles = JSON.parse('[{\"background_color\":\"#FFFFFF\",\"name\":\"forward_2\",\"warp\":\"forward\",\"image\":\"/images/special_forward_2.svg\",\"style\":\"S1\"},{\"background_color\":\"#FFFFFF\",\"name\":\"backward_2\",\"warp\":\"backward\",\"image\":\"/images/special_backward_2.svg\",\"style\":\"S2\"},{\"background_color\":\"#FFFFFF\",\"name\":\"forward_3\",\"warp\":\"forward\",\"image\":\"/images/special_forward_3.svg\",\"style\":\"S3\"},{\"background_color\":\"#FFFFFF\",\"name\":\"backward_3\",\"warp\":\"backward\",\"image\":\"/images/special_backward_3.svg\",\"style\":\"S4\"},{\"background_color\":\"#FFFFFF\",\"name\":\"forward_4\",\"warp\":\"forward\",\"image\":\"/images/special_forward_4.svg\",\"style\":\"S5\"},{\"background_color\":\"#FFFFFF\",\"name\":\"backward_4\",\"warp\":\"backward\",\"image\":\"/images/special_backward_4.svg\",\"style\":\"S6\"},{\"background_color\":\"#FFFFFF\",\"image\":\"/images/special_empty.svg\",\"style\":\"S7\"},{\"background_color\":\"#FFFFFF\",\"image\":\"\",\"style\":\"S8\"},{\"background_color\":\"#BBBBBB\",\"name\":\"backward_2_gray\",\"warp\":\"backward\",\"image\":\"/images/special_backward_2.svg\",\"style\":\"S9\"},{\"background_color\":\"#BBBBBB\",\"name\":\"forward_2_gray\",\"warp\":\"forward\",\"image\":\"/images/special_forward_2.svg\",\"style\":\"S10\"},{\"background_color\":\"#BBBBBB\",\"name\":\"backward_3_gray\",\"warp\":\"backward\",\"image\":\"/images/special_backward_3.svg\",\"style\":\"S11\"},{\"background_color\":\"#BBBBBB\",\"name\":\"forward_3_gray\",\"warp\":\"forward\",\"image\":\"/images/special_forward_3.svg\",\"style\":\"S12\"},{\"background_color\":\"#BBBBBB\",\"name\":\"backward_4_gray\",\"warp\":\"backward\",\"image\":\"/images/special_backward_4.svg\",\"style\":\"S13\"},{\"background_color\":\"#BBBBBB\",\"name\":\"forward_4_gray\",\"warp\":\"forward\",\"image\":\"/images/special_forward_4.svg\",\"style\":\"S14\"},{\"background_color\":\"#FFFFFF\",\"name\":\"idle\",\"image\":\"/images/special_idle.svg\",\"style\":\"S15\"},{\"background_color\":\"#FFFFFF\",\"image\":\"\",\"style\":\"S16\"}]');
	console.log('');
	console.log('default old simStyes', simStyes);
	console.log('');
	console.log('default old simSpecialStyles', simSpecialStyles);
	console.log('');

	const {
		_id,
		auto_turn_sequence,
		edit_mode, // simulation, freehand or broken twill
		// numberOfRows,
		numberOfTablets,
		simulation_mode, // for simulation patterns, auto or manual
		special_styles,
		styles,
		threading,
		weft_color,
	} = testPattern;
	const holes = 4; // TWT1 only had 4-hole tablets

	const oldStyles = JSON.parse(styles);
	const oldSpecialStyles = JSON.parse(special_styles);
	const oldThreading = JSON.parse(threading);

	console.log('oldStyles', oldStyles);
	console.log('oldSpecialStyles', oldSpecialStyles);
	console.log('oldThreading', oldThreading);

	// number of rows, tablets have been read from old data
	// but let's make sure they are correct
	let newNumberOfRows;
	let newNumberOfTablets = threading[0].length;
	const newPalette = DEFAULT_PALETTE;
	const newThreading = [];
	let newPatternType;
	const newPatternDesign = {};

	// palette
	if (testPattern.edit_mode === 'simulation') {
		// simulation patterns only have 7 thread colours
		for (let i = 0; i < 7; i += 1) {
			newPalette[i] = oldStyles[i].line_color;
		}

		console.log('newPalette', newPalette);

		// threading
		for (let i = 0; i < holes; i += 1) {
			newThreading[i] = [];

			for (let j = 0; j < newNumberOfTablets; j += 1) {
				const oldStyle = oldThreading[i][j];

				if (oldStyle === 'S7') {
					newThreading[i][j] = -1; // empty hole
				} else {
					newThreading[i][j] = oldStyle - 1; // old styles start at 1
				}
			}
		}

		console.log('newThreading', newThreading);

		// patternDesign
		if (simulation_mode === 'auto') {
			newPatternType = 'allTogether';
			newPatternDesign.weaviingInstructions = auto_turn_sequence;
			newNumberOfRows = auto_turn_sequence.length; // just in case of error in old data
			Patterns.update({ _id }, {
				'numberOfRows': newNumberOfRows,
				'numberOfTablets': newNumberOfTablets,
				'palette': newPalette,
				'patternDesign': newPatternDesign,
				'patternType': newPatternType,
				'threading': newThreading,
				'weftColor': weft_color,
			});
		} else if (simulation_mode === 'manual') {
			newPatternType = 'individual';
		} else {
			console.log('pattern has unrecognised simulation_mode', _id);
		}

		// delete old fields
		console.log('*** finished migrating pattern design');

		// preview_rotation

		// weft_color
	}
};

export default migratePatternsDesign;
