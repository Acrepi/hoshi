
let cellLock = true;
let currencyRates;
const reader = new FileReader();
let importMode = "";


// LAUNCH WEBSITE
async function reloadRatesAndItems()
{
  clearAddItemForm();
  scrollTopTable();
  currencyRates = await loadCurrencyRates();
  refreshTable(-1);
  //console.log(currencyRates.rates);
}


// LOAD CURRENCY RATES FROM GOOGLE API
async function loadCurrencyRates()
{
  return await fetch(`${"https://api.exchangerate-api.com/v4/latest/USD"}`)
    .then( currency => {
      currencyObject = currency.json()
      return currencyObject;
    });
}


// CALCULATE PRICE (CURRENCY1 -> CURRENCY2)
function calculatePrice(currencyFrom, currencyTo, price)
{
  let rateFrom = currencyRates.rates[currencyFrom];
  let rateTo = currencyRates.rates[currencyTo];
  return (rateTo / rateFrom) * price;
}


// DELETE ALL HTML TABLE ITEMS
function clearTable(tableNumber = -1)
{
  if (tableNumber == 0)
    document.getElementById("list").innerHTML = '';
  else if (tableNumber == 1)
    document.getElementById("list2").innerHTML = '';
  else
  {
    document.getElementById("list").innerHTML = '';
    document.getElementById("list2").innerHTML = '';
  }
}


// SCROLL HTML TABLE TO THE TOP
function scrollTopTable(tableNumber = -1)
{
  if (tableNumber == 0)
    document.getElementById("listHolder").scrollTop = 0;
  else if (tableNumber == 1)
    document.getElementById("listHolder2").scrollTop = 0;
  else
  {
    document.getElementById("listHolder").scrollTop = 0;
    document.getElementById("listHolder2").scrollTop = 0;
  }
}


// RECREATE ALL HTML TABLE (SORTED BY DATE)
function refreshTable(tableNumber = -1)
{
  if (tableNumber == 0)
  {
    clearTable(tableNumber);
    loadItems();
  }
  else if (tableNumber == 1)
  {
    clearTable(tableNumber);
    loadSummaryItems();
  }
  else
  {
    clearTable(tableNumber);
    loadItems();
    loadSummaryItems();
  }
  cellLock = false;
}


// ADD ITEM FROM FORM
function addItem()
{
  let dataObject = {
    month: document.getElementById("addMonth").value,
    year: document.getElementById("addYear").value,
    name: document.getElementById("addName").value,
    price: document.getElementById("addPrice").value,
    currency: document.getElementById("addCurrency").value,
    quantity: document.getElementById("addQuantity").value,
    shop: document.getElementById("addShop").value,
    hyperlink: document.getElementById("addLink").value
  };

  dataObject, isDataCorrect = correctAll(dataObject);

  if (isDataCorrect != false)
  {
    var itemID = generateLocalstorageKey(dataObject.month, dataObject.year);
    setLocalstorageItem(itemID, dataObject)
    refreshTable(-1);
    clearAddItemForm();
  }
  else
  {
    showAlert("form");
  }
}


// SHOW FIRST VISIT WELCOME ALERT
function showWelcomeAlert()
{
  if (checkCookies() == false)
  {
    createCookies();
    showAlert("welcome", ["clearAll()"]);
  }
}


// CLEAR COOKIES AND LOCALSTORAGE
function clearAll()
{
  clearLocalstorage();
  clearCookies();
  clearTable();
}


