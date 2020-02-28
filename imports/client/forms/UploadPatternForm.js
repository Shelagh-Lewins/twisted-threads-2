import React from 'react';
import { Button } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import './UploadPatternForm.scss';

const validate = (values) => {
	const errors = {};

	if (!values.selectFile) {
		errors.selectFile = 'A file must be selected';
	} else {
		const { name, size, type } = values.selectFile;

		if (type !== 'text/plain' && type !== '') {
			errors.selectFile = 'File extension must be .twt, .txt or .gtt';
		} else if (size > 1000) {
			errors.selectFile = 'File size must be < 1000';
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
			handleSubmit(values);
		},
	});

	const { setFieldValue } = formik;
	const onChange = (event) => {
		if (event.currentTarget.files.length !== 0) {
			setFieldValue('selectFile', event.currentTarget.files[0]);
		}
	};

	return (
		<div className="upload-pattern-form">
			<form onSubmit={formik.handleSubmit}>
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
							className={`form-control ${formik.touched.selectFile &&	formik.errors.selectFile ? 'is-invalid' : ''
							}`}
							id="selectFile"
							name="selectFile"
							type="file"
							onChange={onChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.selectFile && formik.errors.selectFile ? (
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
