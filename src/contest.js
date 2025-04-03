var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
let inputString = [];

// Чтение одной строки
// rl.on("line", function (line) {
//     inputString = line; // Сохраняем строку как есть
// });

// rl.on("close", function () {
//     let result = [];
//     const parts = inputString.split(','); // Разбиваем по запятым
    
//     for (const part of parts) {
//         if (part.includes('-')) {
//             const [start, end] = part.split('-').map(Number);
//             for (let i = start; i <= end; i++) {
//                 result.push(i);
//             }
//         } else {
//             result.push(Number(part));
//         }
//     }
    
//     console.log(result.join(' '));
// });

//чтение числа N, а потом строки из N чисел

// rl.on("line", function (line) {
//     inputString.push(line); 
//     console.log(inputString);
// });

// rl.on("close", function () {
//     let N = inputString[0];
//     console.log(N);

//     let arr = inputString[1].split(' ');
//     console.log(arr);
// });

//чтение числа N  а затем N строчек данных

rl.on("line", function (line) {
    inputString.push(line); 
});

rl.on("close", function () {
    let N = inputString[0];
    console.log(N);
    let str = [];
    for (let i = 1; i <= N; i++){
        str.push(inputString[i]);
    }
    console.log(str);
});
