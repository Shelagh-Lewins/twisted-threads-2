import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import './UploadPatternForm.scss';

const validate = (values) => {
	const errors = {};
console.log('validate');
	if (!values.selectFile) {
		errors.selectFile = 'A file must be selected';
	} else {
		const { name, size, type } = values.selectFile;

		if (type !== 'text/plain' && type !== '') {
			errors.selectFile = 'File extension must be .twt, .txt or .gtt';
		} else if (size > 1000000) {
			errors.selectFile = 'File size must be < 1000000';
		} else if (!name || name === '') {
			errors.selectFile = 'File must have a name';
		}
	}
console.log('errors', errors);
	return errors;
};

const UploadPatternForm = (props) => {
	const { handleClose, handleSubmit } = props;
	let customTouched = false; // register touched on select, not on clicking the button to open the file picker
	// so validation only happens after the user has made a selection
	//TODO this doesn't work right

	const formik = useFormik({
		'initialValues': {
			'selectFile': '',
		},
		validate,
		'onSubmit': (values) => {
			console.log('submit. values', formik.errors);
			handleSubmit(values);
		},
	});

	const { setFieldValue } = formik;
	const onChange = (event) => {
		if (event.currentTarget.files.length !== 0) {
			setFieldValue('selectFile', event.currentTarget.files[0]);
			customTouched = true;
		}
	};
	const test = (event) => {
		console.log('test', event);
		event.persist();
		event.preventDefault();
		customTouched = true;
		const errors = validate(formik.values);
		console.log('test. errors', errors);
		const thatEvent = event;

		setTimeout(() => {
			if (Object.keys(errors).length === 0) {
				console.log('no errors');
				//thatEvent.preventDefault();
				handleSubmit(thatEvent) } }, 100);
		//formik.handleSubmit(event);
	};

	return (
		<div className="upload-pattern-form">
			<form onSubmit={test}>
				<Button className="close" type="button" color="secondary" title="Close" onClick={handleClose}>X</Button>
				<div className="form-group">
					<h3>Upload pattern from file</h3>
					<p>Supported file types:</p>
					<ul>
						<li>Twisted Threads version 2 (*.twt)</li>
						<li>Guntram&apos;s Tablet Weaving Thingy (*.gtt)</li>
					</ul>
					<p>Currently only packs, individual and 3/1 broken twill GTT files can be imported.</p>
					<label htmlFor="selectFile">
						Select a pattern file:
						<input
							accept="text/plain, .txt, .gtt, .twt"
							className={`form-control ${customTouched.selectFile &&	formik.errors.selectFile ? 'is-invalid' : ''
							}`}
							id="selectFile"
							name="selectFile"
							type="file"
							onChange={onChange}
							onBlur={formik.handleBlur}
						/>
						{customTouched.selectFile && formik.errors.selectFile ? (
							<div className="invalid-feedback invalid">{formik.errors.selectFile}</div>
						) : null}
					</label>
				</div>
				<Button type="submit" color="primary">Import pattern</Button>
			</form>
		</div>
	);
};

UploadPatternForm.propTypes = {
	'handleClose': PropTypes.func.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
};

export default UploadPatternForm;
