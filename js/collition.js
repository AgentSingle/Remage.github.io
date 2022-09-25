/* :~~~~~::~~~~~::~~~~~:| IMPORT REQUIRE DOM |:~~~~~::~~~~~::~~~~~: */
const background = document.querySelector('.Background_Rect'); // MAIN VISIBLE CONTAINER [BACKGROUND/ WRAPPER]
const Cropper_Wrapper = document.querySelector('.Cropper_Wrapper'); // PARENT OF CROPPER RECTANGLE
const Cropper = document.querySelector('.Cropper_Rect'); // CROPPER RECTANGLE
const Image_Wrapper = document.querySelector('.Image_Rect'); // PICTURE WRAPPER CONTAINER
const Image_Content = Image_Wrapper.firstElementChild; // PICTURE
const residers = document.querySelectorAll('.mover'); // RESIDER [E, SE, S, SW, W, NW, N, NE]



/* :~~~~~::~~~~~:| FUNCTION RETURN MINIMUM AND MAXIMUM VALUE FROM AN ARRAY |:~~~~~::~~~~~: */
Array.min = function( min_arr ){
    return Math.min.apply( Math, min_arr );  // GET MINIMUM VALUE FROM AN ARRAY
};
Array.max = function( max_arr ){
    return Math.max.apply( Math, max_arr );  // GET MAXIMUM VALUE FROM AN ARRAY
};


/* :~~~~~::~~~~~::~~~~~:| INITIALIZE CROPPER WIDTH & HEIGHT |:~~~~~::~~~~~::~~~~~: */
let wd = 100; // :INITIAL WIDTH OF CROPPER
let AspectRatio = 3/2; // CROPPER ASPECT-RATIO
const CropperSize = ()=>{
    Cropper_Wrapper.style.position = `absolute`;
    Cropper.style.width = `${wd}px`;
    Cropper.style.height = `${wd*AspectRatio}px`;
    Cropper.style.left = `${0}`;
    Cropper.style.top = `${0}`;
}
CropperSize();


/* :~~~~~::~~~~~::~~~~~:| REQUIRE BOUNDING RECTANGLE |:~~~~~::~~~~~::~~~~~: */
let background_rect = background.getBoundingClientRect(), // BACKGROUND RECTANGLE
    Cropper_Wrapper_rect = Cropper_Wrapper.getBoundingClientRect(), // CROPPER WRAPPER RECTANGLE
    Cropper_rect = Cropper.getBoundingClientRect(); // CROPPER RECTANGLE


/* :~~~~~::~~~~~::~~~~~:| ADJUST PICTURE ACCORDING TO HEIGHT & WIDTH |:~~~~~::~~~~~::~~~~~: */
let Image_Content_AspectRatio = (Image_Content.naturalWidth / Image_Content.naturalHeight) /* PICTURE ASPECT-RATIO */ 
let Background_AspectRatio = (background_rect.width / background_rect.height) /* BACKGROUND ASPECT-RATIO */ 

/* -----:[ WHEN PICTURE WIDTH > HEIGHT ]:----- */
if (Image_Content_AspectRatio >= Background_AspectRatio){
    Image_Wrapper.style.width = `${background_rect.width}px`;
    Image_Wrapper.style.height = `${Math.round(background_rect.width / Image_Content_AspectRatio)}px`;
    position_content();
}
/* -----:[ WHEN PICTURE WIDTH < HEIGHT ]:----- */
if ((Image_Content_AspectRatio) < Background_AspectRatio & (Image_Content_AspectRatio > 0)){
    Image_Wrapper.style.width = `${Math.round(background_rect.height * Image_Content_AspectRatio)}px`;
    Image_Wrapper.style.height = `${background_rect.height}px`;
    position_content();
}
/* -----:[ CENTER ALL CONTENTS ]:----- */
function position_content(){
    Cropper.style.left = `calc(50% - ${Cropper_rect.width/2}px)`;
    Cropper.style.top = `calc(50% - ${Cropper_rect.height/2}px)`;
    Image_Content.style.width = `100%`;
    Image_Content.style.height = `100%`;
    Image_Wrapper.style.left = `calc(50% - ${Image_Content.width/2}px)`;
    Image_Wrapper.style.top = `calc(50% - ${Image_Content.height/2}px)`;
}
let Image_Wrapper_rect = Image_Wrapper.getBoundingClientRect();


