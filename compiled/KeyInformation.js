"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Key = void 0;
class Key {
    constructor(t) {
        this.t = t;
        //this.t = Math.random() * (0.99 - 0.01) + 0.01;
    }
    // Статический метод для получения бинарной пары
    static getBinaryPairByValue(value) {
        for (const [binaryPair, [min, max]] of Object.entries(Key.binaryPairRange)) {
            if (value >= min && value <= max) {
                return binaryPair;
            }
        }
        return null;
    }
}
exports.Key = Key;
Key.binaryPairRange = {
    '00': [10, 32],
    '01': [33, 54],
    '10': [55, 76],
    '11': [77, 99],
};
