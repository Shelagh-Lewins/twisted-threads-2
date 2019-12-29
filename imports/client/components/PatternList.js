import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

import PatternSummary from './PatternSummary';
import Pagination from './Pagination';
import { changePage, editIsPublic, removePattern } from '../modules/pattern';
import { ITEMS_PER_PAGE } from '../../modules/parameters';

class PatternList extends PureComponent {
	onChangeIsPublic = ({ _id, isPublic }) => {
		const { dispatch } = this.props;

		dispatch(editIsPublic({ _id, isPublic }));
	};

	handleClickButtonRemove = ({ _id, name }) => {
		const { dispatch } = this.props;
		const response = confirm(`Do you want to delete the pattern "${name}"?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removePattern(_id));
		}
	};

	render() {
		const {
			currentPageNumber,
			dispatch,
			history,
			patternCount,
			patterns,
			patternPreviews,
			tags,
			users,
		} = this.props;

		const pagination = patternCount > ITEMS_PER_PAGE ? (
			<Pagination
				handlePageClick={(data) => dispatch(changePage(data.selected, history))}
				initialPage={currentPageNumber - 1}
				pageCount={Math.ceil(patternCount / ITEMS_PER_PAGE)}
			/>
		) : '';

		return (
			<Row className="pattern-list">
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
						<Col lg="6" key={`pattern-summary-${_id}`}>
							<PatternSummary
								pattern={pattern}
								dispatch={dispatch}
								handleClickButtonRemove={this.handleClickButtonRemove}
								onChangeIsPublic={this.onChangeIsPublic}
								patternPreview={patternPreviews.find((patternPreview) => patternPreview.patternId === _id)}
								tagTexts={tagTexts}
								user={users.find((user) => user._id === createdBy)}
							/>
						</Col>
					);
				})}
				<Col lg="12">
					{pagination}
				</Col>
			</Row>
		);
	}
}

PatternList.propTypes = {
	'currentPageNumber': PropTypes.number,
	'dispatch': PropTypes.func.isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'patternCount': PropTypes.number.isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patternPreviews': PropTypes.arrayOf(PropTypes.any).isRequired,
	'tags': PropTypes.arrayOf(PropTypes.any).isRequired,
	'users': PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default PatternList;
