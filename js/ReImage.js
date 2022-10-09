/* :~~~~~::~~~~~::~~~~~:| IMPORT REQUIRE DOM |:~~~~~::~~~~~::~~~~~: */
const ReImage_Image_Container = document.querySelector('.ReImage_Image_Container');
const ReImage_TensileS = document.querySelectorAll('.ReImage_Tensile');
const ReImage_MoverS = document.querySelectorAll('.ReImage_Mover');

const Preview_Container = document.querySelector("#Image_Preview_Container");

const RotatePlus_Image = document.querySelector("#RotatePlus_Image");
const RotateMinus_Image = document.querySelector("#RotateMinus_Image");
const Add_Image = document.querySelector('#Add_Image');


let Image_Content = ReImage_Image_Container.firstElementChild,
    ImageUrl = Image_Content.src,
    dataURL;

let ReImage_Background,
    ReImage_Cover,
    ReImage_Rectangle,
    ReImage_Cropper,
    ReImage_Cropper_Mask;
    
let scroll_width,
    scroll_height;

let ReImage_Background_rect,
    ReImage_Image_Container_rect,
    ReImage_Cover_rect,
    ReImage_Rectangle_rect,
    ReImage_Cropper_rect,
    Image_Content_AspectRatio,
    Background_AspectRatio;

let cropperTouchX,
    cropperTouchY,
    IsCropperMoving = false,
    cropperMoveX,
    cropperMoveY,
    BackgroundCenterX,
    BackgroundCenterY,
    moveable_area_width,
    moveable_area_height,
    moveable_area_right,
    moveable_area_bottom,
    moveable_area_left,
    moveable_area_top;

let imageTouchX,
    imageTouchY,
    imageMoveX,
    imageMoveY,
    IsImageMove = false,
    ImageRespectRatio,
    changeOnScale = 0;

let moverTouchX,
    moverTouchY,
    IsResizing = false;

const RTE = document.querySelector('.RTE');
const RTS = document.querySelector('.RTS');
let RTE_rect, RTEmaxRight, RTS_rect, RTSmaxBottom;


let wd = 100; // INITIAL WIDTH OF CROPPER
let minWD = 50; // MINIMUM WIDTH OF THE CROPPER AFTER RESIZE
let AspectRatio = 12/12; // CROPPER ASPECT-RATIO
let img_rotate = 0; // IMAGE ROTATION

/* :~~~~~::~~~~~:| FUNCTION RETURN MINIMUM AND MAXIMUM VALUE FROM AN ARRAY |:~~~~~::~~~~~: */
/* Creating a function that will return the minimum value of an array. */
Array.min = function( min_arr ){
    return Math.min.apply( Math, min_arr );
};
/* Finding the maximum value in an array. */
Array.max = function( max_arr ){
    return Math.max.apply( Math, max_arr );
};


/*
 * Check if the URL is an image by fetching the URL and checking the response's blob type.
 */
async function checkImage(url){
    const res = await fetch(url);
    const buff = await res.blob();
    return buff.type.startsWith('image/')
};

/* Checking if the image is valid. */
window.addEventListener('load', () =>{
    checkImage(`${ImageUrl}`)
    .then(res =>{
        if (res == true){
            Initialize_Cropper();
        }
        else if (res == false){
            console.log('image not present');
            return
        }
    })
});

/*
 * If there is no image file then we attach a new image file
 */
Add_Image.addEventListener('change', ()=>{
    let file = Add_Image.files;
    if (file.length > 0){
        // changeOnScale = 0;
        // img_rotate = 0;
        let fileReader = new FileReader();
        fileReader.onload = function (event){
            ReImage_Image_Container.firstElementChild.setAttribute('src', event.target.result);
            ImageUrl = event.target.result;
            checkImage(`${ImageUrl}`)
            .then(res =>{
                if (res == true){
                    Import_Content_and_Adjust();
                }
                else if (res == false){
                    console.log('image not present');
                    return
                }
            })
        }
        fileReader.readAsDataURL(file[0])
    }
})

/* Adding an event listener to the window object. The event listener is listening for the scroll event.
When the scroll event is triggered, the function is executed. The function is setting the
scroll_height and scroll_width variables to the scrollTop and scrollLeft properties of the
documentElement object. */
window.addEventListener('scroll', ()=>{
    scroll_height = document.documentElement.scrollTop;
    scroll_width = document.documentElement.scrollLeft;
})

