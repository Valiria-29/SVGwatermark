
type binPairRange = Record<string, [number, number]>

class Key {
    t: number;
    static binaryPairRange: Record<string, [number, number]> = {
        '00': [10, 32],
        '01': [33, 54],
        '10': [55, 76],
        '11': [77, 99],
    };


    constructor(t: number){
        this.t = t;
        //this.t = Math.random() * (0.99 - 0.01) + 0.01;
    } 
    
    // Статический метод для получения бинарной пары
    static getBinaryPairByValue(value: number): string | null {
        for (const [binaryPair, [min, max]] of Object.entries(Key.binaryPairRange)) {
            if (value >= min && value <= max) {
                return binaryPair;
            }
        }
        return null;
    }
}

export {binPairRange, Key}

