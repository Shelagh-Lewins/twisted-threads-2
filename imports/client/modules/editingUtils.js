import {
  setIsEditingLeftBorderWeaving,
  setIsEditingRightBorderWeaving,
  setIsEditingWeaving,
} from './pattern';

// Shared toggleEditWeaving logic for doubleFaced and brokenTwill weaving
// design components. Both components manage their own local isEditing state
// and also clear the border editing flags when they start editing.
export function toggleEditMainPatternWeaving({
  dispatch,
  isEditing,
  setState,
  trackScrolling,
}) {
  if (!isEditing) {
    document.addEventListener('scroll', trackScrolling);
    window.addEventListener('resize', trackScrolling);
    setTimeout(() => trackScrolling(), 100); // give the controls time to render
    dispatch(setIsEditingLeftBorderWeaving(false));
    dispatch(setIsEditingRightBorderWeaving(false));
  } else {
    document.removeEventListener('scroll', trackScrolling);
    window.removeEventListener('resize', trackScrolling);
  }

  setState({ isEditing: !isEditing });
  dispatch(setIsEditingWeaving(!isEditing));
}
