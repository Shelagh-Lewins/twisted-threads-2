import React from 'react';
import { connect } from 'react-redux';

function Footer(props) {
	return (
		<p>
			This is the footer
		</p>
	);
}

const mapStateToProps = (state) => {
	return {};
};

export default connect(mapStateToProps)(Footer);
