import React from 'react';
import { Button, Col, Row } from 'reactstrap';
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import './UploadPatternForm.scss';

const UploadPatternForm = (props) => {
	const formik = useFormik({
		'initialValues': {
		},

		'onSubmit': (values, { resetForm }) => {
			if (!values) {
				console.log('submit nothing selected');
			} else {
				console.log('submit', values);
				const { name, size, type } = values.selectFile;

				if (type === 'text/plain') {
					props.handleSubmit(values, { resetForm });
				} else {
					console.log(`invalid file type ${type}`);
				}
			}
		},
	});

	const { setFieldValue } = formik;

	const onChange = (event) => {
		if (event.currentTarget.files.length === 0) {
			console.log('No file selected');
		} else {
			setFieldValue('selectFile', event.currentTarget.files[0]);
		}
	};

	return (
		<div className="upload-pattern-form">
			<form onSubmit={formik.handleSubmit}>
				<div className="form-group">
					<h3>Upload pattern from file</h3>
					<p>Supported file types:</p>
					<ul>
						<li>Twisted Threads version 2 (JSON / .twt)</li>
						<li>Guntram&apos;s Tablet Weaving Thingy (XML / .gtt)</li>
					</ul>
					<p>Currently only packs, individual and 3/1 broken twill GTT files can be imported.</p>
					<label htmlFor="selectFile">
						Select a pattern file
						<input
							className={`form-control ${formik.touched.selectFile && formik.errors.selectFile ? 'is-invalid' : ''
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
					<div className="controls">
						<Button type="submit" color="primary">Import pattern</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

UploadPatternForm.propTypes = {
	'handleSubmit': PropTypes.func.isRequired,
};

export default UploadPatternForm;
