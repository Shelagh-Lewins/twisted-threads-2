import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import InlineColorPicker from './InlineColorPicker';
import { editWeavingBackwardsBackgroundColor } from '../modules/auth';
import { DEFAULT_WEAVING_BACKWARDS_BACKGROUND_COLOR } from '../../modules/parameters';
import './EditBackwardsBackgroundColor.scss';

class EditBackwardsBackgroundColor extends PureComponent {
	constructor(props) {
		super(props);
console.log('HERE!!!');
		const {
			weavingBackwardsBackgroundColor,
		} = this.props;
console.log('weavingBackwardsBackgroundColor constructor', weavingBackwardsBackgroundColor);
		this.state = {
			'isEditing': false,
			'colorValue': weavingBackwardsBackgroundColor,
			// 'pickerReinitialize': false,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'restoreDefaultColor',
			'toggleIsEditing',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidUpdate(prevProps) {
		const {
			weavingBackwardsBackgroundColor,
		} = this.props;

		if (weavingBackwardsBackgroundColor !== prevProps.weavingBackwardsBackgroundColor) {
			this.setState({
				'colorValue': weavingBackwardsBackgroundColor,
			});
		}
	}

	acceptColorChange = () => {
		const { dispatch } = this.props;
		const { colorValue } = this.state;

		dispatch(editWeavingBackwardsBackgroundColor(colorValue));
	}

	handleColorChange = (colorObject) => {
		this.setState({
			'colorValue': colorObject.hex,
		});
	}

	toggleIsEditing() {
		const { isEditing } = this.state;

		this.setState({
			'isEditing': !isEditing,
		});
	}

	restoreDefaultColor() {
		const { dispatch } = this.props;

		const response = confirm('Are you sure you want to restore the default colour for backwards turning cells?'); // eslint-disable-line no-restricted-globals

		if (response === true) {
			this.setState({
				'colorValue': DEFAULT_WEAVING_BACKWARDS_BACKGROUND_COLOR,
			});

			dispatch(editWeavingBackwardsBackgroundColor(DEFAULT_WEAVING_BACKWARDS_BACKGROUND_COLOR));
		}
	}

	renderColorSwatch() {
		const {
			colorValue,
		} = this.state;

		return (
			<>
				<span className="text">Background colour for backwards turning cells:</span>
				<span
					className="background-color-swatch"
					id="background-color-swatch"
				/>
				<p className="hint">This is the colour you see in the weaving chart for all patterns. It does not affect the colour seen by any other user.</p>
				<InlineColorPicker
					color={colorValue}
					onAccept={this.acceptColorChange}
					onChangeComplete={this.handleColorChange}
				/>
			</>
		);
	}

	render() {
		const {
			isEditing,
		} = this.state;

		return (
			<div className={`color-weaving-backwards-bg clearing ${isEditing ? 'editing' : ''}`}>
				<div className="controls">
					{isEditing
						? <Button color="primary" onClick={this.toggleIsEditing}>Done</Button>
						: <Button color="primary" onClick={this.toggleIsEditing}>Edit backwards turning colour</Button>}
					{!isEditing && <Button color="primary" onClick={this.restoreDefaultColor}>Restore default color</Button>}
				</div>
				{isEditing && (
					<div className="content">
						{this.renderColorSwatch()}
						<div className="clearing" />
					</div>
				)}
			</div>
		);
	}
}

EditBackwardsBackgroundColor.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'weavingBackwardsBackgroundColor': PropTypes.string.isRequired,
};

function mapStateToProps(state) {
	return {
		'weavingBackwardsBackgroundColor': state.auth.weavingBackwardsBackgroundColor,
	};
}

export default connect(mapStateToProps)(EditBackwardsBackgroundColor);
