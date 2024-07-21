function dataToObject(elem) {
    return elem.toObject(); 
}

function multipleDataToObject(array) {
    return array.map(e => dataToObject(e));
}

module.exports = {
    dataToObject, multipleDataToObject
}