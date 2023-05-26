const target = document.querySelectorAll('[data-target]')
const dataContent = document.querySelectorAll('[data-target-content]');
const btnMenu = document.querySelector('.menu-small');
const menuShow = document.querySelector('.main-nav');
const loading = document.querySelector('.loader-page');
const hey = document.getElementById('fathy');


// window.setTimeout(function() {
//     loading.style.display = 'none';
//     loading.style.visibility = 'hidden';
//     document.body.style.overflow = 'scroll';
//     document.body.style.overflowX = 'hidden';
//   }, 3500);

btnMenu.addEventListener('click', () =>{
    btnMenu.classList.toggle('active');
    menuShow.classList.toggle('active');
})

 //counter
 const counters = document.querySelectorAll('.counter');
 const speed = 150;
 counters.forEach(counter => {
    const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const inc = target / speed;
        if(count < target){
            counter.innerText = Math.ceil(count + inc) ;
            setTimeout(updateCount, 1);
        }else{
            count.innerText = target;
        }
    };
    updateCount();
 });

 target.forEach(tab => {
     tab.addEventListener('click', () =>{
        const setData = document.querySelector(tab.dataset.target)
        dataContent.forEach(content => {
            content.classList.remove('active')
        })
        target.forEach(tab => {
            tab.classList.remove('active')
        })
        tab.classList.add('active')
        setData.classList.add('active')
     })
 })