// SHOW ALERTS
function showAlert(type, functions)
{

  switch (type)
  {
    case "form":
      message = "Something is wrong with your form!";
      buttons = ["Ok"];
      break;
    case "form2":
      message = "Something is wrong with your cell!";
      buttons = [["Ok", functions[0]], ["Restore", functions[1]]];
      break;
    case "import":
      message =
      `
      Do you want to replace or combine the data?<br>
      Using (Combine) may duplicate some rows!
      `;
      buttons = [["Replace", functions[0]], ["Combine", functions[1]], "Cancel"];
      break;
    case "welcome":
      message =
      `
      This website uses <span class='orange'>Cookies</span> and <span class='orange'>LocalStorage</span>.<br>
      If you wish to delete both from your browser,<br>
      click the "Clear All" button below.
      `;
      buttons = ["Ok", ["Clear All", functions[0]]];
      break;
    default:
      message = "Unknown error!";
      buttons = ["Ok"];
      break;
  }

  body = document.body;
  var alertHolder = document.createElement("div");
  alertHolder.classList.add("alertHolder");
  alertHolder.setAttribute("id", "alertHolder");

  var alert = document.createElement("div");
  alert.classList.add("alert");
  alertHolder.appendChild(alert);

  var messageTypeHolder = document.createElement("div");
  messageTypeHolder.classList.add("alertMessageTypeHolder");
  messageTypeHolder.innerHTML = "Warning";
  alert.appendChild(messageTypeHolder);

  var hr = document.createElement("hr");
  alert.appendChild(hr);

  var messageHolder = document.createElement("div");
  messageHolder.classList.add("alertMessageHolder");
  messageHolder.innerHTML = message;
  alert.appendChild(messageHolder);

  var buttonsHolder = document.createElement("div");
  buttonsHolder.classList.add("alertButtonsHolder");
  alert.appendChild(buttonsHolder);

  for (var i = 0; i < buttons.length; i++)
  {
    var button = document.createElement("button");
    button.classList.add("contentButton");
    button.classList.add("alertButton");

    if ((Array.isArray(buttons[i])) && (buttons[i].length == 2))
    {
      button.setAttribute("onclick", "hideAlert(), " + buttons[i][1]);
      button.innerHTML = buttons[i][0];
      buttonsHolder.appendChild(button);
    }
    else if (!Array.isArray(buttons[i]))
    {
      button.setAttribute("onclick", "hideAlert()");
      button.innerHTML = buttons[i];
      buttonsHolder.appendChild(button);
    }
  }

  body.appendChild(alertHolder);
}


// HIDE ALERT
function hideAlert()
{
  const alertHolder = document.getElementById("alertHolder");
  alertHolder.remove();
}


// CLEAR ADD ITEM FORM IMPUTS
function clearAddItemForm()
{
  document.getElementById("addMonth").value = "";
  document.getElementById("addYear").value = "";
  document.getElementById("addName").value = "";
  document.getElementById("addPrice").value = "";
  document.getElementById("addCurrency").value = "JPY";
  document.getElementById("addQuantity").value = "1";
  document.getElementById("addShop").value = "";
  document.getElementById("addLink").value = "";
}


// CHECK AND FIX ALL OBJECT data
function correctAll(dataObject)
{
  dataObject.month = correctMonth(dataObject.month);
  dataObject.year = correctYear(dataObject.year);
  dataObject.name = correctCell(dataObject.name);
  dataObject.price = correctPrice(dataObject.price);
  dataObject.currency = correctCurrency(dataObject.currency);
  dataObject.quantity = correctQuantity(dataObject.quantity);
  dataObject.shop = correctCell(dataObject.shop);
  dataObject.hyperlink = correctCell(dataObject.hyperlink);

  isDataCorrect = true;

  for (var key in dataObject) {
    if (dataObject[key] == false)
    {
      isDataCorrect = false;
      break;
    }
  }

  return dataObject, isDataCorrect;
}


// CHECK AND FIX MONTH FOR FORMS
function correctMonth(month)
{
  month = month.toLowerCase().replace(/\s/g, '');
  var newMonth;
  switch (month)
  {
    case '1':
    case '01':
    case 'january':
      newMonth = "01";
      break;
    case '2':
    case '02':
    case 'february':
      newMonth = "02";
      break;
    case '3':
    case '03':
    case 'march':
      newMonth = "03";
      break;
    case '4':
    case '04':
    case 'april':
      newMonth = "04";
      break;
    case '5':
    case '05':
    case 'may':
      newMonth = "05";
      break;
    case '6':
    case '06':
    case 'june':
      newMonth = "06";
      break;
    case '7':
    case '07':
    case 'july':
      newMonth = "07";
      break;
    case '8':
    case '08':
    case 'august':
      newMonth = "08";
      break;
    case '9':
    case '09':
    case 'september':
      newMonth = "09";
      break;
    case '10':
    case 'october':
      newMonth = "10";
      break;
    case '11':
    case 'november':
      newMonth = "11";
      break;
    case '12':
    case 'december':
      newMonth = "12";
      break;
    default:
      newMonth = false;
  }
  return newMonth;
}