/* :~~~~~::~~~~~::~~~~~:| VARIABLES |:~~~~~::~~~~~::~~~~~: */
let cropperTouchX,
    cropperTouchY,
    cropperMoveX = 0,
    cropperMoveY = 0,
    IsCropperMoving = false,
    IsResizing = false,
    imgTouchX,
    imgTouchY,
    imgMoveX = 0,
    imgMoveY = 0,
    residersTouchX,
    residersTouchY,
    BackgroundCenterX = (background_rect.left + background_rect.width/2),
    BackgroundCenterY = (background_rect.top + background_rect.height/2);


/* :~~~~~::~~~~~:| MOVEABLE AREA AND ITS BOUNDARY |:~~~~~::~~~~~: */
/* [ MAXIMUM WIDTH OF MOVEABLE AREA ] */
let width_arr = [background_rect.width, Image_Content.width],
    moveable_area_width = Array.min(width_arr);

/* [ MAXIMUM HEIGHT OF MOVEABLE AREA ] */
let height_arr = [background_rect.height, Image_Wrapper_rect.height],
    moveable_area_height = Array.min(height_arr);

/* [ MAXIMUM HEIGHT OF MOVEABLE AREA ] */
let right_arr = [Image_Wrapper_rect.right, background_rect.right],
    moveable_area_right = Array.min(right_arr);

/* [ MAXIMUM HEIGHT OF MOVEABLE AREA ] */
let bottom_arr = [Image_Wrapper_rect.bottom, background_rect.bottom],
    moveable_area_bottom = Array.min(bottom_arr);

/* [ MAXIMUM HEIGHT OF MOVEABLE AREA ] */
let left_arr = [Image_Wrapper_rect.left, background_rect.left],
    moveable_area_left = Array.max(left_arr);

/* [ MAXIMUM HEIGHT OF MOVEABLE AREA ] */
let top_arr = [Image_Wrapper_rect.top, background_rect.top],
    moveable_area_top = Array.max(top_arr);


/* :~~~~~::~~~~~::~~~~~:| RELOAD LOCATION ON RESIZE |:~~~~~::~~~~~::~~~~~: */
window.addEventListener('resize', ()=>{
    setTimeout(() => {
        location.reload();
    }, 2000);
})
/* :~~~~~::~~~~~::~~~~~::~~~~~::~~~~~:|***|:~~~~~::~~~~~::~~~~~::~~~~~::~~~~~: */




/* :~~~~~::~~~~~::~~~~~:| MOVE CROPPER RECTANGLE FUNCTION |:~~~~~::~~~~~::~~~~~: */
const detect_cropper_collision = (cropperMoveX, cropperMoveY)=>{
    Cropper_Wrapper.style.transform = `translate(${cropperMoveX}px, ${cropperMoveY}px) `;
}

/* :~~~~~:| DETECT ANY COLLISION HAPPEN BETWEEN CROPPER AND LARGE-RECTANGLE, OR NOT |:~~~~~: */
Cropper.addEventListener('mousedown', cropperMouseDown);

