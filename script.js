
let typingSound = $('#typing-sound')[0];

let typingAnimationContainer = document.querySelector('.typing-animation');
let content = 'Welcome to my Playground.';
let contentLong = 'Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. Hello My name is Charlie. ';

function typingAnimation(content, container) {
    let i=0;
    addTypingChars = (chars, typingContainer) => {
        if (i===0) typingSound.play();
        if (i===chars.length-1){
            console.log('pause');
            typingSound.pause();
        }
        if (i<chars.length){
            typingContainer.innerHTML += chars[i];
            i++;
            setTimeout(addTypingChars, Math.random()*200+30, chars, typingContainer);
        }
    }
    setTimeout(addTypingChars, 1500, content, container);
}
typingAnimation(content,typingAnimationContainer);

let navBtns = document.querySelectorAll('.nav-btn');
navBtns.forEach(btn => {
    btn.addEventListener('click', (e)=>{
        
        $('.section.active').removeClass('active');
        $(`.section[data-section="${btn.dataset.section}"]`).addClass('active');
        $(`.nav-btn.active-btn`).removeClass('active-btn');
        $(`.nav-btn[data-section="${btn.dataset.section}"]`).addClass('active-btn');
    })
});




// calculate x and y for circular-layout-element
const applyCircularLayout = (element, radius) => {
    let centerElement = $('.circular-layout-center-element');
    let parentElementBounds = centerElement.parent()[0].getBoundingClientRect();
    let bounds = centerElement[0].getBoundingClientRect();
    let centerX = bounds.x + (bounds.width/2) - parentElementBounds.left - (element.getBoundingClientRect().width / 2);
    let centerY = bounds.top + (bounds.height/2) - parentElementBounds.top - (element.getBoundingClientRect().height / 2);
    let deg = parseFloat(element.dataset.deg);
    let degInRadians = deg * (Math.PI/180);
    let x = radius * Math.cos(degInRadians);
    let y = (radius * Math.sin(degInRadians) * -1);
    element.style.left = `${centerX + x}px`;
    element.style.top = `${centerY + y}px`;
};


let circularElements = document.querySelectorAll('.inner-circle.circular-layout-element');
let innerRadius = $('.circular-layout-center-element')[0].getBoundingClientRect().width / 2;
circularElements.forEach(element => {
    applyCircularLayout(element, innerRadius);
    element.addEventListener('click', ()=>{
        console.log(typingSound);
        typingSound.play();
    });
});

window.addEventListener('resize',()=>{
    console.log('resize called');
    circularElements.forEach(element => {
        applyCircularLayout(element);
    });
}, true);

$('.circular-layout-element').hover(function(){
    $('.circular-layout-element').removeClass('bubble-expand-animation');
    // $(this).addClass('bubble-scale')
}, function(){
    // $(this).removeClass('bubble-scale');
    $('.circular-layout-element').addClass('bubble-expand-animation');
});

const intersectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
    });
}, { threshold: 0.5})
let skillbarFills = document.querySelectorAll('.skills-container');
skillbarFills.forEach(element => intersectionObserver.observe(element));

// modal
const projectCards = document.querySelectorAll('.project-container > .card');
const projectModal = document.querySelector('#project-modal')
const projectModalHeader = document.querySelector('.modal-header');
const projectModalImgContainer = document.querySelector('.modal-img-container');
const projectModalImg = document.querySelector('.modal-img');
const projectModalContent = document.querySelector('.modal-text-content');
const projectModalLinkContainer = document.querySelector('.modal-link-container');
// clicking on a project card opens modal with information on the project card.
projectCards.forEach(card => card.addEventListener('click', ()=>{
    for (let child of card.children){
        if (child.className.includes('card-img')) projectModalImg.src = child.src;
        if (child.className.includes('card-header')) projectModalHeader.innerHTML = child.innerHTML;
        if (child.className.includes('card-body')) projectModalContent.innerHTML = child.innerHTML;
        let abridged = document.querySelector('.modal-text-content>.abridged-text');
        if (abridged) abridged.classList.add('reveal-abridged');
        if (child.className.includes('card-footer')) {
            projectModalLinkContainer.innerHTML = child.innerHTML;
            // find project-link if exists and add the link href to modal img container
            for (let link of child.children){
                if (link.className.includes('project-link')) projectModalImgContainer.href = link.getAttribute("href");
            }
        }
        
        

    }
    projectModal.showModal();
}));
document.querySelector('.modal-close-btn').addEventListener('click', () => projectModal.close());
// modal should close if backdrop is clicked.
projectModal.addEventListener('click', (e) => {
    // determine if the click is outside the modal bounding rect. in other words, clicked backdrop.
    let modalBounds = projectModal.getBoundingClientRect();
    if (!(modalBounds.top < e.clientY && modalBounds.bottom > e.clientY && modalBounds.left < e.clientX && modalBounds.right > e.clientX)) {
        projectModal.close();
    }
});