let background = document.querySelector('.Background_Rect');
let background_rect = background.getBoundingClientRect();

let Image = document.querySelector('.Image_Rect');
let Image_rect = Image.getBoundingClientRect();
let imgTouchX, imgTouchY, imgMoveX = 0, imgMoveY = 0;
let rotation = 0;
let degtorad=Math.PI/180;
var x = Math.cos(degtorad * (135+rotation));
var y = Math.sin(degtorad * (135+rotation));
Image.style.transform = `rotateZ(${rotation}deg)`;

let Cropper = document.querySelector('.Cropper_Rect');
let Cropper_rect = Cropper.getBoundingClientRect();
let cropperTouchX, cropperTouchY, cropperMoveX = 0, cropperMoveY = 0;
// Cropper.style.transform = `rotateZ(${-rotation}deg)`;


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
    CropperInitialWidth = 200,
    CropperInitialHeight = 200;

let FinalLeftCropper = Cropper_rect.left, 
    FinalRightCropper = Cropper_rect.right,
    CropperFinalWidth = Cropper_rect.width,
    CropperFinalHeight = Cropper_rect.height;

let AdjustCropperWidth = CropperInitialWidth, AdjustCropperHeight = CropperInitialHeight;
if (CropperInitialWidth != CropperFinalWidth){
    AdjustCropperWidth = CropperFinalWidth;
}
if (CropperInitialHeight != CropperFinalHeight){
    AdjustCropperHeight = CropperFinalHeight;
}




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
        Math.max(cropperMoveX, (AdjustCropperWidth/2 - moveable_area_width/2)), ((moveable_area_right - moveable_area_left) - (moveable_area_width + Cropper_rect.width)/2)
    );
    cropperMoveY = Math.min(
        Math.max(cropperMoveY, (AdjustCropperHeight/2 - moveable_area_height/2)), ((moveable_area_bottom - moveable_area_top) - (moveable_area_height + Cropper_rect.height)/2)
    );
    // Cropper.style.transform = `rotateZ(${-rotation}deg) translate(${cropperMoveX}px, ${cropperMoveY}px) `;
    Cropper.style.transform = `translate(${cropperMoveX}px, ${cropperMoveY}px) `;
    /* INITIALIZE CROPPER LEFT POSITION */
    InitialLeftCropper = Cropper_rect.left + cropperMoveX;
    InitialRightCropper = Cropper_rect.right + cropperMoveX;
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
        // e.preventDefault();

        let thisResider = e.target;

        residersTouchX = e.clientX;
        residersTouchY = e.clientY;

        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);

        function mousemove(event){
            IsCropperMoving = false;
            IsResizing = true;
            residersMoveX = event.clientX - residersTouchX;
            residersMoveY = event.clientY - residersTouchY;

            if (IsResizing==true){
                if (thisResider.classList.contains('mover_e')){
                    
                    // console.warn(Cropper_rect.left)
                    // console.warn(InitialLeftCropper)
                    // console.warn(InitialLeftCropper + Cropper_rect.width)
                    residersMoveX = Math.min(
                        Math.max(residersMoveX, (CropperInitialWidth - InitialRightCropper)), 
                        (moveable_area_right - (InitialLeftCropper + Cropper_rect.width))
                    );
                    console.warn('min :', (CropperInitialWidth - InitialRightCropper))
                    console.warn('max :', (moveable_area_right - (InitialLeftCropper + Cropper_rect.width)))
                    console.warn(residersMoveX)
                    // Cropper.style.transform = `translateX(${residersMoveX/2}px)`;
                    // Cropper.style.left = `${(InitialLeftCropper-background_rect.left)+residersMoveX/2}px`;
                    // Cropper_rect.left = FinalLeftCropper;
                    // Cropper.style.width = `${CropperInitialWidth + residersMoveX}px`;
                    CropperFinalWidth = CropperInitialWidth + residersMoveX;
                    FinalRightCropper = InitialLeftCropper + residersMoveX
                    console.warn(FinalRightCropper)
                    // Cropper.style.left = `${(Cropper_rect.width+residersMoveX)/2}px`;
                    
                }
            }
        }

        function mouseup(){
            IsResizing = false;
            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        }
    }

    
}


