window.onload = () => {
    const transition_el = document.querySelector('.transition');
    const anchors = document.querySelectorAll('a');
    //setTimeout(() =>{
        transition_el.classList.remove('is-active');
    //}, 100);

    for(let i = 0; i < anchors.length; i++){
        const anchor = anchors[i];
        anchor.addEventListener('click', e =>{
            e.preventDefault();
            let target = e.target.href;

            transition_el.classList.add('is-active');

            setTimeout(()=>{
                window.location.href = target;
            }, 500);
        });
    }
}

// window.onbeforeunload = function (e) {
//     var message = "Your confirmation message goes here.",
//     e = e || window.event;
//     // For IE and Firefox
//     if (e) {
//       e.returnValue = message;
//     }
  
//     // For Safari
//     return message;
//   };