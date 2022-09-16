let AspectRatio = 16/12

let background = document.querySelector('.Background_Rect');
let background_rect = background.getBoundingClientRect();

let Image = document.querySelector('.Image_Rect');
let Image_rect = Image.getBoundingClientRect();
let imgTouchX, imgTouchY, imgMoveX = 0, imgMoveY = 0;
let rotation = 0;
Image.style.transform = `rotateZ(${rotation}deg)`;

let Cropper = document.querySelector('.Cropper_Rect');
const CropperSize = ()=>{
    Cropper.style.width = `${200}px`;
    Cropper.style.height = `${200*AspectRatio}px`;
}
CropperSize();

let Cropper_rect = Cropper.getBoundingClientRect();
let cropperTouchX, cropperTouchY, cropperMoveX = 0, cropperMoveY = 0;

// Cropper.style.transform = `rotateZ(${-rotation}deg)`;

let pointer_rect = document.querySelector('.pointer_rect');
console.warn(pointer_rect)


let IsCropperMoving = false;
let moveable_area_width = background_rect.width, 
    moveable_area_right = background_rect.right, 
    moveable_area_left = background_rect.left;

if (background_rect.width > Image_rect.width){
    moveable_area_width = Image_rect.width
}
if (Image_rect.right < background_rect.right){
    moveable_area_right = Image_rect.right
}
if (Image_rect.left > background_rect.left){
    moveable_area_left = Image_rect.left
}

let moveable_area_height = background_rect.height, 
    moveable_area_top = background_rect.top, 
    moveable_area_bottom = background_rect.bottom;
if (background_rect.height > Image_rect.height){
    moveable_area_height = Image_rect.height
}
if (Image_rect.bottom < background_rect.bottom){
    moveable_area_bottom = Image_rect.bottom
}
if (Image_rect.top > background_rect.top){
    moveable_area_top = Image_rect.top
}

// TO ADJUSTING CROPPER HEIGHT WIDTH REQUIRE CONSTANTS AND VARIABLES
let IsResizing = false;
let InitialLeftCropper = Cropper_rect.left,
    InitialRightCropper = Cropper_rect.right,
    CRIW_during_movement = Cropper_rect.width,
    CRIH_during_movement = Cropper_rect.height;

let FinalLeftCropper = Cropper_rect.left, 
    FinalRightCropper = Cropper_rect.right;

let lastResidersMoveX = 0;

let resizeWidth = 0, 
    BackgroundCenterX = (background_rect.left+background_rect.width/2),
    CropperCenterX = (Cropper_rect.left + Cropper_rect.width/2);



/* ========================================================================== */

window.addEventListener('resize', ()=>{
    setTimeout(() => {
        location.reload();
    }, 2000);
})


/* ========================================================================== */
// ADD EVENT-LISTENER CROPPER RECTANGLE
Cropper.addEventListener('mousedown', cropperMouseDown);
function cropperMouseDown(e){
    IsCropperMoving = true;
    e.preventDefault();

    cropperTouchX = e.clientX - cropperMoveX;
    cropperTouchY = e.clientY - cropperMoveY;

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);

    function mousemove(e){
        e.preventDefault();
        if(IsCropperMoving == true){
            cropperMoveX = e.clientX - cropperTouchX;
            cropperMoveY = e.clientY - cropperTouchY;
            detect_cropper_collision(cropperMoveX, cropperMoveY);
        }
    }

    function mouseup(){
        IsCropperMoving = false;
        window.removeEventListener('mouseup', mouseup);
        window.removeEventListener('mousemove', mousemove);
    }

}

// DETECT ANY COLLISION HAPPEN BETWEEN CROPPER AND LARGE-RECTANGLE, OR NOT
const detect_cropper_collision = (cropperMoveX, cropperMoveY)=>{

    cropperMoveX = Math.min(
        Math.max(cropperMoveX, (CRIW_during_movement/2 - moveable_area_width/2)), ((moveable_area_right - moveable_area_left) - (moveable_area_width + CRIW_during_movement)/2)
    );
    cropperMoveY = Math.min(
        Math.max(cropperMoveY, (CRIH_during_movement/2 - moveable_area_height/2)), ((moveable_area_bottom - moveable_area_top) - (moveable_area_height + CRIH_during_movement)/2)
    );
    // Cropper.style.transform = `rotateZ(${-rotation}deg) translate(${cropperMoveX}px, ${cropperMoveY}px) `;
    Cropper.style.transform = `translate(${cropperMoveX}px, ${cropperMoveY}px) `;
    /* INITIALIZE CROPPER LEFT POSITION */
    InitialLeftCropper = Cropper_rect.left + cropperMoveX;
    InitialRightCropper = Cropper_rect.right + cropperMoveX;
    FinalLeftCropper = InitialLeftCropper

    console.warn(InitialLeftCropper)
}


