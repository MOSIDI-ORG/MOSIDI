export function setMapFilterForLegendInteraction (map, payload) {
  function getFeatureIdsByColors(styleExpression, targetColors) {
    const featureIds = [];
    
    if (Array.isArray(styleExpression) && styleExpression.length > 0) {
      // Iterate over the style expression to find feature property values and their corresponding colors
      for (let i = 1; i < styleExpression.length - 1; i += 2) {
        const color = styleExpression[i];
        if (targetColors.includes(color)) {
          const featureId = styleExpression[i - 1];
          featureIds.push(featureId);
        }
      }
    }
    
    return featureIds;
  }
  const style = map.getStyle();
  const fillColors = style.layers.find(({ id }) => id === payload.layerId).paint[payload.styleParam];
  const matchingIds = getFeatureIdsByColors(fillColors, payload.selectedColor);
  
  let filter = ['match', ['get', payload.properties], matchingIds, true, false];
  map.setFilter(payload.layerId, filter);
  
}