export const rates = [
    { label: '0%', value: 0 },
    { label: '1%', value: .01 },
    { label: '2%', value: .02 },
    { label: '2.5%', value: .025 },
    { label: '3%', value: .03 },
    { label: '5%', value: .05 },
    { label: '6%', value: .06 },
    { label: '7%', value: .07 },
    { label: '7.5%', value: .075 },
    { label: '8%', value: .08 },
    { label: '9%', value: .09 },
    { label: '10%', value: .1 },
    { label: '12%', value: .12 },
    { label: '12.5%', value: .125 },
    { label: '15%', value: .15 },
    { label: '17.5%', value: .175 },
    { label: '20%', value: .2 },
    { label: '22.5%', value: .225 },
    { label: '25%', value: .25 },
    { label: '30%', value: .3 },
    { label: '40%', value: .4 },
    { label: '50%', value: .5 },
    { label: '100%', value: 1.0 }
];
export const permPlacementRates = [
    { label: '0%', value: 0 },
    { label: '2%', value: .02 },
    { label: '2.5%', value: .025 },
    { label: '3%', value: .03 },
    { label: '5%', value: .05 },
    { label: '6%', value: .06 },
    { label: '10%', value: .1 },
    { label: '11%', value: .11 },
    { label: '12%', value: .12 },
    { label: '12.5%', value: .125 },
    { label: '13.5%', value: .135 },
    { label: '15%', value: .15 },
    { label: '17%', value: .17 },
    { label: '17.5%', value: .175 },
    { label: '20%', value: .2 },
    { label: '22.5%', value: .225 },
    { label: '25%', value: .25 },
    { label: '30%', value: .3 },
    { label: '50%', value: .5 },
    { label: '100%', value: 1.0 }
];
export function refererRates(): any[] {
    let secondRates = [];
    for(let i = 0; i < 0.5025; i += 0.0025) {
        var rate = { label: (i * 100).toFixed(2).concat('%'), value: i.toFixed(2) };
        secondRates.push(rate);
    }
    return secondRates;
};
