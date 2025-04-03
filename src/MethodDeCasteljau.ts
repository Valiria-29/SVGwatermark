import { Key} from './KeyInformation.js'
import { BinaryPair} from './Message'
import {Point, BezierCurve} from './BezierCurve'


async function SplitBezierCurveByDeCasteljauMethod (bezierCurve: BezierCurve, firstBinaryPair: BinaryPair, secondBinaryPair: BinaryPair, key: Key):Promise<BezierCurve> {
    // проверяем первый символ первой бинарной пары
    if (firstBinaryPair[0] == 1) {
       let splitCurve = CalculateNewControlPoints (bezierCurve, key.t);
       return addingHiddenInformationInControlPoint (splitCurve, firstBinaryPair, secondBinaryPair, key);
    }
    else {
        let splitCurve = CalculateNewControlPoints (bezierCurve, 1 - key.t);
        return addingHiddenInformationInControlPoint (splitCurve, firstBinaryPair, secondBinaryPair, key);
    }
}

function CalculateNewControlPoints (inputCurve:BezierCurve, t:number): BezierCurve {
    
    let P1 = inputCurve.startPoint;
    let P2 = inputCurve.firstControlPoint;
    let P3 = inputCurve.secondControlPoint;
    let P4 = inputCurve.finishPoint;

    //console.log(`Точки исходной кривой: ${P1}, ${P2},${P3}, ${P4}`);

    let P11, P12, P13, P14, P21, P22, P23, P24: Point; 
    
    let t0 = 1 -t;
    let t1 = t0 * t0 * t0;
    let t2 = 3 * t0 * t0 * t;
    let t3 = 3 * t0 * t * t;
    let t4 = t * t * t;

    // console.log(t, t0, t1, t2, t3, t4);
    
    P11 = P1;
    P12 = new Point(P1.x * t0 + P2.x * t, P1.y * t0 + P2.y * t);
    P13 = new Point (P12.x * t0 + (P2.x * t0 + P3.x * t) * t, P12.y * t0 + (P2.y * t0 + P3.y * t) * t);

    P14 = P21 = new Point(P1.x * t1 + P2.x * t2 + P3.x * t3 + P4.x * t4, P1.y * t1 + P2.y * t2 + P3.y * t3 + P4.y * t4);

    P23 = new Point (P3.x * t0 + P4.x * t, P3.y * t0 + P4.y * t);
    P22 = new Point (P23.x * t + (P2.x * t0 + P3.x * t) * t0, P23.y * t + (P2.y * t0 + P3.y * t) * t0);
    P24 = P4;

    let splitBezierCurve: BezierCurve = new BezierCurve (P11, P12, P13, P24, P14, P22, P23);

    return splitBezierCurve;
}

// let curve = new BezierCurve (new Point(10,200), new Point(120,30),  new Point(170,70),  new Point(220 , 100));
// SplitBezierCurveByDeCasteljauMethod(curve, [1,0], new Key(0.25));

// (async () => { 
//         const curves = await extractBezierCurvesFromSVG('example.svg');
//         const newCurves: BezierCurve[] =[];
//         for (const cur of curves){
//         let newcur = SplitBezierCurveByDeCasteljauMethod(cur, [1,0], new Key(0.25));
//         console.log('Разделенная кривая:');
//         console.log(newcur);
//            newCurves.push(newcur);
//         }
//         updateSVGWithNewCurves('example.svg', newCurves);
// })();

