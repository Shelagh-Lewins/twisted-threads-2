// printer-friendly view

import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import {
	getHoles,
	getIsLoading,
	getNumberOfRowsForChart,
	getNumberOfTablets,
	getPalette,
	getPatternTwistSelector,
	getTotalTurnsByTabletSelector,
} from '../modules/pattern';
import AppContext from '../modules/appContext';
import { getNumberOfRepeats } from '../modules/weavingUtils';
import Loading from '../components/Loading';
import PatternPreview from '../components/PatternPreview';
import WeavingChartPrint from '../components/WeavingChartPrint';
import WeavingInstructionsAllTogetherPrint from '../components/WeavingInstructionsAllTogetherPrint';
import ThreadingPrint from '../components/ThreadingPrint';
import Notation from '../components/Notation';
import {
	findPatternTypeDisplayName,
} from '../../modules/parameters';
import './PrintView.scss';

const bodyClass = 'print-view';

class PrintView extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'showPrintHint': true,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'onClickClose',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	onClickClose() {
		this.setState({
			'showPrintHint': false,
		});
	}

	render() {
		const {
			dispatch,
			errors,
			holes,
			isLoading,
			numberOfRows,
			numberOfTablets,
			palette,
			patternIsTwistNeutral,
			patternWillRepeat,
			totalTurnsByTablet,
		} = this.props;
		const { showPrintHint } = this.state;

		const {
			createdByUser,
			pattern,
		} = this.context;

		let content = <Loading />;

		if (!isLoading) {
			if (pattern) {
				const {
					_id,
					description,
					name,
					patternType,
					threadingNotes,
					weavingNotes,
				} = pattern;

				const info = (
					<div className="links">
						<p>{`Printed from: ${Meteor.absoluteUrl()}pattern/${_id}`}</p>
						<p>{`Created by: ${createdByUser.username}`}</p>
						<p>{`Pattern type: ${findPatternTypeDisplayName(patternType)}`}</p>
						{description && description !== '' && (
							<>
								<div>{description}</div>
								<br />
							</>
						)}
					</div>
				);

				const twistNeutralText = (
					<span className="hint">{patternIsTwistNeutral ? 'The pattern is twist neutral.' : 'The pattern is not twist neutral.'}</span>
				);

				let repeatHint = 'The pattern will not repeat.';

				if (patternWillRepeat) {
					repeatHint = `The pattern will repeat (${getNumberOfRepeats(numberOfRows)} repeats shown).`;
				}

				const repeatText = (
					<span className="hint">{repeatHint}</span>
				);

				let weavingInstructions;

				switch (patternType) {
					case 'individual':
					case 'brokenTwill':
						weavingInstructions = (
							<>
								<h2>Weaving chart</h2>
								<WeavingChartPrint
									dispatch={dispatch}
									holes={holes}
									numberOfRows={numberOfRows}
									numberOfTablets={numberOfTablets}
									palette={palette}
									pattern={pattern}
									patternWillRepeat={patternWillRepeat}
								/>
							</>
						);
						break;

					case 'allTogether':
						weavingInstructions = (
							<>
								<h2>Weaving instructions</h2>
								<WeavingInstructionsAllTogetherPrint
									numberOfRows={numberOfRows}
									pattern={pattern}
								/>
							</>
						);
						break;

					default:
						break;
				}

				const printHint = (
					<div className="print-hint">
						<div className="innertube">
							<Button
								type="button"
								className="close"
								onClick={this.onClickClose}
							>
							X
							</Button>
							<h2>Check your print settings</h2>
							<p>Look at the print preview before printing. If you do not see a background colour on any square, your browser is probably not set up to print background colours.</p>
							<p>If you&apos;re not sure how to change the print settings, try searching the web for instructions, for example &quot;Firefox print background color&quot; or &quot;Chrome print background color&quot;.</p>
							<p>Important! After printing your pattern, you may want to change the settings back so you won&apos;t waste ink when printing standard web pages.</p>
						</div>
					</div>
				);

				content = (
					<>
						{showPrintHint && printHint}
						<h1>{name}</h1>
						{info}
						{/* if navigating from the home page, the pattern summary is in MiniMongo before Tracker sets isLoading to true. This doesn't include the detail fields so we need to prevent errors. */}
						{pattern.patternDesign && (
							<>
								<h2>Woven band</h2>
								{repeatText}
								{twistNeutralText}
								<PatternPreview
									dispatch={dispatch}
									holes={holes}
									numberOfRows={numberOfRows}
									numberOfTablets={numberOfTablets}
									palette={palette}
									pattern={pattern}
									patternWillRepeat={patternWillRepeat}
									totalTurnsByTablet={totalTurnsByTablet}
								/>
								{weavingInstructions}
								{weavingNotes && weavingNotes !== '' && (
									<>
										<h2>Weaving notes</h2>
										<div>{weavingNotes}</div>
										<br />
									</>
								)}
								<h2>Threading chart</h2>
								<ThreadingPrint
									holes={holes}
									numberOfRows={numberOfRows}
									numberOfTablets={numberOfTablets}
									patternId={pattern._id}
								/>
								{threadingNotes && threadingNotes !== '' && (
									<>
										<h2>Threading notes</h2>
										<div>{threadingNotes}</div>
										<br />
									</>
								)}
								<Notation />
							</>
						)}
					</>
				);
			} else {
				content = <p>Either this pattern does not exist or you do not have permission to view it</p>;
			}
		}

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				{content}
			</PageWrapper>
		);
	}
}

PrintView.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'holes': PropTypes.number.isRequired,
	'isLoading': PropTypes.bool.isRequired,
	//'numberOfRows': PropTypes.number.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patternIsTwistNeutral': PropTypes.bool.isRequired,
	'patternWillRepeat': PropTypes.bool.isRequired,
	'totalTurnsByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};

PrintView.contextType = AppContext;

function mapStateToProps(state) {
	const { patternIsTwistNeutral, patternWillRepeat } = getPatternTwistSelector(state);

	return {
		'errors': state.errors,
		'holes': getHoles(state),
		'isLoading': getIsLoading(state),
		//'numberOfRows': getNumberOfRows(state),
		'numberOfRows': getNumberOfRowsForChart(state),
		'numberOfTablets': getNumberOfTablets(state),
		'palette': getPalette(state),
		'patternIsTwistNeutral': patternIsTwistNeutral,
		'patternWillRepeat': patternWillRepeat,
		'totalTurnsByTablet': getTotalTurnsByTabletSelector(state),
	};
}

export default connect(mapStateToProps)(PrintView);