// CHECK AND FIX YEAR FOR FORMS
function correctYear(year)
{
  year = year.replace(/\s/g, '');
  if ((isNaN(year) == false) && (year.length == 4))
    return year;
  else if ((isNaN(year) == false) && (year.length == 2))
    return "20" + year;
  else
    return false;
}


// CHECK AND FIX PRICE FOR FORMS
function correctPrice(price)
{
  price = price.replace(/\s/g, '');
  price = price.replace(',', '');
  if ((isNaN(price) == false) && (price.length > 0) && (price.length < 16) && (price > 0))
  {
    // count dots
    var dots = 0;
    for (i = 0; i < price.length; i++)
    {
      if (price.slice(i, i+1) == ".")
        dots++;
    }

    // fill to .XX if needed
    if (dots == 1)
    {
      if (price.indexOf(".") == price.length - 3)
        return price;
      else if (price.indexOf(".") > price.length - 3)
        return price.padEnd(price.indexOf(".") + 3, "0");
      else
        return price.slice(0, price.indexOf(".") + 3);
    }
    else if (dots == 0)
    {
      return price + ".00";
    }
    else
    {
      return false;
    }
  }
  else
  {
    return false;
  }
}


// CHECK AND FIX CURRENCY FOR FORMS
function correctCurrency(cur)
{
  //cur = cur.replace(/\s/g, '');
  if ((cur.length > 0) && (cur.length < 4))
    return cur.toUpperCase();
  else
    return false;
}


// CHECK AND FIX INPUT FOR QUANTITY
function correctQuantity(qty)
{
  qty = qty.replace(/\s/g, '');
  qty = qty.replace(',', '');
  qty = qty.replace('.', '');
  if ((isNaN(qty) == false) && (qty.length > 0) && (qty.length < 4) && (qty > 0))
  {
    return qty;
  }
  else
  {
    return false;
  }
}


// CHECK AND FIX INPUT FOR FORMS
function correctCell(cell)
{
  cell = cell.trim();
  if ((cell.length > 0) && (cell.length < 256))
    return cell;
  else
    return false;
}


// CHANGE FIRST LETTER OF WORD INTO CAPITAL
function capitalLetter(string)
{
  return string.charAt(0).toUpperCase() + string.slice(1);
}


// COUNT UNIQUE ELEMENTS OF ARRAY/STRING
function countUnique(iterable)
{
  return new Set(iterable).size;
}


// CALCULATE MONTHLY SUMMARY DATA
function calculateSummary(prices, currencies, quantities, shops)
{
  var monthlyShops = countUnique(shops);
  var monthlyPrice = 0;
  var desiredCurrency = document.getElementById("setDesiredCurrency").value;
  var arrayLength = prices.length;

  for (var i = 0; i < arrayLength; i++)
  {
    monthlyPrice += calculatePrice(currencies[i], desiredCurrency, prices[i] * quantities[i]);
  }

  var tax = document.getElementById("setTax").value;
  tax = monthlyPrice * (parseInt(tax) / 100);

  var deliveryPrice = document.getElementById("setDeliveryPrice").value;
  var deliveryCurrency = document.getElementById("setDeliveryCurrency").value;
  deliveryPrice = calculatePrice(deliveryCurrency, desiredCurrency, monthlyShops * deliveryPrice);

  var finalPrice = monthlyPrice + tax + deliveryPrice;

  return [monthlyShops, monthlyPrice.toFixed(2), tax.toFixed(2), deliveryPrice.toFixed(2), finalPrice.toFixed(2), desiredCurrency];
}


