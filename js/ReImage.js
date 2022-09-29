/* :~~~~~::~~~~~::~~~~~:| IMPORT REQUIRE DOM |:~~~~~::~~~~~::~~~~~: */
const ReImage_Image_Container = document.querySelector('.ReImage_Image_Container');
const ReImage_TensileS = document.querySelectorAll('.ReImage_Tensile');
const ReImage_MoverS = document.querySelectorAll('.ReImage_Mover');


let Image_Content = ReImage_Image_Container.firstElementChild,
    ImageUrl = Image_Content.src;

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

let moverTouchX,
    moverTouchY,
    IsResizing = false;

const RTE = document.querySelector('.RTE');
const RTS = document.querySelector('.RTS');
let RTE_rect, RTEmaxRight, RTS_rect, RTSmaxBottom;


let wd = 100; // :INITIAL WIDTH OF CROPPER
let minWD = 50;
let AspectRatio = 1/1; // CROPPER ASPECT-RATIO

/* :~~~~~::~~~~~:| FUNCTION RETURN MINIMUM AND MAXIMUM VALUE FROM AN ARRAY |:~~~~~::~~~~~: */
/* Creating a function that will return the minimum value of an array. */
Array.min = function( min_arr ){
    return Math.min.apply( Math, min_arr );
};
/* Finding the maximum value in an array. */
Array.max = function( max_arr ){
    return Math.max.apply( Math, max_arr );
};


/**
 * Check if the URL is an image by fetching the URL and checking the response's blob type.
 */
async function checkImage(url){
    const res = await fetch(url);
    const buff = await res.blob();
    return buff.type.startsWith('image/')
};

/* Checking if the image is valid. */
window.addEventListener('load', () =>{
    /* Checking if the image is valid. */
    checkImage(`${ImageUrl}`)
    .then(res =>{
        if (res == true){
            Initialize_Cropper()
        }
        else if (res == false){
            // ADD LOGIC LATER
            return
        }
    }) 
});

window.addEventListener('scroll', ()=>{
    scroll_height = document.documentElement.scrollTop;
    scroll_width = document.documentElement.scrollLeft;
})

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


/**
 * "Import_Content_and_Adjust" is a function that imports the content of the HTML file and adjusts the
 * content to fit the screen.
 */
const Import_Content_and_Adjust = () =>{
    /* Getting the scroll height and width of the window. */
    ReImage_Background = document.querySelector('.ReImage_Background');
    ReImage_Cover = document.querySelector('.ReImage_Cover');
    ReImage_Rectangle = document.querySelector('.ReImage_Rectangle');
    cropperMoveX = 0;
    cropperMoveY = 0;
    detect_cropper_collision(cropperMoveX, cropperMoveY);
    scroll_height = 0;
    scroll_width = 0;


    /* :~~~~~::~~~~~::~~~~~:| REQUIRE BOUNDING RECTANGLE |:~~~~~::~~~~~::~~~~~: */
    ReImage_Background_rect = ReImage_Background.getBoundingClientRect(), // BACKGROUND RECTANGLE
    ReImage_Cover_rect = ReImage_Cover.getBoundingClientRect(), // CROPPER WRAPPER RECTANGLE

    /* CropperSize() is a function that sets the size of the cropper to the size of the window.*/
    ReImage_Rectangle.style.width = `${wd}px`;
    ReImage_Rectangle.style.height = `${wd*AspectRatio}px`;
    ReImage_Cover.style.width = `${wd}px`;
    ReImage_Cover.style.height = `${wd*AspectRatio}px`;
    ReImage_Cover.style.position = `absolute`;
    ReImage_Rectangle.style.left = `${0}`;
    ReImage_Rectangle.style.top = `${0}`;
    ReImage_Rectangle_rect = ReImage_Rectangle.getBoundingClientRect(),


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
        ReImage_Image_Container.style.width = `${ReImage_Background_rect.width}px`;
        ReImage_Image_Container.style.height = `${Math.round(ReImage_Background_rect.width / Image_Content_AspectRatio)}px`;
        position_content();
    }
    /* -----:[ WHEN PICTURE WIDTH < HEIGHT ]:----- */
    /* Checking if the image is too tall for the background. If it is, it is resizing the image to fit the
    background. */
    if ((Image_Content_AspectRatio < Background_AspectRatio) & (Image_Content_AspectRatio > 0)){
        ReImage_Image_Container.style.width = `${Math.round(ReImage_Background_rect.height * Image_Content_AspectRatio)}px`;
        ReImage_Image_Container.style.height = `${ReImage_Background_rect.height}px`;
        position_content();
    }
    /* -----:[ CENTER ALL CONTENTS ]:----- */
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

    /* Calling the function Detect_Moveable_Area() */
    Detect_Moveable_Area();

    /* Getting the right side of the RTE. */
    RTE_rect = RTE.getBoundingClientRect();
    RTEmaxRight = RTE_rect.right;
    RTS_rect = RTS.getBoundingClientRect();
    RTSmaxBottom = RTS_rect.bottom;
}


/**
 * The function detects the collision of the cropper with the image and moves the cropper accordingly.
 * @param cropperMoveX - The X-axis movement of the cropper
 * @param cropperMoveY - The Y-axis movement of the cropper
 */
const detect_cropper_collision = (cropperMoveX, cropperMoveY)=>{
    ReImage_Cover.style.transform = `translate(${cropperMoveX}px, ${cropperMoveY}px)`;
}

/**
 * When the user clicks on the cropper, the cropper will follow the mouse until the user releases the
 * mouse button.
 */
const Initialize_Cropper = () =>{
    Import_Content_and_Adjust();


    ReImage_Rectangle.addEventListener('pointerdown', cropperPointerDown);
    function cropperPointerDown(e){
        e.preventDefault();
        IsCropperMoving = true;
        cropperTouchX = e.clientX - cropperMoveX;
        cropperTouchY = e.clientY - cropperMoveY;

        window.addEventListener('pointermove', cropperPointermove);
        window.addEventListener('pointerup', cropperPointerup);

        /**
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
        }
    };


    /* The above code is a function that is supposed to resize the cropper. */
    for (let ReImage_Mover of ReImage_MoverS){
        ReImage_Mover.addEventListener('pointerdown', moverPD);

        function moverPD(e){
            e.preventDefault();
            let thisMover = e.target;
            moverTouchX = e.clientX;
            moverTouchY = e.clientY;

            window.addEventListener('pointermove', moverPM);
            window.addEventListener('pointerup', moverPU);

            function moverPM(event){
                IsResizing = true;
                let moverMoveX = event.clientX - moverTouchX;
                let moverMoveY = event.clientY - moverTouchY;

                if (IsResizing == true){
                    let Cropper_New_Width;
                    let Cropper_New_Height;
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
                };
                moverTouchX = event.clientX;
                moverTouchY = event.clientY;

            };

            function moverPU(){
                IsResizing = false;
                window.removeEventListener('pointermove', moverPM);
                window.removeEventListener('pointerup', moverPU);
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
