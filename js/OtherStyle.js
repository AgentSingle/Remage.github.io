const Preview_Image = document.querySelector('#Preview_Image');
// const Preview_Container = document.querySelector('.Preview_Container');

Preview_Image.addEventListener('click', ()=>{
    // Preview_Container.classList.remove('Preview_Container');
    let Image_Preview_Container = document.querySelector("#Image_Preview_Container");
    if (Image_Preview_Container.classList.contains('Hide_Image_Preview_Container')){
        const clipping_CANVAS = document.querySelector("#Image_clipping_Canvas");
        let dataURL = clipping_CANVAS.toDataURL('image/png');
        Preview_Container.innerHTML = `<img src="${dataURL}" 
                                        style="width:${ReImage_Rectangle_rect.width}px;
                                        height:${ReImage_Rectangle_rect.height}px"
                                        alt="alterImg">`;
        Image_Preview_Container.classList.remove('Hide_Image_Preview_Container');
        Preview_Image.innerText = 'Hide';
    }
    else{
        Image_Preview_Container.classList.add('Hide_Image_Preview_Container');
        Preview_Image.innerText = 'Preview Image';
    }
})