// CREATE HTML FOR ITEM
function createItem(itemNumber, dataObject)
{
  var data = [dataObject.month, dataObject.year, dataObject.name, dataObject.price, dataObject.currency, dataObject.quantity, dataObject.shop,  dataObject.hyperlink]

  // row
  var row = document.createElement("div");
	row.classList.add("row");
	//row.setAttribute("id", "item" + itemNumber);

  // row content holder
  var itemContentHolder = document.createElement("div");
  itemContentHolder.classList.add("itemContentHolder");
  //itemContentHolder.setAttribute("id", "item" + itemNumber + "ContentHolder");
  row.appendChild(itemContentHolder);

  const cellsNames = ["month", "year", "name", "price", "currency", "quantity", "shop", "hyperlink"];
  var arrayLength = cellsNames.length;
  var itemContent = [];

  for (var i = 0; i < arrayLength; i++)
  {
    var cell = cellsNames[i];
    var cellCapital = capitalLetter(cellsNames[i]);
    var s = itemContent.length;

    if (cell == "name")
    {
      // data holder holder
      itemContent.push(document.createElement("div"));
      itemContent[s].classList.add("itemCell");
    	itemContent[s].classList.add("item" + cellCapital + "Holder");
    	//itemContent[s].setAttribute("id", "item" + itemNumber + cellCapital + "HolderHolder");
    	itemContentHolder.appendChild(itemContent[s]);

      // data holder
      itemContent.push(document.createElement("div"));
    	itemContent[s + 1].classList.add("item" + cellCapital);
    	//itemContent[s + 1].setAttribute("id", "item" + itemNumber + cellCapital + "Holder");
    	itemContent[s].appendChild(itemContent[s + 1]);

      // data
      itemContent.push(document.createElement("span"));
      itemContent[s + 2].classList.add("pointer");
    	itemContent[s + 2].setAttribute("id", "item" + itemNumber + cellCapital);
      itemContent[s + 2].setAttribute("onclick", "editItem(" +  itemNumber  + ", " + "\'" + cell + "\'" + ")");
      itemContent[s + 2].innerHTML = data[i];
      itemContent[s + 2].title = data[i];
    	itemContent[s + 1].appendChild(itemContent[s + 2]);

      // data edit
      itemContent.push(document.createElement("input"));
      itemContent[s + 3].classList.add("input");
      itemContent[s + 3].classList.add("item" + cellCapital + "Edit");
    	itemContent[s + 3].setAttribute("id", "item" + itemNumber + cellCapital + "Edit");
      itemContent[s + 3].setAttribute("type", "text");
      itemContent[s + 3].setAttribute("placeholder", cell);
      itemContent[s + 3].setAttribute("value", data[i]);
      itemContent[s + 3].setAttribute("onfocusout", "saveItem(" +  itemNumber  + ", " + "\'" + cell + "\'" + ")");
      itemContent[s + 3].style.display = "none";
    	itemContent[s + 1].appendChild(itemContent[s + 3]);
    }
    else if (cell == "currency")
    {
      // data holder
      itemContent.push(document.createElement("div"));
      itemContent[s].classList.add("itemCell");
    	itemContent[s].classList.add("item" + cellCapital);
    	//itemContent[s].setAttribute("id", "item" + itemNumber + cellCapital + "Holder");
    	itemContentHolder.appendChild(itemContent[s]);

      // data
      itemContent.push(document.createElement("span"));
      itemContent[s + 1].classList.add("pointer");
    	itemContent[s + 1].setAttribute("id", "item" + itemNumber + cellCapital);
      itemContent[s + 1].setAttribute("onclick", "editItem(" +  itemNumber  + ", " + "\'" + cell + "\'" + ")");
      itemContent[s + 1].innerHTML = data[i];
      itemContent[s + 1].title = data[i];
    	itemContent[s].appendChild(itemContent[s + 1]);

      // data edit
      itemContent.push(document.createElement("select"));
      itemContent[s + 2].classList.add("input");
      itemContent[s + 2].classList.add("item" + cellCapital + "Edit");
    	itemContent[s + 2].setAttribute("id", "item" + itemNumber + cellCapital + "Edit");
      itemContent[s + 2].setAttribute("onfocusout", "saveItem(" +  itemNumber  + ", " + "\'" + cell + "\'" + ")");
      itemContent[s + 2].style.display = "none";
    	itemContent[s].appendChild(itemContent[s + 2]);

      var currencies = ["AUD", "CAD", "CNY", "GBP", "JPY", "PLN", "USD"];
      for (j = 0; j < currencies.length; j++)
      {
        itemContent.push(document.createElement("option"));
        itemContent[s + 3 + j].setAttribute("value", currencies[j]);
        if (currencies[j] == data[i])
          itemContent[s + 3 + j].setAttribute("selected", "selected");
        itemContent[s + 3 + j].innerHTML = currencies[j];
        itemContent[s + 2].appendChild(itemContent[s + 3 + j]);
      }
    }
    else if (cell == "hyperlink")
    {
      // data 1 holder holder
      itemContent.push(document.createElement("div"));
      itemContent[s].classList.add("itemCell");
    	itemContent[s].classList.add("itemLink1");
    	itemContent[s].setAttribute("id", "item" + itemNumber + cellCapital + "A");
    	//itemContent[s].setAttribute("id", "item" + itemNumber + "Link1Holder");
    	itemContentHolder.appendChild(itemContent[s]);

      // data 1
      itemContent.push(document.createElement("a"));
      itemContent[s + 1].classList.add(cell);
      //itemContent[s + 1].setAttribute("id", "item" + itemNumber + "Link1");
    	itemContent[s + 1].setAttribute("href", data[i]);
      itemContent[s + 1].innerHTML = "click here";
    	itemContent[s].appendChild(itemContent[s + 1]);

      // data 2 holder
      itemContent.push(document.createElement("div"));
      itemContent[s + 2].classList.add("itemCell");
    	itemContent[s + 2].classList.add("itemLink2");
    	itemContent[s + 2].setAttribute("id", "item" + itemNumber + cellCapital + "B");
    	//itemContent[s + 2].setAttribute("id", "item" + itemNumber + "Link2Holder");
    	itemContentHolder.appendChild(itemContent[s + 2]);

      // data 2
      itemContent.push(document.createElement("span"));
      itemContent[s + 3].classList.add("pointer");
    	itemContent[s + 3].setAttribute("id", "item" + itemNumber + cellCapital);
      itemContent[s + 3].setAttribute("onclick", "editItem(" +  itemNumber  + ", " + "\'" + cell + "\'" + ")");
      itemContent[s + 3].innerHTML = data[i];
      itemContent[s + 3].title = data[i];
    	itemContent[s + 2].appendChild(itemContent[s + 3]);

      // data edit
      itemContent.push(document.createElement("input"));
      itemContent[s + 4].classList.add("input");
      itemContent[s + 4].classList.add("item" + cellCapital + "Edit");
    	itemContent[s + 4].setAttribute("id", "item" + itemNumber + cellCapital + "Edit");
      itemContent[s + 4].setAttribute("type", "text");
      itemContent[s + 4].setAttribute("placeholder", cell);
      itemContent[s + 4].setAttribute("value", data[i]);
      itemContent[s + 4].setAttribute("onfocusout", "saveItem(" +  itemNumber  + ", " + "\'" + cell + "\'" + ")");
      itemContent[s + 4].style.display = "none";
    	itemContent[s + 2].appendChild(itemContent[s + 4]);
    }
    else
    {
      // data holder
      itemContent.push(document.createElement("div"));
      itemContent[s].classList.add("itemCell");
    	itemContent[s].classList.add("item" + cellCapital);
    	//itemContent[s].setAttribute("id", "item" + itemNumber + cellCapital + "Holder");
    	itemContentHolder.appendChild(itemContent[s]);

      // data
      itemContent.push(document.createElement("span"));
      itemContent[s + 1].classList.add("pointer");
    	itemContent[s + 1].setAttribute("id", "item" + itemNumber + cellCapital);
      itemContent[s + 1].setAttribute("onclick", "editItem(" +  itemNumber  + ", " + "\'" + cell + "\'" + ")");
      itemContent[s + 1].innerHTML = data[i];
      itemContent[s + 1].title = data[i];
    	itemContent[s].appendChild(itemContent[s + 1]);

      // data edit
      itemContent.push(document.createElement("input"));
      itemContent[s + 2].classList.add("input");
      itemContent[s + 2].classList.add("item" + cellCapital + "Edit");
    	itemContent[s + 2].setAttribute("id", "item" + itemNumber + cellCapital + "Edit");
      itemContent[s + 2].setAttribute("type", "text");
      if (cell == "quantity")
        itemContent[s + 2].setAttribute("placeholder", "qty.");
      else
        itemContent[s + 2].setAttribute("placeholder", cell);
      itemContent[s + 2].setAttribute("value", data[i]);
      itemContent[s + 2].setAttribute("onfocusout", "saveItem(" +  itemNumber  + ", " + "\'" + cell + "\'" + ")");
      itemContent[s + 2].style.display = "none";
    	itemContent[s].appendChild(itemContent[s + 2]);
    }
  }

  // delete button holder
  var itemButtonHolder = document.createElement("div");
  itemButtonHolder.classList.add("itemButtonHolder");
  //itemButtonHolder.setAttribute("id", "item" + itemNumber + "ButtonHolder");
  row.appendChild(itemButtonHolder);

  // button holder
  var itemButton = document.createElement("a");
  itemButton.classList.add("itemButton");
  //itemButton.setAttribute("id", "item" + itemNumber + "Button");
  itemButton.setAttribute("onclick", "deleteItem(" +  itemNumber  + ")");
  itemButton.innerHTML = "DELETE";
  itemButtonHolder.appendChild(itemButton);

	document.getElementById("list").appendChild(row);
}


