// get orientation for double faced tablet

export default function getDoubleFacedOrientation({
	tablet,
	doubleFacedOrientations,
}) {
	return doubleFacedOrientations.charAt(tablet % 2);
}
