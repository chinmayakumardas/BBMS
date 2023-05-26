const target = document.querySelectorAll('[data-target]')
const dataContent = document.querySelectorAll('[data-target-content]');
const btnMenu = document.querySelector('.menu-small');
const menuShow = document.querySelector('.main-nav');
const loading = document.querySelector('.loader-page');


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