/* =========================================================================================================== */
Image.addEventListener('mousedown', imgMouseDown);
function imgMouseDown(e){
    e.preventDefault();

    imgTouchX = e.clientX - imgMoveX;
    imgTouchY = e.clientY - imgMoveY;

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);

    function mousemove(e){
        e.preventDefault();
        imgMoveX = e.clientX - imgTouchX;
        imgMoveY = e.clientY - imgTouchY;
        detect_image_collision(imgMoveX, imgMoveY);
    }

    function mouseup(){
        window.removeEventListener('mouseup', mouseup);
        window.removeEventListener('mousemove', mousemove);
    }

}

const detect_image_collision = (imgMoveX, imgMoveY)=>{

    imgMoveX = Math.max(
        Math.min(imgMoveX, ((Image_rect.width -background_rect.width)/2)), (Image_rect.left - background_rect.left)
    );
    imgMoveY = Math.max(
        Math.min(imgMoveY, ((Image_rect.height -background_rect.height)/2)), (Image_rect.top - background_rect.top)
    );
            
    if (moveable_area_height == background_rect.height){
        Image.style.transform = `rotateZ(${rotation}deg) translateY(${imgMoveY}px) `;
    }
    if (moveable_area_width == background_rect.width){
        Image.style.transform = `rotateZ(${rotation}deg) translateX(${imgMoveX}px) `;
    }
    if ((moveable_area_width == background_rect.width) & (moveable_area_height == background_rect.height)){
        Image.style.transform = `rotateZ(${rotation}deg) translate(${imgMoveX}px, ${imgMoveY}px) `;
        // Image.style.transform = `translate(${imgMoveX}px, ${imgMoveY}px) `;
    }
}


/* =========================================================================================================== */
let residers = document.querySelectorAll('.mover');
let residersTouchX, residersTouchY
for (let resider of residers){

    resider.addEventListener('mousedown', residersMouseEvent);

    function residersMouseEvent(e){
        e.preventDefault();

        let thisResider = e.target;

        residersTouchX = e.clientX;
        residersTouchY = e.clientY;

        // console.warn(e.clientX, e.clientY)

        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);

        function mousemove(event){
            IsCropperMoving = false;
            IsResizing = true;
            let residersMoveX = event.clientX - residersTouchX;
            let residersMoveY = event.clientY - residersTouchY;
            lastResidersMoveX = lastResidersMoveX + residersMoveX;


            if (IsResizing==true){
                
                console.warn(moveable_area_left, FinalLeftCropper)
                // CropperCenter = (InitialLeftCropper + Cropper_rect.width/2);
                // if (BackgroundCenter>=CropperCenter){
                //     resizeWidth = (moveable_area_right - (InitialLeftCropper + Cropper_rect.width));
                // }

                if (thisResider.classList.contains('mover_e')){
                    CropperCenterX = (InitialLeftCropper + Cropper_rect.width/2);
                    if ((BackgroundCenterX<=CropperCenterX)){
                        lastResidersMoveX = Math.min(
                            Math.max(lastResidersMoveX, ((InitialLeftCropper - InitialRightCropper)/2 + 30)), (moveable_area_right - (InitialLeftCropper + Cropper_rect.width))
                        );
                        FinalLeftCropper = InitialLeftCropper - lastResidersMoveX;
                    }
                    else if ((BackgroundCenterX>CropperCenterX)){
                        lastResidersMoveX = Math.min(
                            Math.max(lastResidersMoveX, ((InitialLeftCropper - InitialRightCropper)/2 + 30)), (InitialLeftCropper - moveable_area_left)
                        );
                        FinalLeftCropper = InitialLeftCropper - lastResidersMoveX;
                    }
                    // console.warn('min :', (InitialLeftCropper - InitialRightCropper + 30))
                    // console.warn('max :', (moveable_area_right - (InitialLeftCropper + Cropper_rect.width)))
                    // console.warn(lastResidersMoveX)
                    Cropper.style.width = `${Cropper_rect.width + 2*lastResidersMoveX}px`;

                    // console.warn(CRIW_during_movement)
                    // console.warn(InitialLeftCropper - background_rect.left + lastResidersMoveX/2)
                    // // Cropper.style.left = `${InitialLeftCropper - background_rect.left + lastResidersMoveX/2}px`;
                    // Cropper.style.transform = `translateX(${lastResidersMoveX/2}px)`;
                    // InitialLeftCropper=InitialLeftCropper+lastResidersMoveX/2;
                    CRIW_during_movement = Cropper_rect.width + 2*lastResidersMoveX;
                    Cropper.style.height = `${CRIW_during_movement*AspectRatio}px`;
                    CRIH_during_movement = CRIW_during_movement*AspectRatio;
                    pointer_rect.style.left = `${FinalLeftCropper}px`;
                }
            }
            residersTouchX = event.clientX;

        }

        function mouseup(){
            IsResizing = false;
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        }
    }
}


