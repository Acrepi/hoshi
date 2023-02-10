
//clearCookies()


// CREATE COOKIES
function createCookies()
{
  var exdays = 365;
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = d.toUTCString();
  document.cookie = "visited=Yes;expires=" + expires + ";path=/;SameSite=Lax";
}


// GET COOKIE VALUE
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


// CHECK IF COOKIES EXIST
function checkCookies()
{
  var cookie = getCookie("visited");
  if (cookie != "")
    return true;
  else
    return false;
}


// CLEAR ALL COOKIES
function clearCookies()
{
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPosition = cookie.indexOf("=");
    var name = eqPosition > -1 ? cookie.substr(0, eqPosition) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax";
  }
}
