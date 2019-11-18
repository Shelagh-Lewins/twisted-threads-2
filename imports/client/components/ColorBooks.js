// view and edit the user's color books

import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';
import { PhotoshopPicker } from 'react-color';
import PropTypes from 'prop-types';
import { addColorBook, editColorBookColor } from '../modules/pattern';
import AddColorBookForm from './AddColorBookForm';
import './ColorBooks.scss';

// colors have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

class ColorBooks extends PureComponent {
	constructor(props) {
		super(props);

		const { colorBooks } = props;

		this.state = {
			'isEditing': false,
			'newColor': '',
			'selectedColorBook': colorBooks[0]._id,
			'selectedColorIndex': 0,
			'showEditColorPanel': false,
		};

		// Color picker is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'edit-color-holder';

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickColor',
			'handleClickAddColorBook',
			'handleChangeColorBook',
			'handleClickDone',
			'handleClickEdit',
			'handleColorChange',
			'acceptColorChange',
			'cancelColorChange',
			'selectColor',
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

	selectColor(index) {
		this.setState({
			'selectedColorIndex': index,
		});
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

	handleClickColor(colorIndex) {
		const { colorBooks, onSelectColor } = this.props;
		const {
			isEditing,
			showEditColorPanel,
			selectedColorBook,
			selectedColorIndex,
		} = this.state;

		const colorBook = colorBooks.find((obj) => obj._id === selectedColorBook);
		const color = colorBook.colors[colorIndex];

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
		} else {
			onSelectColor(color);
		}

		this.selectColor(colorIndex);

		this.setState({
			'newColor': colorBook.colors[colorIndex],
		});
	}

	acceptColorChange() {
		const { dispatch } = this.props;
		const { newColor, selectedColorBook, selectedColorIndex } = this.state;

		dispatch(editColorBookColor({
			'_id': selectedColorBook,
			'colorHexValue': newColor,
			'colorIndex': selectedColorIndex,
		}));

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

	handleClickAddColorBook({ name }) {
		const { dispatch } = this.props;

		dispatch(addColorBook(name));
	}

	handleChangeColorBook(event) {
		this.setState({
			'selectedColorBook': event.target.value,
		});
	}

	renderEditColorPanel() {
		const { newColor } = this.state;

		return (
			ReactDOM.createPortal(
				<div className="color-picker">
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

	renderColorBookSelect() {
		const { colorBooks } = this.props;
		const { selectedColorBook } = this.state;

		return (
			<select
				className="select-color-book"
				onChange={this.handleChangeColorBook}
				value={selectedColorBook}
			>
				{colorBooks.map((colorBook) => (
					<option
						key={`color-book=${colorBook._id}`}
						label={colorBook.name}
						value={colorBook._id}
					>
						{colorBook.name}
					</option>
				))}
			</select>
		);
	}

	renderColorBook() {
		const { colorBooks } = this.props;
		const { isEditing, selectedColorBook, selectedColorIndex } = this.state;

		const colorBook = colorBooks.find((obj) => obj._id === selectedColorBook);

		return (
			<div className="color-book">
				<div className="controls">
					<div className="toggle">
						{isEditing
							? <Button color="secondary" onClick={this.handleClickDone}>Done</Button>
							: <Button color="secondary" onClick={this.handleClickEdit}>Edit colors</Button>}
					</div>
				</div>
				<div className="colors">
					{colorBook.colors.map((color, index) => {
						const identifier = `book-color-${index}`;

						return (
							<label // eslint-disable-line jsx-a11y/label-has-associated-control
								htmlFor={identifier}
								key={identifier}
								title="Thread color"
							>
								<span // eslint-disable-line jsx-a11y/control-has-associated-label
									className={`color ${isEditing && (selectedColorIndex === index) ? 'selected' : ''}`}
									key={identifier}
									onClick={() => this.handleClickColor(index)}
									onKeyPress={() => this.handleClickColor(index)}
									role="button"
									style={{ 'backgroundColor': color }}
									tabIndex="0"
								/>
							</label>
						);
					})}
				</div>
			</div>
		);
	}

	render() {
		// TO DO hide add color book form behind a + button
		const { cancelColorChange } = this.props;
		const { showEditColorPanel } = this.state;
		const closeButton = (
			<Button
				className="close"
				color="secondary"
				onClick={cancelColorChange}
				title="Close"
			>
				X
			</Button>
		);

		return (
			<div className="color-books">
				{showEditColorPanel && this.renderEditColorPanel()}
				{closeButton}
				<AddColorBookForm
					handleSubmit={cancelColorChange}
				/>
				{this.renderColorBookSelect()}
				{this.renderColorBook()}
			</div>
		);
	}
}

ColorBooks.propTypes = {
	'cancelColorChange': PropTypes.func.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'onSelectColor': PropTypes.func.isRequired,
};

export default ColorBooks;
