import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

import PatternSummary from './PatternSummary';
import Pagination from './Pagination';
import { changePage } from '../modules/pattern';
import { ITEMS_PER_PAGE } from '../../modules/parameters';

class PatternList extends PureComponent {
	render() {
		const {
			currentPageNumber,
			dispatch,
			history,
			patternCount,
			patterns,
			patternPreviews,
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
				<Col lg="12">
					{patterns.map((pattern) => (
						<PatternSummary
							key={pattern._id}
							name={pattern.name}
							_id={pattern._id}
							dispatch={dispatch}
							patternPreview={patternPreviews.find((patternPreview) => patternPreview.patternId === pattern._id)}
						/>
					))}
				</Col>
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
};

export default PatternList;