function cropperMouseDown(e){
    e.preventDefault();
    IsCropperMoving = true;
    cropperTouchX = e.clientX - cropperMoveX;
    cropperTouchY = e.clientY - cropperMoveY;

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);

    /* :----*---:| MOUSE-MOVE EVENT |:----*---: */
    function mousemove(event){
        event.preventDefault();

        if(IsCropperMoving == true & !IsResizing){
            cropperMoveX = event.clientX - cropperTouchX;
            cropperMoveY = event.clientY - cropperTouchY;
            Cropper_rect = Cropper.getBoundingClientRect();
            Cropper_Wrapper_rect = Cropper_Wrapper.getBoundingClientRect();

            /* ----*---:| MOVE MAX X-DIRECTION |:----*--- */
            cropperMoveX = Math.min(
                Math.max(cropperMoveX, 
                    ((Cropper_rect.width - moveable_area_width)/2 - (Cropper_rect.left - Cropper_Wrapper_rect.left))
                ), ((moveable_area_width - Cropper_rect.width)/2 - (Cropper_rect.left - Cropper_Wrapper_rect.left))
            );

            /* ----*---:| MOVE MAX Y-DIRECTION |:----*--- */
            cropperMoveY = Math.min(
                Math.max(
                    cropperMoveY,
                    ((Cropper_rect.height - moveable_area_height)/2  - (Cropper_rect.top - Cropper_Wrapper_rect.top))
                ), ((moveable_area_height - Cropper_rect.height)/2  - (Cropper_rect.top - Cropper_Wrapper_rect.top))
            );
            detect_cropper_collision(cropperMoveX, cropperMoveY);
        }

    }

    /* :----*---:| MOUSE-UP EVENT |:----*---: */
    function mouseup(){
        IsCropperMoving = false;
        window.removeEventListener('mouseup', mouseup);
        window.removeEventListener('mousemove', mousemove);
    }

}



/* :~~~~~::~~~~~::~~~~~:| RESIZE THE CROPPER RECTANGLE |:~~~~~::~~~~~::~~~~~:*/
for (let resider of residers){

    resider.addEventListener('mousedown', residersMouseEvent);

    function residersMouseEvent(e){
        e.preventDefault();
        let thisResider = e.target;
        residersTouchX = e.clientX;
        residersTouchY = e.clientY;

        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);

        /* :----*---:| MOUSE-MOVE EVENT |:----*---: */
        function mousemove(event){
            IsCropperMoving = false;
            IsResizing = true;
            let residersMoveX = event.clientX - residersTouchX;
            let residersMoveY = event.clientY - residersTouchY;

            if (IsResizing==true){
                let Cropper_New_Width;
                let Cropper_New_Height;
                Cropper_rect = Cropper.getBoundingClientRect();

                /* :----*---::----*---:< RIGHT SIDE RESIDE MOVER -EST >:----*---::----*---: */
                if (thisResider.classList.contains('mover_e')){
                    Cropper_New_Width = (Cropper_rect.width - (residersTouchX - event.clientX));

                    /* ~~~~~~~< BOUND MAXIMUM WIDTH >~~~~~~~ */
                    Cropper_New_Width = Math.min(
                        Math.max( Cropper_New_Width, (30)), (moveable_area_right - Cropper_rect.left)
                    );
                    /* ~~~~~~~< CHANGE WIDTH OF CROPPER >~~~~~~~ */
                    Cropper.style.width = `${Cropper_New_Width}px`;
                    Cropper_Wrapper.style.width = `${Cropper_New_Width}px`;
                }

                /* :----*---::----*---:< LEFT SIDE RESIDE MOVER -WEST >:----*---::----*---: */
                else if (thisResider.classList.contains('mover_w')){
                    cropperMoveX += residersMoveX;
                    Cropper_New_Width = (Cropper_rect.width + (residersTouchX - event.clientX));

                    /* ~~~~~~~< BOUND MAXIMUM WIDTH >~~~~~~~ */
                    Cropper_New_Width = Math.min(
                        Math.max(Cropper_New_Width, (30)), (Cropper_rect.right - moveable_area_left)
                    );
                    /* ~~~~~~~< CHANGE WIDTH OF CROPPER >~~~~~~~ */
                    Cropper.style.width = `${Cropper_New_Width}px`;
                    Cropper_Wrapper.style.width = `${Cropper_New_Width}px`;

                    /* ~~~~~~~< CROPPER MOVE MAX X-DIRECTION >~~~~~~~ */
                    cropperMoveX = Math.min(
                        Math.max(cropperMoveX, ((wd - moveable_area_width)/2)), (moveable_area_right - BackgroundCenterX + 20)
                    );
                    detect_cropper_collision(cropperMoveX, cropperMoveY);
                }

                /* :----*---::----*---:< BOTTOM SIDE RESIDE MOVER -SOUTH >:----*---::----*---: */
                else if (thisResider.classList.contains('mover_s')){
                    Cropper_New_Height = (Cropper_rect.height - (residersTouchY - event.clientY));
                    
                    /* ~~~~~~~< BOUND MAXIMUM HEIGHT >~~~~~~~ */
                    Cropper_New_Height = Math.min(
                        Math.max(Cropper_New_Height, (30)), (moveable_area_bottom - Cropper_rect.top)
                    );
                    /* ~~~~~~~< CHANGE HEIGHT OF CROPPER >~~~~~~~ */
                    Cropper.style.height= `${Cropper_New_Height}px`;
                    Cropper_Wrapper.style.height = `${Cropper_New_Height}px`;
                }

                /* :----*---::----*---:< TOP SIDE RESIDE MOVER -NORTH >:----*---::----*---: */
                else if (thisResider.classList.contains('mover_n')){
                    
                    Cropper_New_Height = (Cropper_rect.height + (residersTouchY - event.clientY));
                    
                    /* ~~~~~~~< BOUND MAXIMUM HEIGHT >~~~~~~~ */
                    Cropper_New_Height = Math.min(
                        Math.max(Cropper_New_Height, (30)), (Cropper_rect.bottom - moveable_area_top)
                    );
                    /* ~~~~~~~< CHANGE HEIGHT OF CROPPER >~~~~~~~ */
                    Cropper.style.height= `${Cropper_New_Height}px`;
                    Cropper_Wrapper.style.height = `${Cropper_New_Height}px`;

                    /* ~~~~~~~< CROPPER MOVE MAX Y-DIRECTION >~~~~~~~ */
                    cropperMoveY += residersMoveY;
                    cropperMoveY = Math.min(
                        Math.max(cropperMoveY, (((wd*AspectRatio) - moveable_area_height)/2)), (moveable_area_bottom - BackgroundCenterY + 10)
                    );
                    detect_cropper_collision(cropperMoveX, cropperMoveY);
                }
            }

            /* :~~~~~:| RESET TOUCH POSITION |:~~~~~: */
            residersTouchX = event.clientX;
            residersTouchY = event.clientY;

        }
        
        /* :----*---:| MOUSE-UP EVENT |:----*---: */
        function mouseup(){
            IsResizing = false;
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        }
    }
}
/* :~~~~~::~~~~~::~~~~~::~~~~~::~~~~~:|***|:~~~~~::~~~~~::~~~~~::~~~~~::~~~~~: */


