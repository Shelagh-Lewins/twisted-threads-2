import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { COLORS_IN_COLOR_BOOK, DEFAULT_COLOR_BOOK_COLOR } from '../../modules/parameters';
import InlineColorPicker from '../components/InlineColorPicker';
import './AddColorBookForm.scss';
import '../components/ColorBook.scss';

// for accessibility we need to move focus into the floating panel
/* eslint-disable jsx-a11y/no-autofocus */

const validate = (values) => {
	const errors = {};

	if (!values.name) {
		errors.name = 'Required';
	}

	return errors;
};

const BasicForm = (props) => {
	const {
		acceptColorChange,
		colors,
		handleCancel,
		handleClickColor,
		handleColorChange,
		handleAddColorBook,
		pickerReinitialize,
		selectedColorIndex,
		colorValue,
	} = props;

	const renderEditColorPanel = () => {
		if (pickerReinitialize) {
			return;
		}

		return (
			<InlineColorPicker
				color={colorValue}
				onAccept={acceptColorChange}
				onChangeComplete={handleColorChange}
			/>
		);
	};

	const renderSwatches = (handleChange) => {
		const swatches = [];

		for (let i = 0; i < colors.length; i += 1) {
			const identifier = `swatch-${i}`;
			const color = colors[i];

			swatches.push((
				<label
					className={`color ${(selectedColorIndex === i) ? 'selected' : ''}`}
					key={identifier}
					style={{ 'backgroundColor': colors[i] }}
				>
					<input
						id={identifier}
						name={identifier}
						onClick={() => handleClickColor(i)}
						onKeyPress={() => handleClickColor(i)}
						type="text"
						onChange={handleChange}
						readOnly="readonly"
						value={color}
					/>
				</label>
			));
		}
		return (
			<div className="form-group color-book">
				<div className="colors">
					{swatches}
				</div>
			</div>
		);
	};
	return (
		<Formik
			initialValues={{ 'name': '' }}
			onSubmit={(values) => {
				handleAddColorBook(values);
			}}
			validate={validate}
			validateOnBlur={false}
		>
			{({
				handleBlur,
				handleChange,
				handleSubmit,
				errors,
				touched,
				values,
			}) => (
				<form onSubmit={handleSubmit}>
					<h2>New colour book</h2>
					<p className="hint">Create a set of colour swatches which can be assigned to any pattern&apos;s working palette.</p>
					<div className="form-group">
						<label htmlFor="name">
							Name
							<input
								autoFocus="autofocus"
								className={`form-control name ${touched.name && errors.name ? 'is-invalid' : ''
								}`}
								placeholder="Name"
								id="name"
								name="name"
								type="text"
								onChange={handleChange}
								onBlur={handleBlur}
								value={values.name}
							/>
							{touched.name && errors.name ? (
								<div className="invalid-feedback invalid">{errors.name}</div>
							) : null}
						</label>
					</div>
					{renderEditColorPanel()}
					{renderSwatches(handleChange)}
					<div className="controls">
						<Button type="button" color="secondary" onClick={handleCancel}>Cancel</Button>
						<Button type="submit" color="primary">Create</Button>
					</div>
				</form>
			)}
		</Formik>
	);
};

BasicForm.propTypes = {
	'acceptColorChange': PropTypes.func.isRequired,
	'colors': PropTypes.arrayOf(PropTypes.any).isRequired,
	'handleCancel': PropTypes.func.isRequired,
	'handleClickColor': PropTypes.func.isRequired,
	'handleColorChange': PropTypes.func.isRequired,
	'handleAddColorBook': PropTypes.func.isRequired,
	'pickerReinitialize': PropTypes.bool.isRequired,
	'selectedColorIndex': PropTypes.number.isRequired,
	'colorValue': PropTypes.string.isRequired,
};

class AddColorBookForm extends Component {
	// Color picker is rendered to the body element
	// so it can be positioned within the viewport
	constructor(props) {
		super(props);

		this.state = {
			'colors': new Array(COLORS_IN_COLOR_BOOK).fill(DEFAULT_COLOR_BOOK_COLOR),
			'pickerReinitialize': false,
			'selectedColorIndex': 0,
			'colorValue': DEFAULT_COLOR_BOOK_COLOR, // track live selection in color picker
		};
	}

	componentDidUpdate() {
		const { pickerReinitialize } = this.state;

		if (pickerReinitialize) {
			this.setState({
				'pickerReinitialize': false,
			});
		}
	}

	handleClickColor = (index) => {
		const {
			colors,
		} = this.state;

		this.setState({
			'pickerReinitialize': true, // reset initial color
			'selectedColorIndex': index,
			'colorValue': colors[index],
		});
	};

	acceptColorChange = () => {
		const {
			colors,
			colorValue,
			selectedColorIndex,
		} = this.state;

		colors[selectedColorIndex] = colorValue;

		this.setState({
			colors,
		});
	};

	handleColorChange = (colorObject) => {
		this.setState({
			'colorValue': colorObject.hex,
		});
	}

	handleAddColorBook = ({ name }) => {
		const { handleSubmit } = this.props;
		const { colors } = this.state;

		handleSubmit({ colors, name });
	}

	renderEditColorPanel() {
		const {
			pickerReinitialize,
			colorValue,
		} = this.state;

		if (pickerReinitialize) {
			return;
		}

		return (
			<InlineColorPicker
				color={colorValue}
				onAccept={this.acceptColorChange}
				onChangeComplete={this.handleColorChange}
			/>
		);
	}

	render() {
		const { handleCancel } = this.props;
		const {
			colors,
			pickerReinitialize,
			selectedColorIndex,
			colorValue,
		} = this.state;

		// handleSubmit is a property of Formik
		// so use a different name for the action function passed in here

		return (
			<div className="add-color-book-form">
				<BasicForm
					acceptColorChange={this.acceptColorChange}
					colors={colors}
					handleCancel={handleCancel}
					handleClickColor={this.handleClickColor}
					handleColorChange={this.handleColorChange}
					handleAddColorBook={this.handleAddColorBook}
					pickerReinitialize={pickerReinitialize}
					selectedColorIndex={selectedColorIndex}
					colorValue={colorValue}
				/>
			</div>
		);
	}
}

AddColorBookForm.propTypes = {
	'handleCancel': PropTypes.func.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
};

export default AddColorBookForm;
