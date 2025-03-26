
// Logic for a pagination
let limit =4, page = 3; 
let arr = [
    {name: 'abc1'},
    {name: 'xyz2'},
    {name: 'xyz3'},
    {name: 'xyz4'},
    {name: 'xyz5'},
    {name: 'xyz6'},
    {name: 'xyz7'},
    {name: 'xyz8'},
    {name: 'xyz9'},
    {name: 'xyz10'},
];
let totalPage = Math.ceil(arr.length / limit);
pageSize = 3;
console.log({totalPage})
let totalRecord = arr.length;
console.log({totalRecord});
let result = arr.slice((page-1)*limit, page*limit);
console.log(result);
// console.log(pageSize)
