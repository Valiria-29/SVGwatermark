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
exports.prepareMessageToAlgorithm = prepareMessageToAlgorithm;
exports.translateMessageToStringFromBinary = translateMessageToStringFromBinary;
function prepareMessageToAlgorithm(message) {
    return __awaiter(this, void 0, void 0, function* () {
        let binaryString = [];
        message += '$'; // добавляем символ конца сообщения
        let chars = message.split('');
        chars.forEach(symbol => {
            binaryString.push(symbol.charCodeAt(0).toString(2).padStart(8, '0')); //получаем двоичное представление каждого ascii символа
        });
        let binaryPairArray = splitMessageOnBinaryPair(binaryString.join('')); //разбиваем полученную бинарную строку на бинарные пары
        console.log(`Для внедрения сообщения: ${message} понадобится ${binaryPairArray.length / 2} кубических кривых Безье`);
        return binaryPairArray;
    });
}
function splitMessageOnBinaryPair(binaryMessage) {
    let binaryPairArray = [];
    let temp = binaryMessage.split('');
    for (let i = 0; i < temp.length - 1; i += 2) {
        binaryPairArray.push([parseInt(temp[i]), parseInt(temp[i + 1])]);
    }
    return binaryPairArray;
}
function translateMessageToStringFromBinary(binaryMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        // Проверяем, что длина строки кратна 8 (для корректного разбиения)
        if (binaryMessage.length % 8 !== 0) {
            throw new Error("Длина бинарной строки должна быть кратна 8");
        }
        let result = '';
        for (let i = 0; i < binaryMessage.length; i += 8) {
            const byte = binaryMessage.substr(i, 8);
            const charCode = parseInt(byte, 2);
            // Фильтруем только печатные ASCII символы (32-126)
            if (charCode >= 32 && charCode <= 126) {
                result += String.fromCharCode(charCode);
            }
            else {
                result += '�'; // Спецсимвол для непечатных символов
            }
        }
        return result;
    });
}