function addingHiddenInformationInControlPoint (splitBezierCurve: BezierCurve, firstBinPair: BinaryPair, secondBinPair: BinaryPair, key :Key): BezierCurve {
    
    //для каждой бинарной пары выбираем случайные числа в заданных диапазонах
    let [min1,max1] = Key.binaryPairRange[firstBinPair.join('')];
    let firstHiddenValue = randomInteger(min1, max1);
    let x1 = Math.floor(firstHiddenValue / 10);
    let y1 = firstHiddenValue % 10;

    console.log('Значения для внедрения');
    console.log(firstHiddenValue, x1, y1);

    let [min2,max2] = Key.binaryPairRange[secondBinPair.join('')];
    let secondHiddenValue = randomInteger(min2, max2);
    let x2 = Math.floor(secondHiddenValue / 10);
    let y2 = secondHiddenValue % 10;

    console.log('Значения для внедрения');
    console.log(secondHiddenValue, x2, y2);
    //внедряем в контрольные точки разделенной кривой
    splitBezierCurve.secondControlPoint.x = addSmallValue(splitBezierCurve.secondControlPoint.x, x1);
    splitBezierCurve.secondControlPoint.y = addSmallValue(splitBezierCurve.secondControlPoint.y, y1);

    if (splitBezierCurve.thirdControlPoint){
    splitBezierCurve.thirdControlPoint.x = addSmallValue(splitBezierCurve.thirdControlPoint.x, x2);
    splitBezierCurve.thirdControlPoint.y = addSmallValue (splitBezierCurve.thirdControlPoint.y, y2);
    }
    return splitBezierCurve;
}

async function extractionHiddenInformationInControlPoint ( curve : BezierCurve, key: Key): Promise<string>  {
        let outputStr = '';
        
        // Для второй контрольной точки
        const firstX = findSixDecimalDigit(curve.secondControlPoint.x);
        const firstY = findSixDecimalDigit(curve.secondControlPoint.y);
        const firstBinPairRange = firstX * 10 + firstY;
        const firstBinPair = Key.getBinaryPairByValue(firstBinPairRange);
        
        console.log('Первая пара:', firstBinPair);
        
        // Для третьей контрольной точки (если существует)
        let secondBinPair = ''; 
        if (curve.thirdControlPoint != undefined) {
            const secondX = findSixDecimalDigit(curve.thirdControlPoint.x);
            const secondY = findSixDecimalDigit(curve.thirdControlPoint.y);
            const secondBinPairRange = secondX * 10 + secondY;
            secondBinPair = Key.getBinaryPairByValue(secondBinPairRange) || '';
            console.log('Вторая пара:', secondBinPair);
        }
        
        // Объединение строк
        outputStr = (firstBinPair || '') + (secondBinPair || '');
        return outputStr;
}
// let key = new Key();
// addingHiddenInformationInControlPoint([0,0],[0,1], key);
 
function findSixDecimalDigit (num: number): number {

    // Преобразуем число в строку, чтобы избежать погрешности плавающей запятой
    const numStr = num.toString();

    // Ищем позицию десятичной точки
    const decimalIndex = numStr.indexOf('.');

    // Если точки нет или после нее меньше 6 цифр
    if (decimalIndex === -1 || numStr.length <= decimalIndex + 6) {
        return 0;
    }

    // Извлекаем 6-й символ после точки и преобразуем в число
    const sixthDigitStr = numStr[decimalIndex + 6];
    console.log(sixthDigitStr);
    return sixthDigitStr ? parseInt(sixthDigitStr, 10) : 0;
}
function randomInteger(min: number, max: number): number {
    // случайное число от min до (max+1)
    let rand = min + Math.random() * (max - min);
    return Math.floor(rand);
}

function addSmallValue(num: number, value: number): number {
    // Разделяем число на целую и дробную части
    const integerPart = Math.floor(num);
    let fractionalPart = num - integerPart;

    // Умножаем дробную часть на 1_000_000, чтобы сдвинуть 6-ю цифру в целую часть
    fractionalPart *= 1_000_000;

    // Удаляем текущую цифру на 6-й позиции
    fractionalPart = Math.floor(fractionalPart / 10) * 10 + value;

    // Возвращаем дробную часть обратно в диапазон [0, 1)
    fractionalPart /= 1_000_000;

    // Собираем число обратно
    const result = integerPart + fractionalPart;
    return result;
}
export {SplitBezierCurveByDeCasteljauMethod, extractionHiddenInformationInControlPoint};
