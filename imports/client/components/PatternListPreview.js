// short list of patterns of a particular type
// displayed on home page
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';

import PatternSummary from './PatternSummary';
import './ItemListPreview.scss';

import getListPreviewDimensions from '../modules/getListPreviewDimensions';


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

	const { divWidth, numberToShow } = getListPreviewDimensions(width);

	const patternsToShow = patterns.slice(0, numberToShow);

	return (
		<div
			className="item-list-preview"
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
			{patternsToShow.length === 0 && (
				<div>No patterns to show</div>
			)}
			{patternsToShow.length > 0 && (
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
							<div key={`item-summary-${url}-${_id}`}>
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
			)}
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
