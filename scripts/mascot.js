
var timeoutID;

function mascotTap()
{
  clearTimeout(timeoutID)

  document.getElementById("sideBody").style.backgroundImage = "url('assets/mascot2.png')";

  timeoutID = setTimeout(function()
  {
    document.getElementById("sideBody").style.backgroundImage = "url('assets/mascot1.png')";
  }, 1000);
}