// CREATE HTML FOR DIVIDER
function createItemDivider()
{
  var row = document.createElement("div");
  row.classList.add("row");

  document.getElementById("list").appendChild(row);
}


// CREATE HTML FOR MONTHLY SUMMARY
function createSummaryItem(month, year, monthlyShops, monthlyPrice, tax, delivery, finalPrice, desiredCurrency)
{
  var data = [month, year, monthlyShops, monthlyPrice + " " + desiredCurrency, tax + " " + desiredCurrency, delivery + " " + desiredCurrency, "",  finalPrice + " " + desiredCurrency];

  // row
  var row = document.createElement("div");
  row.classList.add("row");

  const cellsNames = ["month", "year", "shops", "monthlyPrice", "tax", "delivery", "divider", "finalPrice"];
  var arrayLength = cellsNames.length;
  var itemContent = [];

  for (var i = 0; i < arrayLength; i++)
  {
    var cell = cellsNames[i];
    var cellCapital = capitalLetter(cellsNames[i]);
    var s = itemContent.length;

    // data holder
    itemContent.push(document.createElement("div"));
    itemContent[s].classList.add("itemCell");
  	itemContent[s].classList.add("item" + cellCapital);
  	row.appendChild(itemContent[s]);

    // data
    itemContent.push(document.createElement("span"));
    itemContent[s + 1].classList.add("auto");
    itemContent[s + 1].innerHTML = data[i];
    //itemContent[s + 1].title = data[i];
  	itemContent[s].appendChild(itemContent[s + 1]);
  }

  document.getElementById("list2").appendChild(row);
}


