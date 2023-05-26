let dateSetting = document.querySelectorAll(`[data-label *="date"]`);
window.onload = ()=>{
  const dateCollector = [...dateSetting];
  let newDate = ""; 
  dateCollector.forEach(ele => {
     let placeholderArray = ele.innerText.split(" ");
     for (let x = 1; x < 4;x++) newDate += ` ${placeholderArray[x]}`;
     ele.innerText = newDate;
     newDate = "";
  });
};