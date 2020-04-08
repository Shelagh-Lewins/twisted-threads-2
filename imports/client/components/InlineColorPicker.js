import React, { Component } from 'react';
import { PhotoshopPicker } from 'react-color';
import PropTypes from 'prop-types';
import './InlineColorPicker.scss';

class InlineColorPicker extends Component {
	constructor(props) {
		super(props);

		this.pickerRef = React.createRef();
	}

	componentDidMount() {
		const children = this.pickerRef.current.querySelectorAll('div');
		const childArray = Array.from(children);

		// customise button text for static panel
		const okButton = childArray.find((node) => node.innerHTML === 'OK');
		okButton.innerHTML = 'Apply colour';

		const cancelButton = childArray.find((node) => node.innerHTML === 'Cancel');
		cancelButton.style.visibility = 'hidden';

		const header = childArray.find((node) => node.innerHTML === 'Color Picker');
		header.style.display = 'none';
	}

	render() {
		const {
			color,
			onAccept,
			onChangeComplete,
		} = this.props;

		return (
			<div className="inline-color-picker" ref={this.pickerRef}>
				<PhotoshopPicker
					color={color}
					onAccept={onAccept}
					onCancel={() => {}}
					onChangeComplete={onChangeComplete}
				/>
			</div>
		);
	}
}

InlineColorPicker.propTypes = {
	'color': PropTypes.string.isRequired,
	'onAccept': PropTypes.func.isRequired,
	'onChangeComplete': PropTypes.func.isRequired,
};

export default InlineColorPicker;