/* A function that is being called. */
const Detect_Moveable_Area = () => {
    /* :~~~~~::~~~~~:| MOVEABLE AREA AND ITS BOUNDARY |:~~~~~::~~~~~: */
    /* [ MAXIMUM WIDTH OF MOVEABLE AREA ] */
    let width_arr = [ReImage_Background_rect.width, ReImage_Image_Container_rect.width];
    moveable_area_width = Array.min(width_arr);

    /* [ MAXIMUM HEIGHT OF MOVEABLE AREA ] */
    let height_arr = [ReImage_Background_rect.height, ReImage_Image_Container_rect.height];
    moveable_area_height = Array.min(height_arr);

    /* [ MAXIMUM HEIGHT OF MOVEABLE AREA ] */
    let right_arr = [ReImage_Background_rect.right, ReImage_Image_Container_rect.right];
    moveable_area_right = Array.min(right_arr);

    /* [ MAXIMUM HEIGHT OF MOVEABLE AREA ] */
    let bottom_arr = [ReImage_Background_rect.bottom, ReImage_Image_Container_rect.bottom];
    moveable_area_bottom = Array.min(bottom_arr);

    /* [ MAXIMUM HEIGHT OF MOVEABLE AREA ] */
    let left_arr = [ReImage_Background_rect.left, ReImage_Image_Container_rect.left];
    moveable_area_left = Array.max(left_arr);

    /* [ MAXIMUM HEIGHT OF MOVEABLE AREA ] */
    let top_arr = [ReImage_Background_rect.top, ReImage_Image_Container_rect.top];
    moveable_area_top = Array.max(top_arr);
}


/*
 * "Import_Content_and_Adjust" is a function that imports the content of the HTML file and adjusts the
 * content to fit the screen.
 */
/* :~~~~~::~~~~~::~~~~~:| ADJUST PICTURE ACCORDING TO HEIGHT & WIDTH |:~~~~~::~~~~~::~~~~~: */
// const adjustPicture = () => {

