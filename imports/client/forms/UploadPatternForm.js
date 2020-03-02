import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import './UploadPatternForm.scss';

// this form submits when the user selects a file
// timeout enables a form that submits immediately and validates (setFieldValue is async)

const validate = (values) => {
	const errors = {};

	if (!values.selectFile) {
		errors.selectFile = 'A file must be selected';
	} else {
		// there's no reliable way to check file type
		// we'll check for valid data later
		const { name, size } = values.selectFile;

		if (size > 1000000) {
			errors.selectFile = 'File size must be < 1000000';
		} else if (!name || name === '') {
			errors.selectFile = 'File must have a name';
		}
	}

	return errors;
};

const UploadPatternForm = (props) => {
	const { handleClose, handleSubmit } = props;

	const formik = useFormik({
		'initialValues': {
			'selectFile': '',
		},
		validate,
		'onSubmit': (values) => {
			global.touchedUploadPatternInput = null;
			handleSubmit(values);
		},
	});

	const { setFieldValue } = formik;


	const onChange = (event) => {
		if (event.currentTarget.files.length !== 0) {
			const selectFile = event.currentTarget.files[0];
			setFieldValue('selectFile', selectFile);
			global.touchedUploadPatternInput = 'touched'; // we don't want to show errors when the user opens the file picker
			// so mark the input as touched only when the user makes a selection

			setTimeout(() => {
				formik.handleSubmit();
			}, 50);
		}
	};

	const onClickClose = () => {
		global.touchedUploadPatternInput = null;
		handleClose();
	};

	return (
		<div className="upload-pattern-form">
			<form onSubmit={formik.handleSubmit}>
				<Button className="close" type="button" color="secondary" title="Close" onClick={onClickClose}>X</Button>
				<div className="form-group">
					<h3>Upload pattern from file</h3>
					<p>Supported file types:</p>
					<ul>
						<li>Twisted Threads version 2 (*.twt)</li>
						<li>Guntram&apos;s Tablet Weaving Thingy (*.gtt)</li>
					</ul>
					<p>At present, the only supported GTT pattern types are Threaded and Broken Twill.</p>
					<label htmlFor="selectFile">
						Select a pattern file:
						<input
							accept="text/plain, .txt, .gtt, .twt"
							className={`form-control ${global.touchedUploadPatternInput &&	formik.errors.selectFile ? 'is-invalid' : ''
							}`}
							id="selectFile"
							name="selectFile"
							type="file"
							onChange={onChange}
							onBlur={formik.handleBlur}
						/>
						{global.touchedUploadPatternInput && formik.errors.selectFile ? (
							<div className="invalid-feedback invalid">{formik.errors.selectFile}</div>
						) : null}
					</label>
				</div>
				<Button type="submit" color="primary">Import pattern</Button>
			</form>
		</div>
	);
};
// accept="text/plain, .txt, .gtt, .twt"
UploadPatternForm.propTypes = {
	'handleClose': PropTypes.func.isRequired,
	'handleSubmit': PropTypes.func.isRequired,
};

export default UploadPatternForm;
