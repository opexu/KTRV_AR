export default function () {

    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;

    // sanity check
    console.assert(arguments.length === 0);

    // compute sourceWidth, sourceHeight
    if (this.domElement.nodeName === "IMG") {
        var sourceWidth = this.domElement.naturalWidth;
        var sourceHeight = this.domElement.naturalHeight;
    } else if (this.domElement.nodeName === "VIDEO") {
        var sourceWidth = this.domElement.videoWidth;
        var sourceHeight = this.domElement.videoHeight;
    } else {
        console.assert(false);
    }

    // compute sourceAspect
    var sourceAspect = sourceWidth / sourceHeight;
    // compute screenAspect
    var screenAspect = screenWidth / screenHeight;

    // if screenAspect < sourceAspect, then change the width, else change the height
    if (screenAspect < sourceAspect) {
        // compute newWidth and set .width/.marginLeft
        var newWidth = sourceAspect * screenHeight;
        this.domElement.style.width = newWidth + "px";
        this.domElement.style.marginLeft = -(newWidth - screenWidth) / 2 + "px";

        // init style.height/.marginTop to normal value
        this.domElement.style.height = screenHeight + "px";
        this.domElement.style.marginTop = "0px";
    } else {
        // compute newHeight and set .height/.marginTop
        var newHeight = 1 / (sourceAspect / screenWidth);
        this.domElement.style.height = newHeight + "px";
        this.domElement.style.marginTop = -(newHeight - screenHeight) / 2 + "px";

        // init style.width/.marginLeft to normal value
        this.domElement.style.width = screenWidth + "px";
        this.domElement.style.marginLeft = "0px";
    }
};