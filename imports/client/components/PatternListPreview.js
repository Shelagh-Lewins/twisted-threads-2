// short list of patterns of a particular type
// displayed on home page
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
	Col,
	Container,
	Row,
} from 'reactstrap';

import PatternSummary from './PatternSummary';

import './PatternListPreview.scss';

const PatternListPreview = (props) => {
	const {
		dispatch,
		listName,
		patterns,
		patternPreviews,
		tags,
		url,
		users,
	} = props;

	return (
		<div className="pattern-list-preview">
			<h1>{listName}</h1>
			<Link to={url}>More...</Link>
			<ul>
				{patterns.map((pattern) => {
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
};

export default PatternListPreview;
