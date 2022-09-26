/* :~~~~~::~~~~~::~~~~~:| IMPORT REQUIRE DOM |:~~~~~::~~~~~::~~~~~: */
const background = document.querySelector('.Background_Rect'); // MAIN VISIBLE CONTAINER [BACKGROUND/ WRAPPER]
const Cropper_Wrapper = document.querySelector('.Cropper_Wrapper'); // PARENT OF CROPPER RECTANGLE
const Cropper = document.querySelector('.Cropper_Rect'); // CROPPER RECTANGLE
const Image_Wrapper = document.querySelector('.Image_Rect'); // PICTURE WRAPPER CONTAINER
const Image_Content = Image_Wrapper.firstElementChild; // PICTURE
const residers = document.querySelectorAll('.mover'); // RESIDER [E, SE, S, SW, W, NW, N, NE]



/* :~~~~~::~~~~~:| FUNCTION RETURN MINIMUM AND MAXIMUM VALUE FROM AN ARRAY |:~~~~~::~~~~~: */
/* Creating a function that will return the minimum value of an array. */
Array.min = function( min_arr ){
    return Math.min.apply( Math, min_arr );
};
/* Finding the maximum value in an array. */
Array.max = function( max_arr ){
    return Math.max.apply( Math, max_arr );
};


/* :~~~~~::~~~~~::~~~~~:| INITIALIZE CROPPER WIDTH & HEIGHT |:~~~~~::~~~~~::~~~~~: */
let wd = 100; // :INITIAL WIDTH OF CROPPER
let AspectRatio = 1/1; // CROPPER ASPECT-RATIO

/* CropperSize() is a function that sets the size of the cropper to the size of the window.*/
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
/* Checking the aspect ratio of the image and the aspect ratio of the background. If the image is wider
than the background, it will set the width of the image to the width of the background and the
height of the image to the height of the background divided by the aspect ratio of the image. */
if (Image_Content_AspectRatio >= Background_AspectRatio){
    Image_Wrapper.style.width = `${background_rect.width}px`;
    Image_Wrapper.style.height = `${Math.round(background_rect.width / Image_Content_AspectRatio)}px`;
    position_content();
}
/* -----:[ WHEN PICTURE WIDTH < HEIGHT ]:----- */
/* Checking if the image is too tall for the background. If it is, it is resizing the image to fit the
background. */
if ((Image_Content_AspectRatio) < Background_AspectRatio & (Image_Content_AspectRatio > 0)){
    Image_Wrapper.style.width = `${Math.round(background_rect.height * Image_Content_AspectRatio)}px`;
    Image_Wrapper.style.height = `${background_rect.height}px`;
    position_content();
}
/* -----:[ CENTER ALL CONTENTS ]:----- */
/* It positions the image and the cropper in the center of the screen. */
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
/* Reloading the page after 2 seconds of resizing the window. */
window.addEventListener('resize', ()=>{
    setTimeout(() => {
        location.reload();
    }, 2000);
})
/* :~~~~~::~~~~~::~~~~~::~~~~~::~~~~~:|***|:~~~~~::~~~~~::~~~~~::~~~~~::~~~~~: */




/* :~~~~~::~~~~~::~~~~~:| MOVE CROPPER RECTANGLE FUNCTION |:~~~~~::~~~~~::~~~~~: */
/**
 * The function takes two arguments, cropperMoveX and cropperMoveY, and then sets the transform
 * property of the Cropper_Wrapper element to the values of the arguments.
 * @param cropperMoveX - The X-axis movement of the cropper
 * @param cropperMoveY - The Y-axis movement of the cropper
 */
const detect_cropper_collision = (cropperMoveX, cropperMoveY)=>{
    Cropper_Wrapper.style.transform = `translate(${cropperMoveX}px, ${cropperMoveY}px) `;
}


/* :~~~~~:| DETECT ANY COLLISION HAPPEN BETWEEN CROPPER AND LARGE-RECTANGLE, OR NOT |:~~~~~: */
/* The above code is adding an event listener to the Cropper element. The event listener is listening
for a pointerdown event. When the pointerdown event is triggered, the cropperPointerDown function is
called. */
Cropper.addEventListener('pointerdown', cropperPointerDown);

/*
 * When the mouse is down, move the cropper to the mouse's position, but don't let it move outside the
 * moveable area.
 */
