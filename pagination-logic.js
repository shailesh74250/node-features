
// Logic for a pagination
// request having these query params limit =4, page=3
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
console.log({totalPage})
let totalRecord = arr.length;
console.log({totalRecord});
if (page < 1 || page > totalPage) {
    console.log("Invalid Page Number");
} else {
    let result = arr.slice((page-1) * limit, page * limit);
    console.log(result);
    return { "page": 1, "limit": 4, "totalDocuments": totalRecord, "totalPages": totalPage, "documents": result}
}