// EDIT ITEMS CELL
function editItem(itemNumber, cell)
{
  if (cellLock == false)
  {
    //console.log("Editing " + cell + " of item nr " + itemNumber);

    cellLock = true;
    cellCapital = capitalLetter(cell);

    document.getElementById("item" + itemNumber + cellCapital).style.display = "none";
    document.getElementById("item" + itemNumber + cellCapital + "Edit").style.display = "block";
    if (cell == "hyperlink")
    {
      document.getElementById("item" + itemNumber + cellCapital + "A").style.display = "none";
      document.getElementById("item" + itemNumber + cellCapital + "B").style.width = "157px";
    }
    setTimeout(function(){
      document.getElementById("item" + itemNumber + cellCapital + "Edit").focus();
      document.getElementById("item" + itemNumber + cellCapital + "Edit").selectionStart = 10000; document.getElementById("item" + itemNumber + cellCapital + "Edit").selectionEnd = 10000;
    }, 0)
  }
}


// FOCUS ON DATA EDIT
function focusInput(itemNumber, cell)
{
  cellCapital = capitalLetter(cell);
  document.getElementById("item" + itemNumber + cellCapital + "Edit").focus();
  document.getElementById("item" + itemNumber + cellCapital + "Edit").selectionStart = 10000; document.getElementById("item" + itemNumber + cellCapital + "Edit").selectionEnd = 10000;
}


