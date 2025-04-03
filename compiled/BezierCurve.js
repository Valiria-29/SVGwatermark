"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BezierCurve = exports.Point = void 0;
exports.countingBezierCurveInSVGFile = countingBezierCurveInSVGFile;
exports.extractBezierCurvesFromSVG = extractBezierCurvesFromSVG;
exports.updateSVGWithNewCurves = updateSVGWithNewCurves;
exports.calculateOfControlPointCoordinates = calculateOfControlPointCoordinates;
exports.isMiddlePointBelongsToCurve = isMiddlePointBelongsToCurve;
const xml2js_1 = require("xml2js");
const promises_1 = require("fs/promises");
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.Point = Point;
class BezierCurve {
    constructor(start, first, second, finish, middle, third, fourth) {
        this.startPoint = start;
        this.firstControlPoint = first;
        this.secondControlPoint = second;
        this.finishPoint = finish;
        if (middle && third && fourth != undefined) {
            this.middlePoint = middle;
            this.thirdControlPoint = third;
            this.fourthControlPoint = fourth;
        }
    }
}
exports.BezierCurve = BezierCurve;
function countingBezierCurveInSVGFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const svgContent = yield (0, promises_1.readFile)(filePath, 'utf-8');
        // Парсинг SVG-файла
        const result = yield (0, xml2js_1.parseStringPromise)(svgContent);
        const paths = result.svg.path;
        let count = 0;
        for (const path of paths) {
            const d = path.$.d; // Атрибут `d` содержит команды пути
            // Регулярное выражение для поиска команд кубических кривых Безье (C)
            const cubicBezierRegex = /[Cc]\s*[^Cc]*/g;
            let match;
            while ((match = cubicBezierRegex.exec(d)) !== null) {
                count++;
            }
        }
        return count;
    });
}
// (async () => 
//     {const t= await countingBezierCurveInSVGFile('example.svg')
//         console.log(t);
//     })();
function extractBezierCurvesFromSVG(filePath, findSplitCurve) {
    return __awaiter(this, void 0, void 0, function* () {
        const svgContent = yield (0, promises_1.readFile)(filePath, 'utf-8');
        // Парсинг SVG-файла
        const result = yield (0, xml2js_1.parseStringPromise)(svgContent);
        // Массив для хранения кривых Безье
        const bezierCurves = [];
        // Ищем все пути (<path>) в SVG
        const paths = result.svg.path;
        for (const path of paths) {
            const d = path.$.d; // Атрибут `d` содержит команды пути
            // Регулярное выражение для поиска команд неразбитых кубических кривых Безье (C)
            const cubicBezierRegex = /M\s*(-?\d*\.?\d+)\s*(-?\d*\.?\d+)\s+C\s*(-?\d*\.?\d+)\s*,?\s*(-?\d*\.?\d+)\s*,?\s*(-?\d*\.?\d+)\s*,?\s*(-?\d*\.?\d+)\s*,?\s*(-?\d*\.?\d+)\s*,?\s*(-?\d*\.?\d+)/g;
            //для разбитых кривых
            const splitBezierRegex = /M\s*([\d.]+)\s*([\d.]+)\s*C\s*([\d.]+)\s*([\d.]+)\s*,\s*([\d.]+)\s*([\d.]+)\s*,\s*([\d.]+)\s*([\d.]+)\s*,\s*([\d.]+)\s*([\d.]+)\s*,\s*([\d.]+)\s*([\d.]+)\s*,\s*([\d.]+)\s*([\d.]+)(?=\s|$)/g;
            let match;
            //если извлекаем неразеленную кривую
            if (!findSplitCurve) {
                // Обрабатываем все совпадения
                while ((match = cubicBezierRegex.exec(d)) !== null) {
                    // Извлекаем начальную точку (M) 
                    const startPoint = new Point(parseFloat(match[1]), parseFloat(match[2]));
                    // Извлекаем точки из команды C
                    const firstControlPoint = new Point(parseFloat(match[3]), parseFloat(match[4]));
                    const secondControlPoint = new Point(parseFloat(match[5]), parseFloat(match[6]));
                    const finishPoint = new Point(parseFloat(match[7]), parseFloat(match[8]));
                    // Создаем кривую Безье и добавляем в массив
                    const bezierCurve = new BezierCurve(startPoint, firstControlPoint, secondControlPoint, finishPoint);
                    bezierCurves.push(bezierCurve);
                }
            }
            //если разделенную, то другой regex и больше точек
            else {
                // Обрабатываем все совпадения
                while ((match = splitBezierRegex.exec(d)) !== null) {
                    // Извлекаем начальную точку (M) 
                    const startPoint = new Point(parseFloat(match[1]), parseFloat(match[2]));
                    // Извлекаем точки из команды C
                    const firstControlPoint = new Point(parseFloat(match[3]), parseFloat(match[4]));
                    const secondControlPoint = new Point(parseFloat(match[5]), parseFloat(match[6]));
                    const middlePoint = new Point(parseFloat(match[7]), parseFloat(match[8]));
                    const thirdControlPoint = new Point(parseFloat(match[9]), parseFloat(match[10]));
                    const fourthControlPoint = new Point(parseFloat(match[11]), parseFloat(match[12]));
                    const finishPoint = new Point(parseFloat(match[13]), parseFloat(match[14]));
                    // Создаем кривую Безье и добавляем в массив
                    const bezierCurve = new BezierCurve(startPoint, firstControlPoint, secondControlPoint, finishPoint, middlePoint, thirdControlPoint, fourthControlPoint);
                    bezierCurves.push(bezierCurve);
                }
            }
        }
        return bezierCurves;
    });
}
// async function updateSVGWithNewCurves(filePath: string, newCurves: BezierCurve[]) {
//     const svgContent = await readFile(filePath, 'utf-8');
//     const result = await parseStringPromise(svgContent);
//     // Удаляем все исходные кривые (пути)
//     result.svg.path = [];
//     // Добавляем новые кривые в SVG
//     for (const curve of newCurves) {
//         const d = `M ${curve.startPoint.x} ${curve.startPoint.y} C ${curve.firstControlPoint.x} ${curve.firstControlPoint.y}, ${curve.secondControlPoint.x} ${curve.secondControlPoint.y}, ${curve.middlePoint?.x} ${curve.middlePoint?.y}, ${curve.thirdControlPoint?.x} ${curve.thirdControlPoint?.y}, ${curve.fourthControlPoint?.x} ${curve.fourthControlPoint?.y}, ${curve.finishPoint.x} ${curve.finishPoint.y}`;
//         result.svg.path.push({ $: { d } });
//     }
//     // Преобразуем объект обратно в XML (SVG)
//     const builder = new Builder();
//     const updatedSvg = builder.buildObject(result);
//     // Сохраняем обновлённый SVG в файл
//     await writeFile(filePath, updatedSvg, 'utf-8');
//     console.log('SVG файл успешно обновлён!');
// }
// // проверка работы функции
// (async () => {
//     try {
//         const curves = await extractBezierCurvesFromSVG('example.svg');
//         console.log(`Извлеченные из файла кривые Безье:`);
//         console.log(curves);
//     } catch (error) {
//         console.error('Ошибка при чтении файла или парсинге SVG:', error);
//     }
// })();
function updateSVGWithNewCurves(filePath, newCurves, countOfChangeCurve) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        // Чтение содержимого SVG-файла
        const svgContent = yield (0, promises_1.readFile)(filePath, 'utf-8');
        const result = yield (0, xml2js_1.parseStringPromise)(svgContent, { explicitArray: false });
        // Преобразуем path в массив, если это не массив
        const paths = Array.isArray(result.svg.path) ? result.svg.path : [result.svg.path];
        // Обновляем атрибут `d` для каждого <path>, сохраняя остальные атрибуты
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            // Если есть новая кривая для этого пути, обновляем атрибут `d`
            if (i < countOfChangeCurve) {
                const curve = newCurves[i];
                // Генерируем новый атрибут `d` для кривой Безье
                const d = `M ${curve.startPoint.x} ${curve.startPoint.y} C ${curve.firstControlPoint.x} ${curve.firstControlPoint.y}, ${curve.secondControlPoint.x} ${curve.secondControlPoint.y}, ${(_a = curve.middlePoint) === null || _a === void 0 ? void 0 : _a.x} ${(_b = curve.middlePoint) === null || _b === void 0 ? void 0 : _b.y}, ${(_c = curve.thirdControlPoint) === null || _c === void 0 ? void 0 : _c.x} ${(_d = curve.thirdControlPoint) === null || _d === void 0 ? void 0 : _d.y}, ${(_e = curve.fourthControlPoint) === null || _e === void 0 ? void 0 : _e.x} ${(_f = curve.fourthControlPoint) === null || _f === void 0 ? void 0 : _f.y}, ${curve.finishPoint.x} ${curve.finishPoint.y}`;
                path.$.d = d;
            }
            else {
                // Обновляем только атрибут `d`, сохраняя остальные атрибуты
                path.$ = path.$ || {}; // Убедимся, что атрибуты существуют
            }
        }
        // Преобразуем объект обратно в XML (SVG)
        const builder = new xml2js_1.Builder();
        const updatedSvg = builder.buildObject(result);
        // Сохраняем обновлённый SVG в файл
        yield (0, promises_1.writeFile)(filePath, updatedSvg, 'utf-8');
        console.log('SVG файл успешно обновлён!');
    });
}
function calculateOfControlPointCoordinates(splitBezierCurve, t) {
    return __awaiter(this, void 0, void 0, function* () {
        //вычисляем значения t0:
        const t0 = 1 - t;
        //вычисляем новые контрольные точки для разделенной кривой безье
        const firstPoint = splitBezierCurve.startPoint;
        const fourPoint = splitBezierCurve.finishPoint;
        let thirdPoint = new Point(0, 0);
        const x2 = (splitBezierCurve.firstControlPoint.x - splitBezierCurve.startPoint.x * t0) / t;
        const y2 = (splitBezierCurve.firstControlPoint.y - splitBezierCurve.startPoint.y * t0) / t;
        const secondPoint = new Point(x2, y2);
        if (splitBezierCurve.fourthControlPoint != undefined) {
            const x3 = (splitBezierCurve.fourthControlPoint.x - splitBezierCurve.finishPoint.x * t) / t0;
            const y3 = (splitBezierCurve.fourthControlPoint.y - splitBezierCurve.finishPoint.y * t) / t0;
            thirdPoint = new Point(x3, y3);
        }
        console.log(firstPoint, secondPoint, thirdPoint, fourPoint);
        return new BezierCurve(firstPoint, secondPoint, thirdPoint, fourPoint);
    });
}
function isMiddlePointBelongsToCurve(curve, splitCurveMiddlePoint, t) {
    //вычисляем t
    let t0 = 1 - t;
    let t1 = t0 * t0 * t0;
    let t2 = 3 * t0 * t0 * t;
    let t3 = 3 * t0 * t * t;
    let t4 = t * t * t;
    //вычисляем координаты точки по полученной новой кривой
    const x = curve.startPoint.x * t1 + curve.firstControlPoint.x * t2 + curve.secondControlPoint.x * t3 + curve.finishPoint.x * t4;
    const y = curve.startPoint.y * t1 + curve.firstControlPoint.y * t2 + curve.secondControlPoint.y * t3 + curve.finishPoint.y * t4;
    return (splitCurveMiddlePoint.x == x && splitCurveMiddlePoint.y == y);
}
