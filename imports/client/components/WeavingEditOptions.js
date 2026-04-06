import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, ButtonToolbar } from 'reactstrap';

// Shared edit-mode segmented button toolbar used by weaving design components.
// Props:
//   editMode        — currently selected value string
//   onClickEditMode — click handler; receives synthetic event (event.target.value is the selected value)
//   options         — array of { name: string, value: string }
//   segmented       — whether to add the 'segmented' CSS modifier (default true)
function WeavingEditOptions({
  editMode,
  onClickEditMode,
  options,
  segmented = true,
}) {
  const groupClass = `edit-mode${segmented ? ' segmented' : ''}`;

  return (
    <ButtonToolbar>
      <ButtonGroup className={groupClass}>
        {options.map((option) => (
          <Button
            className={editMode === option.value ? 'selected' : ''}
            color='secondary'
            key={option.value}
            onClick={onClickEditMode}
            value={option.value}
          >
            {option.name}
          </Button>
        ))}
      </ButtonGroup>
    </ButtonToolbar>
  );
}

WeavingEditOptions.propTypes = {
  editMode: PropTypes.string.isRequired,
  onClickEditMode: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  segmented: PropTypes.bool,
};

export default WeavingEditOptions;