// SAVE ITEMS CELL
function saveItem(itemNumber, cell)
{
  //console.log("Saving " + cell + " of item nr " + itemNumber)

  cellCapital = capitalLetter(cell);
  var value = document.getElementById("item" + itemNumber + cellCapital + "Edit").value;
  var newCell;

  switch (cell)
  {
    case "month":
      newValue = correctMonth(value);
      break;
    case "year":
      newValue = correctYear(value);
      break;
    case "price":
      newValue = correctPrice(value);
      break;
    case "currency":
      newValue = correctCurrency(value);
      break;
    case "quantity":
      newValue = correctQuantity(value);
      break;
    default:
      newValue = correctCell(value);
  }

  if (newValue == false)
  {
    cellLock = true;
    showAlert("form2", ["focusInput(" + itemNumber + ", \'" + cell + "\')", "refreshTable()"]);
  }
  else
  {
    /*
    document.getElementById("item" + itemNumber + cellCapital).innerHTML = newValue;
    document.getElementById("item" + itemNumber + cellCapital + "Edit").value = newValue;
    document.getElementById("item" + itemNumber + cellCapital).style.display = "block";
    document.getElementById("item" + itemNumber + cellCapital + "Edit").style.display = "none";
    if (cell == "hyperlink")
    {
      document.getElementById("item" + itemNumber + "Link1").href = newValue;
    }
    */

    let dataObject = {
      month: document.getElementById("item" + itemNumber + "MonthEdit").value,
      year: document.getElementById("item" + itemNumber + "YearEdit").value,
      name: document.getElementById("item" + itemNumber + "NameEdit").value,
      price: document.getElementById("item" + itemNumber + "PriceEdit").value,
      currency: document.getElementById("item" + itemNumber + "CurrencyEdit").value,
      quantity: document.getElementById("item" + itemNumber + "QuantityEdit").value,
      shop: document.getElementById("item" + itemNumber + "ShopEdit").value,
      hyperlink: document.getElementById("item" + itemNumber + "HyperlinkEdit").value
    }

    dataObject[cell] = newValue;

    setLocalstorageItem(itemNumber, dataObject)
    refreshTable(-1);
  }
}


// DELETE ITEM
function deleteItem(itemNumber)
{
  deleteLocalstorageItem(itemNumber);
  refreshTable(-1);
}


// EXPORT DATA TO FILE
function exportFile()
{
  var keys = getLocalstorageKeys();
  var content = "";
  for (var i = 0; i < keys.length; i++)
  {
    content += window.localStorage.getItem(keys[i]);
    if (i != keys.length - 1)
    	content += "\n";
  }
  //console.log(content);

  var fileName = 'backup_data.txt';
  var contentType = 'text/plain';

  var a = document.createElement("a");
  var file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}


// SHOW IMPORT OPTIONS
function importOptions()
{
  showAlert("import", ["importTrigger('replace')", "importTrigger('combine')"])
}


// TRIGGER IMPORT FUNCTION
function importTrigger(mode)
{
  importMode = mode;
  document.getElementById('importInput').click();
}


// IMPORT FILE AS DATA
async function importFile()
{
  if (importMode == "replace")
    clearLocalstorage();
  file = document.getElementById("importInput").files[0];
  //console.log(file);

  reader.onload = function (){
    var data = reader.result.split("\n");
  	errorLines = 0;
  	emptyLines = 0;
  	invalidData = 0;
  	for (var i = 0; i < data.length; i++)
    {
  		try
  		{
  			var dataObject = JSON.parse(data[i]);

  			try
  			{
  				dataObject.month = correctMonth(dataObject.month);
  				dataObject.year = correctYear(dataObject.year);
  				dataObject.name = correctCell(dataObject.name);
  				dataObject.price = correctPrice(dataObject.price);
  				dataObject.currency = correctCurrency(dataObject.currency);
  				dataObject.shop = correctCell(dataObject.shop);
  				dataObject.hyperlink = correctCell(dataObject.hyperlink);

  				var itemID = generateLocalstorageKey(dataObject.month, dataObject.year);
  				setLocalstorageItem(itemID, dataObject);
  			}
  			catch(e)
  			{
  				errorLines += 1;
  				invalidData += 1;
  			}
  		}
  		catch(e)
  		{
  			errorLines += 1;
  			if (data[i] == "")
  				emptyLines += 1;
  			else
  				invalidData += 1;
  		}
  	}
  	otherlines = errorLines - emptyLines - invalidData;
  	console.log("Failed to load " + errorLines + " line(s) of data");
  	console.log("-- Invalid data:    " + emptyLines);
  	console.log("-- Empty lines:     " + emptyLines);
  	console.log("-- Other:           " + otherlines);
    refreshTable(-1);
    importMode = "";
  };
  reader.readAsText(file);
}
