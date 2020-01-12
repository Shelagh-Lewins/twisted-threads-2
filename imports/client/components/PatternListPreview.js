// short list of patterns of a particular type
// displayed on home page
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
	Button,
	Col,
	Container,
	Row,
} from 'reactstrap';

import PatternSummary from './PatternSummary';
import './PatternListPreview.scss';

import getCSSVariables from '../modules/getCSSVariables';


const PatternListPreview = (props) => {
	const {
		dispatch,
		listName,
		patterns,
		patternPreviews,
		tags,
		url,
		users,
		width,
	} = props;

	// find the pattern summary dimensions from variables.scss
	const importedStyles = getCSSVariables()[0].style;
	const patternSummaryWidth = parseInt(importedStyles.width, 10);
	const patternSummaryMarginRight = parseInt(importedStyles['margin-right'], 10);

	const patternListPreviewPadding = parseInt(importedStyles['margin-right'], 10);

	const widthPerPatternSummary = patternSummaryWidth + patternSummaryMarginRight;

	// find the number of pattern previews that will fit on one line
	const paddingX = 2 * patternListPreviewPadding;
	const numberOfPatternSummaries = Math.floor((width - paddingX) / widthPerPatternSummary);

	const patternsToShow = patterns.slice(0, numberOfPatternSummaries);

	const divWidth = numberOfPatternSummaries * widthPerPatternSummary + paddingX;

	return (
		<div
			className="pattern-list-preview"
			style={{ 'width': divWidth }}
		>
			<h1>{listName}</h1>
			<Button
				className="more"
				color="secondary"
				tag={Link}
				to={url}
			>
				More...
			</Button>
			<ul>
				{patternsToShow.map((pattern) => {
					const { _id, createdBy, 'tags': patternTags } = pattern;

					const tagTexts = [];

					// ensure tags subscription is ready
					if (patternTags && tags && tags.length > 0) {
						patternTags.forEach((patternTag) => {
							const tagObject = tags.find((tag) => tag._id === patternTag);
							if (tagObject && tagObject.name) {
								tagTexts.push(tagObject.name);
							}
						});
					}

					return (
						<div key={`pattern-summary-${url}-${_id}`}>
							<PatternSummary
								pattern={pattern}
								dispatch={dispatch}
								patternPreview={patternPreviews.find((patternPreview) => patternPreview.patternId === _id)}
								tagTexts={tagTexts}
								user={users.find((user) => user._id === createdBy)}
							/>
						</div>
					);
				})}
			</ul>
		</div>
	);
};

PatternListPreview.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'listName': PropTypes.string.isRequired,
	'patternPreviews': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
	'tags': PropTypes.arrayOf(PropTypes.any).isRequired,
	'users': PropTypes.arrayOf(PropTypes.any).isRequired,
	'url': PropTypes.string.isRequired,
	'width': PropTypes.number.isRequired,
};

export default PatternListPreview;
