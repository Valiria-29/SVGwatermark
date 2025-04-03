import { countingBezierCurveInSVGFile, extractBezierCurvesFromSVG, updateSVGWithNewCurves, calculateOfControlPointCoordinates, isMiddlePointBelongsToCurve} from './BezierCurve';
import {prepareMessageToAlgorithm, translateMessageToStringFromBinary} from './Message';
import {Key} from './KeyInformation';
import {SplitBezierCurveByDeCasteljauMethod, extractionHiddenInformationInControlPoint} from './MethodDeCasteljau';


// генерируем ключ 
const secretKey = new Key(0.25);

async function embeddingHiddenMessage(svgFilePath: string, message: string): Promise<void>{
    try {
        // Разбиваем сообщение на бинарные пары
        const binPair = await prepareMessageToAlgorithm(message);

        // Получаем количество кривых в файле
        const countOfCurve = await countingBezierCurveInSVGFile(svgFilePath);
        console.log(`В файле ${svgFilePath} содержится ${countOfCurve} кубических кривых Безье`);
            
        // Проверяем, возможно ли внедрение
        if (countOfCurve < binPair.length / 2) {
            console.log(`Внедрение сообщения невозможно! Требуется ${binPair.length/2} кривых, доступно ${countOfCurve}`);
            return;
        }

        console.log('Внедрение сообщения возможно!');

        // Извлекаем все кривые из файла (только неразделенные т.е. 4 точки)
        const extractCurves = await extractBezierCurvesFromSVG(svgFilePath, false);
        console.log('Извлеченные кривые:', extractCurves);
            
        // Для каждых двух бинарных пар берём одну кривую и разбиваем её
        console.log('Разделенные кривые:');
        for (let i = 0, j = 0; i < binPair.length - 1 && j < extractCurves.length; i += 2, j++) {
            
            const firstBinPair = binPair[i];
            const secondBinPair = binPair[i + 1];
            
            // Разбиваем кривую Безье
            extractCurves[j] = await SplitBezierCurveByDeCasteljauMethod(extractCurves[j], firstBinPair, secondBinPair, secretKey);
            console.log(extractCurves[j]);
        }

        // Сохраняем изменения в файл
        await updateSVGWithNewCurves(svgFilePath, extractCurves, binPair.length / 2);
        console.log('Сообщение успешно внедрено!');
                
    }                
    catch (error) {
        console.error('Ошибка при чтении файла или парсинге SVG:', error);
    } 
}


async function extractionHiddenMessage(filePath: string, key: Key): Promise<string> {
    try {
        // Извлекаем все разделённые кривые Безье из файла
        const extractCurves = await extractBezierCurvesFromSVG(filePath, true);
        console.log(`Извлеченные кривые Безье:`, extractCurves);
        console.log(`Всего кривых: ${extractCurves.length}`);

        if (extractCurves.length === 0) {
            console.error('Массив extractCurves пуст');
            return '';
        }

        let binaryMessage = '';

        // Проверяем каждую кривую для t и 1-t
        for (const curve of extractCurves) {
            const firstVariant = await calculateOfControlPointCoordinates(curve, key.t);
            const secondVariant = await  calculateOfControlPointCoordinates(curve, 1 - key.t);
            const middlePoint = curve.middlePoint;

            if (middlePoint !== undefined) {
                const isFirstValid = isMiddlePointBelongsToCurve(firstVariant, middlePoint, key.t);
                const isSecondValid = isMiddlePointBelongsToCurve(secondVariant, middlePoint, 1 - key.t);

                //если медиана принадлежит полученной кривой (одному из вариантов), хначит эта кривая действительно была разбита и в LSB содержится сообщение
                if (isFirstValid || isSecondValid) {
                    //извлекаем LSB
                    binaryMessage += await extractionHiddenInformationInControlPoint(curve, key);
                }
            }
        }

        console.log('Извлечённое бинарное сообщение:', binaryMessage);

        //преобразуем его из бинарного в ASCII
        const secretMessage = await translateMessageToStringFromBinary(binaryMessage);
        console.log('Декодированное сообщение:', secretMessage);

        return binaryMessage; // Возвращаем результат только после всех операций
    } 
    catch (error) {
        console.error('Ошибка!', error);
        throw error; // Пробрасываем ошибку, чтобы её можно было обработать снаружи
    }
}

(async () => {
    try {
        const secretKey = new Key(0.25);
        console.log('-------------------------Внедрение-------------------------------');
        await embeddingHiddenMessage('example.svg', 'Hello');
        console.log('-------------------------Извлечение-------------------------------');
        const hiddenMessage = await extractionHiddenMessage('example.svg', secretKey);
    } catch (error) {
        console.error('Ошибка в основном потоке:', error);
    }
})();
export {}