// }
const Import_Content_and_Adjust = () =>{

    /* Getting the scroll height and width of the window. */
    ReImage_Background = document.querySelector('.ReImage_Background');
    ReImage_Cover = document.querySelector('.ReImage_Cover');
    ReImage_Rectangle = document.querySelector('.ReImage_Rectangle');
    cropperMoveX = 0, cropperMoveY = 0;
    imageMoveX = 0, imageMoveY = 0;
    detect_cropper_collision(cropperMoveX, cropperMoveY);
    detect_image_collision(imageMoveX, imageMoveY);
    scroll_height = 0, scroll_width = 0;
    ReImage_Cover.style.transition = `all 0.5s`;
    // ReImage_Image_Container.style.transition = `none`;


    /* :~~~~~::~~~~~::~~~~~:| REQUIRE BOUNDING RECTANGLE |:~~~~~::~~~~~::~~~~~: */
    ReImage_Background_rect = ReImage_Background.getBoundingClientRect(), // BACKGROUND RECTANGLE
    ReImage_Cover_rect = ReImage_Cover.getBoundingClientRect(); // CROPPER WRAPPER RECTANGLE

    /* CropperSize() is a function that sets the size of the cropper to the size of the window.*/
    ReImage_Rectangle.style.width = `${wd}px`;
    ReImage_Rectangle.style.height = `${wd*AspectRatio}px`;
    ReImage_Cover.style.width = `${wd}px`;
    ReImage_Cover.style.height = `${wd*AspectRatio}px`;
    ReImage_Cover.style.position = `absolute`;
    ReImage_Rectangle.style.left = `${0}`;
    ReImage_Rectangle.style.top = `${0}`;
    ReImage_Rectangle_rect = ReImage_Rectangle.getBoundingClientRect();


    /* :~~~~~::~~~~~::~~~~~:| ADJUST PICTURE ACCORDING TO HEIGHT & WIDTH |:~~~~~::~~~~~::~~~~~: */
    /* PICTURE ASPECT-RATIO */ 
    Image_Content_AspectRatio = (Image_Content.naturalWidth / Image_Content.naturalHeight);
    /* BACKGROUND ASPECT-RATIO */
    Background_AspectRatio = (ReImage_Background_rect.width / ReImage_Background_rect.height);
    

    /* -----:[ WHEN PICTURE WIDTH > HEIGHT ]:----- */
    /* Checking the aspect ratio of the image and the aspect ratio of the background. If the image is wider
    than the background, it will set the width of the image to the width of the background and the
    height of the image to the height of the background divided by the aspect ratio of the image. */
    if (Image_Content_AspectRatio >= Background_AspectRatio){
        if((img_rotate == 0) | (img_rotate == 180) | (img_rotate == -180)){
            let Wd = (ReImage_Background_rect.width + changeOnScale);
            let Vh = Math.round((ReImage_Background_rect.width + changeOnScale) / Image_Content_AspectRatio);
            ReImage_Image_Container.style.width = `${Wd}px`;
            ReImage_Image_Container.style.height = `${Vh}px`;
        }
        else if((img_rotate == 90) | (img_rotate == 270) | (img_rotate == -90) | (img_rotate == -270)){
            let Wd = Math.round((ReImage_Background_rect.width + changeOnScale)* Image_Content_AspectRatio);
            let Vh = (ReImage_Background_rect.width + changeOnScale);
            ReImage_Image_Container.style.width = `${Wd}px`;
            ReImage_Image_Container.style.height = `${Vh}px`;
        }
        position_content();
    }
    /* -----:[ WHEN PICTURE WIDTH < HEIGHT ]:----- */
    /* Checking if the image is too tall for the background. If it is, it is resizing the image to fit the
    background. */
    if ((Image_Content_AspectRatio < Background_AspectRatio) & (Image_Content_AspectRatio > 0)){
        if((img_rotate == 0) | (img_rotate == 180) | (img_rotate == -180)){
            let Wd = Math.round((ReImage_Background_rect.height + changeOnScale) * Image_Content_AspectRatio);
            let Vh = (ReImage_Background_rect.height + changeOnScale);
            ReImage_Image_Container.style.width = `${Wd}px`;
            ReImage_Image_Container.style.height = `${Vh}px`;
        }
        else if((img_rotate == 90) | (img_rotate == 270) | (img_rotate == -90) | (img_rotate == -270)){
            let Wd = Math.round((ReImage_Background_rect.width + changeOnScale) * Image_Content_AspectRatio);
            let Vh = (ReImage_Background_rect.width + changeOnScale);
            ReImage_Image_Container.style.width = `${Wd}px`;
            ReImage_Image_Container.style.height = `${Vh}px`;
        }
        position_content();
    }
    /* :-----:[ CENTER ALL CONTENTS ]:-----: */
    /* It positions the image and the cropper in the center of the screen. */
    function position_content(){
        ReImage_Rectangle.style.left = `calc(50% - ${ReImage_Rectangle_rect.width/2}px)`;
        ReImage_Rectangle.style.top = `calc(50% - ${ReImage_Rectangle_rect.height/2}px)`;
        Image_Content.style.width = `100%`;
        Image_Content.style.height = `100%`;
    }
    
    /* Getting the center of the background image. */
    ReImage_Image_Container_rect = ReImage_Image_Container.getBoundingClientRect();
    BackgroundCenterX = (ReImage_Background_rect.left + ReImage_Background_rect.width/2),
    BackgroundCenterY = (ReImage_Background_rect.top + ReImage_Background_rect.height/2);
    // AMOUNT OF IMAGE CONTRACTION / EXPANSION [RATIO] => ImageRespectRatio
    ImageRespectRatio = (Image_Content.naturalWidth / ReImage_Image_Container_rect.width);

    /* Calling the function Detect_Moveable_Area() */
    Detect_Moveable_Area();

    /* Getting the right side of the RTE. */
    RTE_rect = RTE.getBoundingClientRect();
    RTEmaxRight = RTE_rect.right;
    RTS_rect = RTS.getBoundingClientRect();
    RTSmaxBottom = RTS_rect.bottom;

    /* Drawing an image in a canvas. */
    drawImage_in_canvas();
}


