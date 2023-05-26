let donationDay = document.getElementById("donationDay");
let nextDonationDay = document.getElementById("nextDonationDay");
donationDay.onchange  = () => {
  let newDate = donationDay.value.split('-');
  let years = Number(newDate[0]);
  let months = 3 + Number(newDate[1]);
  let days = 22 + Number(newDate[2]);


   let newDays = 0;
   let newMonths = 0;

  if(days > 30){
     newDays = days - 30;
     months++;
  }else {
     newDays = days;
  }
   if(months > 12){
      newMonths = months - 12;
      years++;
   }else{
    newMonths = months;
   }
   nextDonationDay.value = `${years}-${newMonths}-${newDays}`;
}
