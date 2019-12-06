import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

import { removePattern } from '../modules/pattern';
import './PatternSummary.scss';
// import * as url from '../../../test/up.png';

class PatternSummary extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'gotSVG': false,
		};

		// this.myRef = React.createRef();
	}

	componentDidUpdate = () => {
		// to center the SVG, we need to know its width
		/* const { gotSVG } = this.state;
		const outerElm = this.myRef.current; // preview bounding div
		const innerElm = outerElm.getElementsByTagName('svg')[0]; // svg
		if (innerElm && !gotSVG) {
			const outerRectWidth = outerElm.getBoundingClientRect().width;
			const innerRectWidth = innerElm.getBoundingClientRect().width;

			if (outerRectWidth > innerRectWidth) {
				innerElm.style.marginLeft = `${(outerRectWidth - innerRectWidth) / 2}px`;
			}

			this.setState({
				'gotSVG': true,
			});
		} */
	};

	render() {
		const {
			name,
			_id,
			dispatch,
			patternPreview,
		} = this.props;

		const handleClickButtonRemove = function () {
			const response = confirm(`Do you want to delete the pattern "${name}"?`); // eslint-disable-line no-restricted-globals

			if (response === true) {
				dispatch(removePattern(_id));
			}
		};

		// import the preview svg data
		let clean = '';
		let previewStyle = {};

		if (patternPreview) {
			// clean = DOMPurify.sanitize(patternPreview.data);
		// }

			previewStyle = { 'backgroundImage': `url(${patternPreview.uri})` };
		}
		const patternPreviewHolder = <div style={previewStyle} className="pattern-preview" />;

		// const patternPreviewHolder = <div style={previewStyle} ref={this.myRef} className="pattern-preview" />;

		const buttonRemove = (
			<Button
				type="button"
				color="danger"
				onClick={() => handleClickButtonRemove(_id)}
			>
			X
			</Button>
		);

		return (
			<div className="pattern-summary">
				<div className="main">
					<Link to={`/pattern/${_id}`}>
						<h3>{name}</h3>
						{patternPreviewHolder}
					</Link>

				</div>
				<div className="footer">
					{buttonRemove}
				</div>
			</div>
		);
	}
}

PatternSummary.propTypes = {
	'_id': PropTypes.string.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'name': PropTypes.string.isRequired,
	'patternPreview': PropTypes.objectOf(PropTypes.any),
};

export default PatternSummary;
