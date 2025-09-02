export const Quantiles = (data, numQuantiles) =>{	
    data.sort((a, b) => a - b);
    const quantiles = [];
    for (let i = 1; i < numQuantiles; i++) {
        const index = Math.floor((i / numQuantiles) * data.length);
        quantiles.push(data[index]);
    }

    return quantiles;
}