function cropperPointerDown(e){
    e.preventDefault();
    IsCropperMoving = true;
    cropperTouchX = e.clientX - cropperMoveX;
    cropperTouchY = e.clientY - cropperMoveY;

    window.addEventListener('pointermove', cropperPointermove);
    window.addEventListener('pointerup', cropperPointerup);

    /* :----*---:| POINTER-MOVE EVENT |:----*---: */
    /*
     * "If the cropper is being moved, and it's not being resized, then set the cropper's x and y
     * coordinates to the mouse's x and y coordinates, minus the cropper's x and y coordinates."
     * The rest of the function is just to make sure that the cropper doesn't move outside of the
     * moveable area.
     */
    function cropperPointermove(event){
        event.preventDefault();

        if(IsCropperMoving == true & !IsResizing){
            cropperMoveX = event.clientX - cropperTouchX;
            cropperMoveY = event.clientY - cropperTouchY;
            Cropper_rect = Cropper.getBoundingClientRect();
            Cropper_Wrapper_rect = Cropper_Wrapper.getBoundingClientRect();

            /* Limiting the movement of the cropper to the width of the moveable area. */
            cropperMoveX = Math.min(
                Math.max(cropperMoveX, 
                    ((Cropper_rect.width - moveable_area_width)/2 - (Cropper_rect.left - Cropper_Wrapper_rect.left))
                ), ((moveable_area_width - Cropper_rect.width)/2 - (Cropper_rect.left - Cropper_Wrapper_rect.left))
            );

            /* Limiting the movement of the cropper to the boundaries of the moveable area. */
            cropperMoveY = Math.min(
                Math.max(
                    cropperMoveY,
                    ((Cropper_rect.height - moveable_area_height)/2  - (Cropper_rect.top - Cropper_Wrapper_rect.top))
                ), ((moveable_area_height - Cropper_rect.height)/2  - (Cropper_rect.top - Cropper_Wrapper_rect.top))
            );
            /*
            Calling the function detect_cropper_collision() and passing it the values of
            cropperMoveX and cropperMoveY. 
            */
            detect_cropper_collision(cropperMoveX, cropperMoveY);
        }

    }

    /* :----*---:| POINTER-UP EVENT |:----*---: */
    /**
     * If the cropper is moving, then remove the event listeners for pointermove and pointerup.
     */
    function cropperPointerup(){
        IsCropperMoving = false;
        window.removeEventListener('pointermove', cropperPointermove);
        window.removeEventListener('pointerup', cropperPointerup);
    }

}

/* :~~~~~::~~~~~::~~~~~:| RESIZE THE CROPPER RECTANGLE |:~~~~~::~~~~~::~~~~~:*/
/* The above code is for resizing the cropper. */
for (let resider of residers){

    resider.addEventListener('pointerdown', residersPointerEvent);

    /**
     * It's a function that resizes the cropper element by dragging the residers.
     * @param e - The event object.
     */
    function residersPointerEvent(e){
        e.preventDefault();
        let thisResider = e.target;
        residersTouchX = e.clientX;
        residersTouchY = e.clientY;

        window.addEventListener('pointermove', pointermove);
        window.addEventListener('pointerup', pointerup);

        /* :----*---:| MOUSE-MOVE EVENT |:----*---: */
        function pointermove(event){
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

                    /* Limiting the width of the cropper to a minimum of 30px and a maximum of the
                    distance between the left side of the cropper and the right side of the moveable
                    area. */
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

                    /* Setting the width of the cropper to a minimum of 30 and a maximum of the right
                    side of the cropper minus the left side of the moveable area. */
                    Cropper_New_Width = Math.min(
                        Math.max(Cropper_New_Width, (30)), (Cropper_rect.right - moveable_area_left)
                    );
                    /* ~~~~~~~< CHANGE WIDTH OF CROPPER >~~~~~~~ */
                    Cropper.style.width = `${Cropper_New_Width}px`;
                    Cropper_Wrapper.style.width = `${Cropper_New_Width}px`;

                    /* Limiting the movement of the cropper to the right side of the image. */
                    cropperMoveX = Math.min(
                        Math.max(cropperMoveX, ((wd - moveable_area_width)/2)), (moveable_area_right - BackgroundCenterX)
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
                        Math.max(cropperMoveY, (((wd*AspectRatio) - moveable_area_height)/2)), (moveable_area_bottom - BackgroundCenterY)
                    );
                    detect_cropper_collision(cropperMoveX, cropperMoveY);
                }
            }

            /* :~~~~~:| RESET TOUCH POSITION |:~~~~~: */
            residersTouchX = event.clientX;
            residersTouchY = event.clientY;

        }
        
        /* :----*---:| MOUSE-UP EVENT |:----*---: */
        /**
         * If the user is resizing, then stop resizing and remove the event listeners for pointermove
         * and pointerup.
         */
        function pointerup(){
            IsResizing = false;
            window.removeEventListener('pointermove', pointermove, false);
            window.removeEventListener('pointerup', pointerup, false);
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