/*
 * The function detects the collision of the cropper with the image and moves the cropper accordingly.
 * @param cropperMoveX - The X-axis movement of the cropper
 * @param cropperMoveY - The Y-axis movement of the cropper
 */
const detect_cropper_collision = (cropperMoveX, cropperMoveY)=>{
    ReImage_Cover.style.transform = `translate(${cropperMoveX}px, ${cropperMoveY}px)`;
}

const detect_image_collision = (imageMoveX, imageMoveY)=>{
    ReImage_Image_Container.style.transform = `translate(${imageMoveX}px, ${imageMoveY}px) rotate(${img_rotate}deg)`;
}

/*
 * When the user clicks on the cropper, the cropper will follow the mouse until the user releases the
 * mouse button.
 */
const Initialize_Cropper = () =>{
    Import_Content_and_Adjust();

    /* :~~~~~::~~~~~::~~~~~:| HANDLE MOVEMENT OF CROPPER RECTANGLE |:~~~~~::~~~~~::~~~~~: */
    ReImage_Rectangle.addEventListener('pointerdown', cropperPointerDown);
    function cropperPointerDown(e){
        e.preventDefault();
        ReImage_Cover.style.transition = `none`;
        IsCropperMoving = true;
        IsResizing = false;
        cropperTouchX = e.clientX - cropperMoveX;
        cropperTouchY = e.clientY - cropperMoveY;

        window.addEventListener('pointermove', cropperPointermove);
        window.addEventListener('pointerup', cropperPointerup);

        /*
         * If the cropper is moving and not resizing, then set the cropperMoveX and cropperMoveY
         * variables to the difference between the current mouse position and the mouse position when
         * the cropper was first clicked, and then call the detect_cropper_collision() function and
         * pass it the values of cropperMoveX and cropperMoveY.
         */
        function cropperPointermove(event){
            if(IsCropperMoving == true & !IsResizing){
                cropperMoveX = event.clientX - cropperTouchX;
                cropperMoveY = event.clientY - cropperTouchY;
                ReImage_Rectangle_rect = ReImage_Rectangle.getBoundingClientRect();
                ReImage_Cover_rect = ReImage_Cover.getBoundingClientRect();

                /* Limiting the movement of the cropper to the width of the moveable area. */
                cropperMoveX = Math.min(
                    Math.max(cropperMoveX, 
                        ((ReImage_Rectangle_rect.width - moveable_area_width)/2 - (ReImage_Rectangle_rect.left - ReImage_Cover_rect.left))
                    ), ((moveable_area_width - ReImage_Rectangle_rect.width)/2 - (ReImage_Rectangle_rect.left - ReImage_Cover_rect.left))
                );

                /* Limiting the movement of the cropper to the boundaries of the moveable area. */
                cropperMoveY = Math.min(
                    Math.max(
                        cropperMoveY,
                        ((ReImage_Rectangle_rect.height - moveable_area_height)/2 - (ReImage_Rectangle_rect.top - ReImage_Cover_rect.top))
                    ), ((moveable_area_height - ReImage_Rectangle_rect.height)/2 - (ReImage_Rectangle_rect.top - ReImage_Cover_rect.top))
                );
                /*
                Calling the function detect_cropper_collision() and passing it the values of
                cropperMoveX and cropperMoveY. 
                */
                detect_cropper_collision(cropperMoveX, cropperMoveY);

                // BOUNDING RIGHT SIDE OF THE CROPPER
                RTEmaxRight = ReImage_Rectangle_rect.right;
                RTSmaxBottom = ReImage_Rectangle_rect.bottom;
            }
        }

        /*
         * If the cropper is moving, remove the event listeners for pointermove and pointerup.
         */
        function cropperPointerup(){
            IsCropperMoving = false;
            window.removeEventListener('pointermove', cropperPointermove);
            window.removeEventListener('pointerup', cropperPointerup);
        
            /* Clip-out a particular part form the large canvas. */
            clip_the_canvas();
        }
    };


    /* :~~~~~::~~~~~::~~~~~:| HANDLE MOVEMENT OF IMAGE |:~~~~~::~~~~~::~~~~~: */
    ReImage_Image_Container.addEventListener('pointerdown', imgPointerDown);
    function imgPointerDown(e){
        IsCropperMoving = false;
        ReImage_Image_Container.style.transition = `none`;
        IsResizing = false;
        IsImageMove = true;
        imageTouchX = e.clientX - imageMoveX;
        imageTouchY = e.clientY - imageMoveY;

        window.addEventListener('pointermove', imagePointermove);
        window.addEventListener('pointerup', imagePointerup);

        function imagePointermove(event){
            if (IsImageMove == true){
                imageMoveX = event.clientX - imageTouchX;
                imageMoveY = event.clientY - imageTouchY;
                ReImage_Image_Container_rect = ReImage_Image_Container.getBoundingClientRect();
                /* Limiting the movement of the cropper to the width of the moveable area. */
                imageMoveX = Math.max(
                    Math.min(imageMoveX, 
                        ((ReImage_Image_Container_rect.width - moveable_area_width)/2)
                    ), ((moveable_area_width - ReImage_Image_Container_rect.width)/2)
                );
    
                /* Limiting the movement of the cropper to the boundaries of the moveable area. */
                imageMoveY = Math.max(
                    Math.min(
                        imageMoveY,
                        ((ReImage_Image_Container_rect.height - moveable_area_height)/2)
                    ), ((moveable_area_height - ReImage_Image_Container_rect.height)/2)
                );
                detect_image_collision(imageMoveX, imageMoveY);
            }

        }
        
        function imagePointerup(){
            IsImageMove = false;
            window.removeEventListener('pointermove', imagePointermove);
            window.removeEventListener('pointerup', imagePointerup);
            
            /* Clip-out a particular part form the large canvas. */
            clip_the_canvas();
        }
    }

    ReImage_Image_Container.addEventListener('wheel', zoom, { passive: false })
    function zoom(e){
        e.preventDefault();
        let delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY) * 0.4;
        changeOnScale += delta;
        changeOnScale = Math.min(Math.max(changeOnScale, 0), (2800));
        // console.warn(changeOnScale)
        Import_Content_and_Adjust();
    }


    /* :~~~~~::~~~~~::~~~~~:| RESIZE FUNCTION OF THE CROPPER |:~~~~~::~~~~~::~~~~~: */
    /* The above code is a function that is supposed to resize the cropper. */
    for (let ReImage_Mover of ReImage_MoverS){
        ReImage_Mover.addEventListener('pointerdown', moverPD);

        function moverPD(e){
            e.preventDefault();
            ReImage_Cover.style.transition = `none`;
            let thisMover = e.target;
            moverTouchX = e.clientX;
            moverTouchY = e.clientY;

            thisMover.addEventListener('pointermove', moverPM);
            window.addEventListener('pointerup', moverPU);

            function moverPM(event){
                IsResizing = true;
                IsCropperMoving = false;

                if ((IsResizing == true) & !IsCropperMoving){
                    let Cropper_New_Width;
                    let Cropper_New_Height;
                    let moverMoveX = event.clientX - moverTouchX;
                    let moverMoveY = event.clientY - moverTouchY;
                    ReImage_Rectangle_rect = ReImage_Rectangle.getBoundingClientRect();
                    RTE_rect = RTE.getBoundingClientRect();
                    RTS_rect = RTS.getBoundingClientRect();

                    /* :----*---::----*---:< RIGHT SIDE RESIDE MOVER [RME] >:----*---::----*---: */
                    if (thisMover.classList.contains('RME')){
                        Cropper_New_Width = (ReImage_Rectangle_rect.width - (moverTouchX - event.clientX));

                        /* Limiting the width of the cropper to a minimum of 30px and a maximum of the
                        distance between the left side of the cropper and the right side of the moveable
                        area. */
                        Cropper_New_Width = Math.min(
                            Math.max(Cropper_New_Width, (minWD)), (moveable_area_right - ReImage_Rectangle_rect.left)
                        );
                        /* ~~~~~~~< CHANGE WIDTH OF CROPPER >~~~~~~~ */
                        ReImage_Rectangle.style.width = `${Cropper_New_Width}px`;
                        ReImage_Cover.style.width = `${Cropper_New_Width}px`;
                        // BOUNDING RIGHT SIDE OF THE CROPPER
                        RTEmaxRight = RTE_rect.right;
                    }

                    /* :----*---::----*---:< LEFT SIDE RESIDE MOVER -WEST >:----*---::----*---: */
                    else if (thisMover.classList.contains('RMW')){
                        cropperMoveX += moverMoveX;
                        Cropper_New_Width = (ReImage_Rectangle_rect.width + (moverTouchX - event.clientX));

                        /* Finding the minimum value of the array. */
                        let maxRight_Cropper_arr = [moveable_area_right, RTEmaxRight];
                        let maxRight_Cropper = Array.min(maxRight_Cropper_arr);
    
                        /* Setting the width of the cropper to a minimum of 30 and a maximum of the right
                        side of the cropper minus the left side of the moveable area. */
                        Cropper_New_Width = Math.min(
                            Math.max(Cropper_New_Width, (minWD)), (maxRight_Cropper - moveable_area_left)
                        );
                        /* ~~~~~~~< CHANGE WIDTH OF CROPPER >~~~~~~~ */
                        ReImage_Rectangle.style.width = `${Cropper_New_Width}px`;
                        ReImage_Cover.style.width = `${Cropper_New_Width}px`;
                        
                        /* Limiting the movement of the cropper to the right side of the image. */
                        let wdDX = (((wd) - (2*minWD))/2);
                        cropperMoveX = Math.min(
                            Math.max(cropperMoveX, ((wd - moveable_area_width)/2)), (maxRight_Cropper - BackgroundCenterX + wdDX)
                        );
                        detect_cropper_collision(cropperMoveX, cropperMoveY);
                    }

                    /* :----*---::----*---:< BOTTOM SIDE RESIDE MOVER -SOUTH >:----*---::----*---: */
                    else if (thisMover.classList.contains('RMS')){
                        Cropper_New_Height = (ReImage_Rectangle_rect.height - (moverTouchY - event.clientY));
                        // scroll_height = document.documentElement.scrollTop;
                        
                        /* ~~~~~~~< BOUND MAXIMUM HEIGHT >~~~~~~~ */
                        Cropper_New_Height = Math.min(
                            Math.max(Cropper_New_Height, (minWD)), (moveable_area_bottom - ReImage_Rectangle_rect.top)
                        );
                        /* ~~~~~~~< CHANGE HEIGHT OF CROPPER >~~~~~~~ */
                        ReImage_Rectangle.style.height= `${Cropper_New_Height}px`;
                        ReImage_Cover.style.height = `${Cropper_New_Height}px`;
                        // BOUNDING RIGHT SIDE OF THE CROPPER
                        RTSmaxBottom = RTS_rect.bottom;
                    }
                    
                    /* :----*---::----*---:< TOP SIDE RESIDE MOVER -NORTH >:----*---::----*---: */
                    else if (thisMover.classList.contains('RMN')){
                        cropperMoveY += moverMoveY;
                        Cropper_New_Height = (ReImage_Rectangle_rect.height + (moverTouchY - event.clientY));

                        /* Finding the minimum value of the array. */
                        let maxBottom_Cropper_arr = [moveable_area_bottom, RTSmaxBottom];
                        let maxBottom_Cropper = Array.min(maxBottom_Cropper_arr);
                        
                        /* ~~~~~~~< BOUND MAXIMUM HEIGHT >~~~~~~~ */
                        Cropper_New_Height = Math.min(
                            Math.max(Cropper_New_Height, (minWD)), (maxBottom_Cropper - moveable_area_top)
                        );
                        /* ~~~~~~~< CHANGE HEIGHT OF CROPPER >~~~~~~~ */
                        ReImage_Rectangle.style.height= `${Cropper_New_Height}px`;
                        ReImage_Cover.style.height = `${Cropper_New_Height}px`;

                        /* ~~~~~~~< CROPPER MOVE MAX Y-DIRECTION >~~~~~~~ */
                        let wdDY = (((wd*AspectRatio) - (2*minWD))/2);
                        cropperMoveY = Math.min(
                            Math.max(cropperMoveY, (((wd*AspectRatio) - moveable_area_height)/2)), (maxBottom_Cropper - BackgroundCenterY + wdDY)
                        );
                        detect_cropper_collision(cropperMoveX, cropperMoveY);
                    }

                    /* Getting the x and y coordinates of the touch event. */
                    moverTouchX = event.clientX;
                    moverTouchY = event.clientY;
                };

            };

            /* If the mouse is over the cropper, then the cropper is not moving. */
            ReImage_Rectangle.addEventListener('pointerover', moverPO);
            function moverPO(){
                IsResizing = false;
                IsCropperMoving = false;
            }

            /*
             * When the user releases the mouse button, stop listening for mouse movement and stop
             * listening for the mouse to be over the image.
             */
            function moverPU(){
                IsResizing = false;
                IsCropperMoving = false;
                thisMover.removeEventListener('pointermove', moverPM);
                ReImage_Rectangle.removeEventListener('pointerover', moverPO);
                window.removeEventListener('pointerup', moverPU);

                /* Clip-out a particular part form the large canvas. */
                clip_the_canvas();
            }
        }
    }
};

