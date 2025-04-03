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
const BezierCurve_1 = require("./BezierCurve");
const Message_1 = require("./Message");
const KeyInformation_1 = require("./KeyInformation");
const MethodDeCasteljau_1 = require("./MethodDeCasteljau");
// генерируем ключ 
const secretKey = new KeyInformation_1.Key(0.25);
function embeddingHiddenMessage(svgFilePath, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Разбиваем сообщение на бинарные пары
            const binPair = yield (0, Message_1.prepareMessageToAlgorithm)(message);
            // Получаем количество кривых в файле
            const countOfCurve = yield (0, BezierCurve_1.countingBezierCurveInSVGFile)(svgFilePath);
            console.log(`В файле ${svgFilePath} содержится ${countOfCurve} кубических кривых Безье`);
            // Проверяем, возможно ли внедрение
            if (countOfCurve < binPair.length / 2) {
                console.log(`Внедрение сообщения невозможно! Требуется ${binPair.length / 2} кривых, доступно ${countOfCurve}`);
                return;
            }
            console.log('Внедрение сообщения возможно!');
            // Извлекаем все кривые из файла (только неразделенные т.е. 4 точки)
            const extractCurves = yield (0, BezierCurve_1.extractBezierCurvesFromSVG)(svgFilePath, false);
            console.log('Извлеченные кривые:', extractCurves);
            // Для каждых двух бинарных пар берём одну кривую и разбиваем её
            console.log('Разделенные кривые:');
            for (let i = 0, j = 0; i < binPair.length - 1 && j < extractCurves.length; i += 2, j++) {
                const firstBinPair = binPair[i];
                const secondBinPair = binPair[i + 1];
                // Разбиваем кривую Безье
                extractCurves[j] = yield (0, MethodDeCasteljau_1.SplitBezierCurveByDeCasteljauMethod)(extractCurves[j], firstBinPair, secondBinPair, secretKey);
                console.log(extractCurves[j]);
            }
            // Сохраняем изменения в файл
            yield (0, BezierCurve_1.updateSVGWithNewCurves)(svgFilePath, extractCurves, binPair.length / 2);
            console.log('Сообщение успешно внедрено!');
        }
        catch (error) {
            console.error('Ошибка при чтении файла или парсинге SVG:', error);
        }
    });
}
function extractionHiddenMessage(filePath, key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Извлекаем все разделённые кривые Безье из файла
            const extractCurves = yield (0, BezierCurve_1.extractBezierCurvesFromSVG)(filePath, true);
            console.log(`Извлеченные кривые Безье:`, extractCurves);
            console.log(`Всего кривых: ${extractCurves.length}`);
            if (extractCurves.length === 0) {
                console.error('Массив extractCurves пуст');
                return '';
            }
            let binaryMessage = '';
            // Проверяем каждую кривую для t и 1-t
            for (const curve of extractCurves) {
                const firstVariant = yield (0, BezierCurve_1.calculateOfControlPointCoordinates)(curve, key.t);
                const secondVariant = yield (0, BezierCurve_1.calculateOfControlPointCoordinates)(curve, 1 - key.t);
                const middlePoint = curve.middlePoint;
                if (middlePoint !== undefined) {
                    const isFirstValid = (0, BezierCurve_1.isMiddlePointBelongsToCurve)(firstVariant, middlePoint, key.t);
                    const isSecondValid = (0, BezierCurve_1.isMiddlePointBelongsToCurve)(secondVariant, middlePoint, 1 - key.t);
                    //если медиана принадлежит полученной кривой (одному из вариантов), хначит эта кривая действительно была разбита и в LSB содержится сообщение
                    if (isFirstValid || isSecondValid) {
                        //извлекаем LSB
                        binaryMessage += yield (0, MethodDeCasteljau_1.extractionHiddenInformationInControlPoint)(curve, key);
                    }
                }
            }
            console.log('Извлечённое бинарное сообщение:', binaryMessage);
            //преобразуем его из бинарного в ASCII
            const secretMessage = yield (0, Message_1.translateMessageToStringFromBinary)(binaryMessage);
            console.log('Декодированное сообщение:', secretMessage);
            return binaryMessage; // Возвращаем результат только после всех операций
        }
        catch (error) {
            console.error('Ошибка!', error);
            throw error; // Пробрасываем ошибку, чтобы её можно было обработать снаружи
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const secretKey = new KeyInformation_1.Key(0.25);
        console.log('-------------------------Внедрение-------------------------------');
        yield embeddingHiddenMessage('example.svg', 'Hello');
        console.log('-------------------------Извлечение-------------------------------');
        const hiddenMessage = yield extractionHiddenMessage('example.svg', secretKey);
    }
    catch (error) {
        console.error('Ошибка в основном потоке:', error);
    }
}))();
