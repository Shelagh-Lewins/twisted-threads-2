import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Col, Container, Row } from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import { FAQ } from '../../modules/collection';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import './FAQPage.scss';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

// FAQs are created directly in the database using for example Robo 3T
// they are not created by Meteor
// so the _id is an object, not a simple string

const bodyClass = 'faq';
const getIdAsString = (ObjectId) => ObjectId._str;

function FAQPage(props) {
  const { FAQlist, errors, isLoading } = props;

  useEffect(() => {
    document.body.classList.add(bodyClass);

    return () => {
      document.body.classList.remove(bodyClass);
    };
  }, []);

  return (
    <PageWrapper dispatch={() => {}} errors={errors}>
      <MainMenu />
      <div className='menu-selected-area'>
        {isLoading && <Loading />}
        <Container>
          <Row>
            <Col>
              <h1>Frequently Asked Questions</h1>
            </Col>
          </Row>
        </Container>
        {!isLoading && (
          <Container>
            <Row>
              <Col>
                <dl className='faq-list'>
                  {FAQlist.map((faq, index) => {
                    const { _id, answer, question } = faq;
                    const _idAsString = getIdAsString(_id);

                    return (
                      <React.Fragment key={_idAsString}>
                        <span className='wrapper'>
                          <dt>{`#${index + 1} ${question}`}</dt>
                          <dd>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                  marked(answer || ''),
                                ),
                              }}
                            />
                          </dd>
                        </span>
                      </React.Fragment>
                    );
                  })}
                </dl>
              </Col>
            </Row>
          </Container>
        )}
      </div>
    </PageWrapper>
  );
}

FAQPage.propTypes = {
  errors: PropTypes.objectOf(PropTypes.any).isRequired,
  FAQlist: PropTypes.arrayOf(PropTypes.any).isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
  isLoading: PropTypes.bool.isRequired,
  location: PropTypes.objectOf(PropTypes.any),
};

const mapStateToProps = (state) => ({
  errors: state.errors,
});

const Tracker = withTracker((props) => {
  const handle = Meteor.subscribe('faq');

  return {
    FAQlist: FAQ.find({}, { sort: { question: 1 } }).fetch(),
    isLoading: !handle.ready(),
  };
})(FAQPage);

export default connect(mapStateToProps)(Tracker);