/* =========================================================================================================== */
// Image.addEventListener('mousedown', imgMouseDown);
// function imgMouseDown(e){
//     e.preventDefault();

//     imgTouchX = e.clientX - imgMoveX;
//     imgTouchY = e.clientY - imgMoveY;

//     window.addEventListener('mousemove', mousemove);
//     window.addEventListener('mouseup', mouseup);

//     function mousemove(e){
//         e.preventDefault();
//         imgMoveX = e.clientX - imgTouchX;
//         imgMoveY = e.clientY - imgTouchY;
//         detect_image_collision(imgMoveX, imgMoveY);
//     }

//     function mouseup(){
//         window.removeEventListener('mouseup', mouseup);
//         window.removeEventListener('mousemove', mousemove);
//     }

// }

// const detect_image_collision = (imgMoveX, imgMoveY)=>{

//     imgMoveX = Math.max(
//         Math.min(
//             imgMoveX, 
//             ((Image_rect.width -background_rect.width)/2)
//         ), 
//         (Image_rect.left - background_rect.left)
//     );
//     imgMoveY = Math.max(
//         Math.min(
//             imgMoveY,
//             ((Image_rect.height -background_rect.height)/2)
//         ), 
//         (Image_rect.top - background_rect.top)
//     );
            
//     if (moveable_area_height == background_rect.height){
//         Image.style.transform = `rotateZ(${rotation}deg) translateY(${imgMoveY}px) `;
//     }
//     if (moveable_area_width == background_rect.width){
//         Image.style.transform = `rotateZ(${rotation}deg) translateX(${imgMoveX}px) `;
//     }
//     if ((moveable_area_width == background_rect.width) & (moveable_area_height == background_rect.height)){
//         Image.style.transform = `rotateZ(${rotation}deg) translate(${imgMoveX}px, ${imgMoveY}px) `;
//     }

    
// }
