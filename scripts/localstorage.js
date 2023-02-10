
//clearLocalstorage()
//console.log(getLocalstorageKeys())
//console.log(localStorage)


// LOAD ITEMS FROM LOCALSTORAGE
function loadItems()
{
  var keys = getLocalstorageKeys();
  var lastDate = "000000";
  for (i = 0; i < keys.length; i++)
  {
    var dataObject = loadLocalstorageItem(keys[i]);
    if (dataObject != null)
    {
      if ((parseInt(dataObject.year + dataObject.month) > lastDate) && (i != 0))
      {
        createItemDivider();
      }
      lastDate = dataObject.year + dataObject.month;

      createItem(keys[i], dataObject);
    }
  }
}


// LOAD SUMMARY BASED ON ITEMS FROM LOCALSTORAGE
function loadSummaryItems()
{
  var keys = getLocalstorageKeys();
  if (keys.length != 0)
  {
    var lastDate = "000000";
    var monthlyPrices = [];
    var monthlyCurrencies = [];
    var monthlyQuantities = [];
    var monthlyShops = [];

    for (i = 0; i < keys.length; i++)
    {
      var dataObject = loadLocalstorageItem(keys[i]);

      if (dataObject != null)
      {
        if ((parseInt(dataObject.year + dataObject.month) > lastDate) && (i != 0))
        {
          summaryData = calculateSummary(monthlyPrices, monthlyCurrencies, monthlyQuantities, monthlyShops);
          createSummaryItem(lastDate.slice(4, 6), lastDate.slice(0, 4), summaryData[0], summaryData[1], summaryData[2], summaryData[3], summaryData[4], summaryData[5]);

          monthlyPrices = [];
          monthlyCurrencies = [];
          monthlyQuantities = [];
          monthlyShops = [];
        }
        monthlyPrices.push(dataObject.price);
        monthlyCurrencies.push(dataObject.currency);
        monthlyQuantities.push(dataObject.quantity);
        monthlyShops.push(dataObject.shop);

        lastDate = dataObject.year + dataObject.month;
      }
    }
    if ((keys.length == 1) && (loadLocalstorageItem(keys[0]) == null))
      return;
    else
    {
      summaryData = calculateSummary(monthlyPrices, monthlyCurrencies, monthlyQuantities, monthlyShops);
      createSummaryItem(lastDate.slice(4, 6), lastDate.slice(0, 4), summaryData[0], summaryData[1], summaryData[2], summaryData[3], summaryData[4], summaryData[5]);
    }
  }
}


// GET LOCALSTORAGE KEYS
function getLocalstorageKeys()
{
  var keys = Object.entries(window.localStorage);
  var keysLength = keys.length;
  var itemsIDs = [];

  if(keysLength > 0){
    for(i=0; i<keysLength; i++){
      itemsIDs.push(parseInt(keys[i]))
    }
    itemsIDs.sort(function(a, b){return a-b});
  }
  return itemsIDs;
}


// CREATE UNIQUE ITEM KEY/ID
function generateLocalstorageKey(month, year)
{
  var keys = getLocalstorageKeys()
  if (keys.length == 0)
  {
    return year + month + "0000000000";
  }
  else
  {
    var matchingKeys = [];
    for (i = 0; i < keys.length; i++)
    {
      if (keys[i].toString().slice(0, 6) == year + month)
        matchingKeys.push(keys[i]);
    }
    if (matchingKeys.length == 0)
      return year + month + "0000000000";
    else
      return (Math.max(...matchingKeys) + 1).toString();
  }
}


// MAKE/SET LOCALSTORAGE ITEM
function setLocalstorageItem(itemNumber, dataObject)
{
  if (dataObject.year + dataObject.month  != itemNumber.toString().slice(0, 6))
  {
    deleteLocalstorageItem(itemNumber);
    itemNumber = generateLocalstorageKey(dataObject.month, dataObject.year);
  }
  let dataJSON = JSON.stringify(dataObject);
  window.localStorage.setItem(itemNumber, dataJSON);
}


// LOAD LOCALSTORAGE ITEM
function loadLocalstorageItem(itemNumber)
{
  let dataJSON = window.localStorage.getItem(itemNumber);
  let dataObject = JSON.parse(dataJSON);
  return dataObject;
}


// DELETE LOCALSTORAGE ITEM
function deleteLocalstorageItem(itemNumber)
{
  window.localStorage.removeItem(itemNumber);
}


// CLEAR ALL OF LOCALSTORAGE
function clearLocalstorage()
{
  window.localStorage.clear();
}