/* Reloading the page after 2 seconds of resizing the window. */
window.addEventListener('resize', ()=>{
    setTimeout(() => {
        Import_Content_and_Adjust();
    }, 1000);

})

RotatePlus_Image.addEventListener('click', ()=>{
    img_rotate += 90;
    if (img_rotate >= 360){
        img_rotate = 0;
    }
    Import_Content_and_Adjust();
})
RotateMinus_Image.addEventListener('click', ()=>{
    img_rotate -= 90;
    if (img_rotate <= -360){
        img_rotate = 0;
    }
    Import_Content_and_Adjust();
})


/* :==================[ DRAW FULL IMAGE ON CANVAS ]======================: */
const CANVAS = document.querySelector('#Image_Drawing_Canvas');

const drawImage_in_canvas = () =>{
    // DRAWING AN IMAGE INSIDE THE CANVAS
    ReImage_Image_Container_rect = ReImage_Image_Container.getBoundingClientRect();
    CANVAS.width = ReImage_Image_Container_rect.width * ImageRespectRatio;
    CANVAS.height = ReImage_Image_Container_rect.height * ImageRespectRatio;
    let draw_width = CANVAS.width;
    let draw_height = CANVAS.height;
    if ((img_rotate == 90) | (img_rotate == 270) | (img_rotate == -90) | (img_rotate == -270)){
        draw_width = CANVAS.height;
        draw_height = CANVAS.width;
    }

    const image = new Image(),
    canvas = CANVAS,
    ctx = canvas.getContext('2d');
    image.src = Image_Content.src
    
    image.addEventListener('load', () => {
        ctx.translate(CANVAS.width / 2, CANVAS.height / 2);
        ctx.rotate(img_rotate*Math.PI/180);
        ctx.drawImage(image,
            -draw_width/ 2, -draw_height / 2,
            draw_width, draw_height
        );
        clip_the_canvas();
    });

}

