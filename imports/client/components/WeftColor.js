import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { PhotoshopPicker } from 'react-color';
import { editWeftColor } from '../modules/pattern';
import './WeftColor.scss';

class WeftColor extends PureComponent {
// export default function WeftColor({ dispatch, weftColor }) {
	constructor(props) {
		super(props);

		this.state = {
			'newColor': props.weftColor,
			'showColorPicker': false,
		};

		// Color picker is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'weft-color-picker-holder';

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickColor',
			'acceptColorChange',
			'cancelColorChange',
			'handleColorChange',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.body.appendChild(this.el);
	}

	handleClickColor() {
		const { showColorPicker } = this.state;

		this.setState({
			'showColorPicker': !showColorPicker,
		});
	}

	acceptColorChange() {
		const { _id, dispatch } = this.props;
		const { newColor } = this.state;

		dispatch(editWeftColor({
			_id,
			'colorHexValue': newColor,
		}));

		this.setState({
			'showColorPicker': false,
		});
	}

	cancelColorChange() {
		this.setState({
			'showColorPicker': false,
		});
	}

	handleColorChange(colorObject) {
		this.setState({
			'newColor': colorObject.hex,
		});
	}

	renderEditColorPanel() {
		const { newColor } = this.state;

		return (
			ReactDOM.createPortal(
				<div className="weft-color-picker">
					<PhotoshopPicker
						color={newColor}
						onChangeComplete={this.handleColorChange}
						onAccept={this.acceptColorChange}
						onCancel={this.cancelColorChange}
					/>
				</div>,
				this.el,
			)
		);
	}

	render() {
		const { weftColor } = this.props;
		const { showColorPicker } = this.state;

		return (
			<div className="set-weft-color">
				<label htmlFor="edit-weft-color" className="text">
					<span className="text">Weft color:</span>
					<span
						aria-label="Change weft color"
						className="color"
						id="edit-weft-color"
						style={{ 'background': weftColor }}
						type="button"
						onClick={() => this.handleClickColor()}
						onKeyPress={() => this.handleClickColor()}
						role="button"
						tabIndex="0"
						title="Change weft color"
					/>
				</label>
				{showColorPicker && this.renderEditColorPanel()}
			</div>
		);
	}
}

WeftColor.propTypes = {
	'_id': PropTypes.string.isRequired, // pattern id
	'dispatch': PropTypes.func.isRequired,
	'weftColor': PropTypes.string.isRequired,
};

export default WeftColor;
