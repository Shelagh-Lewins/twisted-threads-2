import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button, ButtonGroup, ButtonToolbar } from 'reactstrap';
import { PhotoshopPicker } from 'react-color';
import PropTypes from 'prop-types';
import { SVGPaletteEmpty } from '../modules/svg';
import './Palette.scss';

class Palette extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'editMode': 'colorPicker',
			'isEditing': false,
			'newColor': props.palette[props.selectedColorIndex],
			'showEditColorPanel': false,
		};

		// Color picker is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'color-picker-holder';

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickDone',
			'handleClickEdit',
			'handleClickColor',
			'handleClickEmptyHole',
			'handleColorChange',
			'acceptColorChange',
			'cancelColorChange',
			'handleClickEditMode',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.body.appendChild(this.el);
	}

	componentWillUnmount() {
		document.body.removeChild(this.el);
	}

	handleClickDone() {
		this.setState({
			'isEditing': false,
			'showEditColorPanel': false,
		});
	}

	handleClickEdit() {
		const { selectColor, selectedColorIndex } = this.props;

		// cannot edit empty hole cell
		if (selectedColorIndex === -1) {
			selectColor(0);
		}

		this.setState({
			'isEditing': true,
			'showEditColorPanel': true,
		});
	}

	handleClickColor(colorIndex) {
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

	handleClickEmptyHole() {
		const { selectColor } = this.props;
		const { isEditing } = this.state;

		if (isEditing) {
			return; // cannot edit empty hole cell
		}

		selectColor(-1);
	}

	handleClickEditMode(event) {
		this.setState({
			'editMode': event.target.value,
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

	renderEmptyHole() {
		const { selectedColorIndex } = this.props;
		const { isEditing } = this.state;

		return (
			<label // eslint-disable-line jsx-a11y/label-has-associated-control
				htmlFor="empty-hole"
				title="Empty hole"
			>
				Empty hole
				<span // eslint-disable-line jsx-a11y/control-has-associated-label
					className={`empty-hole ${selectedColorIndex === -1 ? 'selected' : ''}`}
					id="empty-hole"
					name="empty-hole"

					onClick={() => this.handleClickEmptyHole()}
					onKeyPress={() => this.handleClickEmptyHole()}
					role="button"
					tabIndex="0"
				>
					<SVGPaletteEmpty
						stroke={isEditing ? '#666' : '#000'}
					/>
				</span>
			</label>
		);
	}

	renderColors() {
		const { palette, selectedColorIndex } = this.props;

		return (
			<div className="color-holder">
				{palette.map((color, colorIndex) => {
					const identifier = `palette-color-${colorIndex}`;

					// eslint doesn't associate the label with the span, so I've disabled the rule
					return (
						<label // eslint-disable-line jsx-a11y/label-has-associated-control
							htmlFor={identifier}
							key={identifier} // eslint-disable-line react/no-array-index-key
							title="Thread color"
						>
							Thread color
							<span // eslint-disable-line jsx-a11y/control-has-associated-label
								className={`color ${selectedColorIndex === colorIndex ? 'selected' : ''}`}
								id={identifier}
								name={identifier}

								onClick={() => this.handleClickColor(colorIndex)}
								onKeyPress={() => this.handleClickColor(colorIndex)}
								role="button"
								style={{ 'backgroundColor': color }}
								tabIndex="0"
							/>
						</label>
					);
				})}
			</div>
		);
	}

	renderEditColorPanel() {
		const { editMode, newColor } = this.state;

		if (editMode === 'colorPicker') {
			return (
				ReactDOM.createPortal(
					<PhotoshopPicker
						color={newColor}
						onChangeComplete={this.handleColorChange}
						onAccept={this.acceptColorChange}
						onCancel={this.cancelColorChange}
					/>,
					this.el,
				)
			);
		}
		return;
	}

	renderEditOptions() {
		const { editMode } = this.state;
		const options = [
			{
				'name': 'Color picker',
				'value': 'colorPicker',
			},
			{
				'name': 'Color books',
				'value': 'colorBooks',
			},
		];

		return (
			<>
				<ButtonToolbar>
					<ButtonGroup className="edit-mode">
						{options.map((option) => (
							<Button
								className={editMode === option.value ? 'selected' : ''}
								color="info"
								key={option.value}
								onClick={this.handleClickEditMode}
								value={option.value}
							>
								{option.name}
							</Button>
						))}
					</ButtonGroup>
				</ButtonToolbar>
			</>
		);
	}

	render() {
		const { isEditing, showEditColorPanel } = this.state;

		return (
			<div className={`palette ${isEditing ? 'editing' : ''}`}>
				{showEditColorPanel && this.renderEditColorPanel()}

				<div className="controls">
					{isEditing && this.renderEditOptions()}
					<div className="toggle">
						{isEditing
							? <Button color="secondary" onClick={this.handleClickDone}>Done</Button>
							: <Button color="secondary" onClick={this.handleClickEdit}>Edit thread colors</Button>}
					</div>
				</div>
				{this.renderEmptyHole()}
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