/* :~~~~~::~~~~~:| CLIP A PART FORM MAIN CANVAS |:~~~~~::~~~~~: */
const clipping_CANVAS = document.querySelector("#Image_clipping_Canvas");
const clip_the_canvas = () =>{
    let Image_Content_rect = Image_Content.getBoundingClientRect();
    ReImage_Rectangle_rect = ReImage_Rectangle.getBoundingClientRect();
    
    let Clipping_CANVAS_width = ReImage_Rectangle_rect.width * ImageRespectRatio;
    let Clipping_CANVAS_height = ReImage_Rectangle_rect.height * ImageRespectRatio;
    clipping_CANVAS.width = Clipping_CANVAS_width;
    clipping_CANVAS.height = Clipping_CANVAS_height;

    let DrawFormLeft = (ReImage_Rectangle_rect.left - Image_Content_rect.left) * ImageRespectRatio;
    let DrawFormTop = (ReImage_Rectangle_rect.top - Image_Content_rect.top) * ImageRespectRatio;

    const final_canvas = clipping_CANVAS,
    hidden_ctx = final_canvas.getContext('2d');

    hidden_ctx.drawImage(
        CANVAS,
        DrawFormLeft,  //Start Clipping X
        DrawFormTop,  //Start Clipping Y
        Clipping_CANVAS_width,  //Clipping Width
        Clipping_CANVAS_height,  //Clipping Height
        0,  //Place X
        0,  //Place Y
        Clipping_CANVAS_width,  //Place Width
        Clipping_CANVAS_height  //Place Height

    )
}