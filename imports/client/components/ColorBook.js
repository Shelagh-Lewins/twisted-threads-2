import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import EditColorBook from './EditColorBook';
import './ColorBook.scss';

class ColorBook extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'selectedColorIndex': 0,
		};

		// Edit color book is rendered to the body element
		// so it can be positioned within the viewport
		this.el = document.createElement('div');
		this.el.className = 'edit-color-book-holder';
	}

	componentDidMount() {
		document.body.appendChild(this.el);
	}

	componentWillUnmount() {
		document.body.removeChild(this.el);
	}

	handleClickColor(index) {
		const {
			'colorBook': { colors },
			onSelectColor,
		} = this.props;
		this.setState({
			'selectedColorIndex': index,
		});

		const color = colors[index];
		onSelectColor(color);
	}

	renderColor(color, index) {
		const { disabled, isEditing } = this.props;
		const { selectedColorIndex } = this.state;

		const identifier = `book-color-${index}`;

		return (
			<label // eslint-disable-line jsx-a11y/label-has-associated-control
				htmlFor={identifier}
				key={identifier}
				title={`Thread colour ${color}`}
			>
				<span // eslint-disable-line jsx-a11y/control-has-associated-label
					className={`color ${isEditing && (selectedColorIndex === index) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
					key={identifier}
					onClick={() => this.handleClickColor(index)}
					onKeyPress={() => this.handleClickColor(index)}
					role="button"
					style={{ 'backgroundColor': color }}
					tabIndex="0"
				/>
			</label>
		);
	}

	renderEditColorBookPanel() {
		const {
			colorBook,
			context,
			dispatch,
			handleEditColorBook,
		} = this.props;

		return (
			ReactDOM.createPortal(
				<EditColorBook
					colorBook={colorBook}
					context={context}
					dispatch={dispatch}
					handleClickDone={() => handleEditColorBook(false)}
				/>,
				this.el,
			)
		);
	}

	render() {
		const {
			'colorBook': { colors },
			context,
			isEditing,
		} = this.props;

		const hintText = context === 'user'
			? 'A set of reusable colour swatches that you can assign to any workinig palette.'
			: 'Select a colour swatch above to assign that colour to the selected cell in the working palette below.';

		const colorsElm = (
			<div className="colors">
				{colors.map((color, index) => this.renderColor(color, index))}
			</div>
		);

		return (
			<div className="color-book">
				{colorsElm}
				{<p className="hint">{hintText}</p>}
				{isEditing && this.renderEditColorBookPanel()}
			</div>
		);
	}
}

ColorBook.propTypes = {
	'colorBook': PropTypes.objectOf(PropTypes.any).isRequired,
	'context': PropTypes.string,
	'disabled': PropTypes.bool.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'handleEditColorBook': PropTypes.func.isRequired,
	'isEditing': PropTypes.bool.isRequired,
	'onSelectColor': PropTypes.func,
};

export default ColorBook;
