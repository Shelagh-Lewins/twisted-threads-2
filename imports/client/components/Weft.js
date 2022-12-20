import React, { PureComponent } from "react";

import { Button } from "reactstrap";
import PropTypes from "prop-types";

import { editWeftColor } from "../modules/pattern";

import "./Threading.scss";
import Palette from "./Palette";
import "./Weft.scss";

class Weft extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			isEditing: false,
		};

		// bind onClick functions to provide context
		const functionsToBind = ["selectColor", "toggleEditWeft"];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	selectColor(index) {
		const {
			dispatch,
			pattern: { _id },
		} = this.props;

		dispatch(
			editWeftColor({
				_id,
				colorIndex: index,
			})
		);
	}

	toggleEditWeft() {
		const { isEditing } = this.state;

		this.setState({
			isEditing: !isEditing,
		});
	}

	renderControls() {
		const { isEditing } = this.state;

		return (
			<div className="controls">
				{isEditing ? (
					<Button color="primary" onClick={this.toggleEditWeft}>
						Done
					</Button>
				) : (
					<Button color="primary" onClick={this.toggleEditWeft}>
						Edit weft color
					</Button>
				)}
			</div>
		);
	}

	renderPalette() {
		const {
			colorBooks,
			pattern: { _id, weftColor },
		} = this.props;

		return (
			<Palette
				_id={_id}
				colorBooks={colorBooks}
				elementId="weft-palette"
				selectColor={this.selectColor}
				initialColorIndex={weftColor}
			/>
		);
	}

	renderWeft() {
		const {
			pattern: { palette, weftColor },
		} = this.props;

		if (!weftColor) {
			return null;
		}

		return (
			<>
				<span className="text">Weft color:</span>
				<span
					className="weft-color"
					id="weft-color"
					style={{ background: palette[weftColor] }}
				/>
			</>
		);
	}

	render() {
		const {
			pattern: { createdBy },
		} = this.props;
		const { isEditing } = this.state;
		const canEdit = createdBy === Meteor.userId();

		return (
			<div className={`weft ${isEditing ? "editing" : ""}`}>
				{canEdit && this.renderControls()}
				<div className="content">
					{this.renderWeft()}
					{isEditing && this.renderPalette()}
					<div className="clearing" />
				</div>
			</div>
		);
	}
}

Weft.propTypes = {
	colorBooks: PropTypes.arrayOf(PropTypes.any).isRequired,
	dispatch: PropTypes.func.isRequired,
	pattern: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Weft;
