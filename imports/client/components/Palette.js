import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { PhotoshopPicker } from 'react-color';
import PropTypes from 'prop-types';
import './Palette.scss';

class Palette extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'isEditing': false,
			'newColor': props.palette[props.selectedColorIndex],
			'showEditColorPanel': false,
		};

		this.handleClickDone = this.handleClickDone.bind(this);
		this.handleClickEdit = this.handleClickEdit.bind(this);
		this.handleClickPaletteCell = this.handleClickPaletteCell.bind(this);
		this.handleColorChange = this.handleColorChange.bind(this);
		this.acceptColorChange = this.acceptColorChange.bind(this);
		this.cancelColorChange = this.cancelColorChange.bind(this);
	}

	handleClickDone() {
		this.setState({
			'isEditing': false,
			'showEditColorPanel': false,
		});
	}

	handleClickEdit() {
		this.setState({
			'isEditing': true,
			'showEditColorPanel': true,
		});
	}

	handleClickPaletteCell(colorIndex) {
		const { palette, selectColor, selectedColorIndex } = this.props;
		const { isEditing, showEditColorPanel } = this.state;

		if (isEditing) {
			if (!showEditColorPanel) {
				// open edit color panel
				this.setState({
					'showEditColorPanel': true,
				});
			} else if (colorIndex === selectedColorIndex) {
				// close edit color panel if you click the same color again, otherwise just switch to the new color
				this.setState({
					'showEditColorPanel': false,
				});
			}
		}

		selectColor(colorIndex);

		this.setState({
			'newColor': palette[colorIndex],
		});
	}

	acceptColorChange() {
		const { handleEditColor } = this.props;
		const { newColor } = this.state;

		handleEditColor(newColor);

		this.setState({
			'showEditColorPanel': false,
		});
	}

	cancelColorChange() {
		this.setState({
			'showEditColorPanel': false,
		});
	}

	handleColorChange(colorObject) {
		this.setState({
			'newColor': colorObject.hex,
		});
	}

	renderColors() {
		const { palette, selectedColorIndex } = this.props;

		return palette.map((color, colorIndex) => {
			const identifier = `palette-color-${colorIndex}`;

			// eslint doesn't associate the label with the span, so I've disabled the rule
			return (
				<label // eslint-disable-line jsx-a11y/label-has-associated-control
					htmlFor={identifier}
					key={identifier} // eslint-disable-line react/no-array-index-key
				>
					Color
					<span // eslint-disable-line jsx-a11y/control-has-associated-label
						className={`color ${selectedColorIndex === colorIndex ? 'selected' : ''}`}
						id={identifier}
						name={identifier}

						onClick={() => this.handleClickPaletteCell(colorIndex)}
						onKeyPress={() => this.handleClickPaletteCell(colorIndex)}
						role="button"
						style={{ 'backgroundColor': color }}
						tabIndex="0"
					/>
				</label>
			);
		});
	}

	renderEditColorPanel() {
		const { newColor } = this.state;

		return (
			<PhotoshopPicker
				color={newColor}
				onChangeComplete={this.handleColorChange}
				onAccept={this.acceptColorChange}
				onCancel={this.cancelColorChange}
			/>
		);
	}

	render() {
		const { isEditing, showEditColorPanel } = this.state;

		return (
			<div className="palette">
				<h3>Palette</h3>
				{showEditColorPanel && this.renderEditColorPanel()}
				<div className="controls">
					{isEditing
						? <Button color="secondary" onClick={this.handleClickDone}>Done</Button>
						: <Button color="secondary" onClick={this.handleClickEdit}>Edit colors</Button>}
				</div>
				{this.renderColors()}
			</div>
		);
	}
}


Palette.propTypes = {
	'handleEditColor': PropTypes.func.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'selectColor': PropTypes.func.isRequired,
	'selectedColorIndex': PropTypes.number.isRequired,
};

export default Palette;
