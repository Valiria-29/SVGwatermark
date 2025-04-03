

type BinaryPair = [number, number]

async function prepareMessageToAlgorithm (message: string):Promise<BinaryPair[]> {
    
    let binaryString: string[] = [];
    message += '$'; // добавляем символ конца сообщения
    let chars = message.split('');

    chars.forEach(symbol => { 
        binaryString.push(symbol.charCodeAt(0).toString(2).padStart(8,'0')); //получаем двоичное представление каждого ascii символа
    });

    let binaryPairArray: BinaryPair[] = splitMessageOnBinaryPair(binaryString.join('')); //разбиваем полученную бинарную строку на бинарные пары

    console.log(`Для внедрения сообщения: ${message} понадобится ${binaryPairArray.length /2} кубических кривых Безье` );
    return binaryPairArray;
}

function splitMessageOnBinaryPair (binaryMessage: string): BinaryPair[] {

    let binaryPairArray: BinaryPair[] = [];
    let temp = binaryMessage.split('');
    for (let i = 0; i< temp.length - 1; i+=2){
        binaryPairArray.push([parseInt(temp[i]), parseInt(temp[i+1])]);
    }
    return binaryPairArray;
}

async function translateMessageToStringFromBinary (binaryMessage: string): Promise<string>  {
    
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
        } else {
            result += '�'; // Спецсимвол для непечатных символов
        }
    }
    return result;

}

// let binPair = prepareMessageToAlgorithm('Hello' );
// console.log(binPair);
export {prepareMessageToAlgorithm, BinaryPair, translateMessageToStringFromBinary};
