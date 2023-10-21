function cleanSingleRecord(val) {
    // Remove the [] array brackets from single record collections (e.g. settings).
    val = JSON.stringify(val);/*from  w  ww  . j a  v a2s.c o m*/
    val = val.substring(1, val.length-1);
    return JSON.parse(val.trim());
}

module.exports = {cleanSingleRecord};