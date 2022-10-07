export default class Source {
    constructor( parameters ){

        this.ready = false;
        this.domElement = null;
    
        // handle default parameters
        this.parameters = {
            // type of source - ['webcam', 'image', 'video']
            sourceType: "webcam",
            // url of the source - valid if sourceType = image|video
            sourceUrl: null,
    
            // Device id of the camera to use (optional)
            deviceId: null,
    
            // resolution of at which we initialize in the source image
            sourceWidth: null,
            sourceHeight: null,
            // resolution displayed for the source
            displayWidth: 640,
            displayHeight: 480,
    
            parent: null
        }
        
        this.setParameters( parameters );
    }

    setParameters( parameters ) {
        if (parameters === undefined) return;
        for (const key in parameters) {
            const newValue = parameters[key];
    
            if (newValue === undefined) {
                console.warn("ArToolkitSource: '" + key + "' parameter is undefined.");
                continue;
            }

            this.parameters[key] = newValue;
        }
    }

    onInitialClick() {
        if (this.domElement && this.domElement.play) {
            this.domElement.play().then(() => { });
        }
    }

    async init( onReady, onError ) {
        let domElement = null;
        if (this.parameters.sourceType === "image") {
            this._initSourceImage(onSourceReady.bind(this), onError);
        } else if (this.parameters.sourceType === "video") {
            this._initSourceVideo(onSourceReady.bind(this), onError);
        } else if (this.parameters.sourceType === "webcam") {
            await this._initSourceWebcam(onSourceReady.bind(this), onError);
        } else {
            console.assert(false);
        }
    
        // attach

        this.domElement.style.position = "absolute";
        this.domElement.style.top = "0px";
        this.domElement.style.left = "0px";
        this.domElement.style.zIndex = "-2";
        this.domElement.setAttribute("id", "arjs-video");

        function onSourceReady() {

            this.parameters.parent ? this.parameters.parent.appendChild(this.domElement) : document.body.appendChild(this.domElement);

            window.dispatchEvent(
                new CustomEvent("arjs-video-loaded", {
                    detail: {
                        component: document.querySelector("#arjs-video"),
                    },
                })
            );
    
            this.ready = true;
    
            onReady && onReady();
        }

        return this;
    }

    _initSourceImage( onReady ){
        // TODO make it static
        const domElement = document.createElement("img");
        domElement.src = this.parameters.sourceUrl;

        domElement.width = this.parameters.sourceWidth;
        domElement.height = this.parameters.sourceHeight;
        domElement.style.width = this.parameters.displayWidth + "px";
        domElement.style.height = this.parameters.displayHeight + "px";

        this.domElement = domElement;
        this.domElement.onload = onReady;
        //return domElement;
    }

    _initSourceVideo( onReady ){
        // TODO make it static
        const domElement = document.createElement("video");
        domElement.src = this.parameters.sourceUrl;

        domElement.style.objectFit = "initial";

        domElement.autoplay = true;
        domElement.webkitPlaysinline = true;
        domElement.controls = false;
        domElement.loop = true;
        domElement.muted = true;

        // start the video on first click if not started automatically
        document.body.addEventListener("click", this.onInitialClick, { once: true });

        domElement.width = this.parameters.sourceWidth;
        domElement.height = this.parameters.sourceHeight;
        domElement.style.width = this.parameters.displayWidth + "px";
        domElement.style.height = this.parameters.displayHeight + "px";

        this.domElement = domElement;

        this.domElement.onloadeddata = onReady;
        //return domElement;
    }

    async _initSourceWebcam( onReady, onError ) {

        // init default value
        onError =
            onError ||
            function (error) {
                const event = new CustomEvent("camera-error", { error: error });
                window.dispatchEvent(event);

                setTimeout(() => {
                    if (!document.getElementById("error-popup")) {
                        const errorPopup = document.createElement("div");
                        errorPopup.innerHTML =
                            "Webcam Error\nName: " + error.name + "\nMessage: " + error.message;
                        errorPopup.setAttribute("id", "error-popup");
                        document.body.appendChild(errorPopup);
                    }
                }, 1000);
            };

        const domElement = document.createElement("video");
        domElement.setAttribute("autoplay", "");
        domElement.setAttribute("muted", "");
        domElement.setAttribute("playsinline", "");
        domElement.style.objectFit = 'cover';
        domElement.style.width = this.parameters.displayWidth + "px";
        domElement.style.height = this.parameters.displayHeight + "px";

        // check API is available
        if (
            navigator.mediaDevices === undefined ||
            navigator.mediaDevices.enumerateDevices === undefined ||
            navigator.mediaDevices.getUserMedia === undefined
        ) {
            let fctName = "";
            if (navigator.mediaDevices === undefined)
                fctName = "navigator.mediaDevices";
            else if (navigator.mediaDevices.enumerateDevices === undefined)
                fctName = "navigator.mediaDevices.enumerateDevices";
            else if (navigator.mediaDevices.getUserMedia === undefined)
                fctName = "navigator.mediaDevices.getUserMedia";
            else console.assert(false);
            onError({
                name: "",
                message: "WebRTC issue-! " + fctName + " not present in your browser",
            });
            return null;
        }
        
        // get available devices
        try{
            await navigator.mediaDevices.enumerateDevices()
            
            const userMediaConstraints = {
                audio: false,
                video: {
                    facingMode: "environment",
                    // width: {
                    //     ideal: 1280,
                    //     // min: 1024,
                    //     // max: 1920
                    // },
                    // height: {
                    //     ideal: 720,
                    //     // min: 776,
                    //     // max: 1080
                    // },
                },
            };
    
            if (null !== this.parameters.deviceId) {
                userMediaConstraints.video.deviceId = {
                    exact: this.parameters.deviceId,
                };
            }           
    
            // get a device which satisfy the constraints
            try{
                const mediaStream = await navigator.mediaDevices.getUserMedia( userMediaConstraints )
                const videoTrack = mediaStream.getVideoTracks()[0];
                const videoCapabilities = videoTrack.getCapabilities();
                console.log('videoCapabilities',videoCapabilities);
                const maxWidth = videoCapabilities.width.max;
                const maxHeight = videoCapabilities.height.max;

                domElement.srcObject = mediaStream;
    
                const event = new CustomEvent("camera-init", { stream: mediaStream });
                window.dispatchEvent(event);
    
                // start the video on first click if not started automatically
                document.body.addEventListener("click", this.onInitialClick, {
                    once: true,
                });

                this.domElement = domElement;

                onReady();
                
                //return domElement;
            }
            catch (error) {
                onError({
                    name: error.name,
                    message: error.message,
                });
            };
        }
        catch(error) {
            onError({
                message: error.message,
            });
        };
        
    }

    dispose() {
        this.ready = false;

        switch (this.parameters.sourceType) {
            case "image":
                this._disposeSourceImage();
                break;

            case "video":
                this._disposeSourceVideo();
                break;

            case "webcam":
                this._disposeSourceWebcam();
                break;
        }

        this.domElement = null;

        document.body.removeEventListener("click", this.onInitialClick, {
            once: true,
        });
    }

    _disposeSourceImage(){
        const domElement = document.querySelector("#arjs-video");

        if (!domElement) {
            return;
        }

        domElement.remove();
    }

    _disposeSourceVideo(){
        const domElement = document.querySelector("#arjs-video");

        if (!domElement) {
            return;
        }

        // https://html.spec.whatwg.org/multipage/media.html#best-practices-for-authors-using-media-elements
        domElement.pause();
        domElement.removeAttribute("src");
        domElement.load();

        domElement.remove();
    }

    _disposeSourceWebcam(){
        const domElement = document.querySelector("#arjs-video");

        if (!domElement) {
            return;
        }

        // https://stackoverflow.com/a/12436772
        if (domElement.srcObject && domElement.srcObject.getTracks) {
            domElement.srcObject.getTracks().map((track) => track.stop());
        }

        domElement.remove();
    }

    hasMobileTorch(){
        const stream = arToolkitSource.domElement.srcObject;
        if (stream instanceof MediaStream === false) return false;

        if (this._currentTorchStatus === undefined) {
            this._currentTorchStatus = false;
        }

        const videoTrack = stream.getVideoTracks()[0];

        // if videoTrack.getCapabilities() doesnt exist, return false now
        if (videoTrack.getCapabilities === undefined) return false;

        const capabilities = videoTrack.getCapabilities();

        return capabilities.torch ? true : false;
    }

    /**
    * toggle the flash/torch of the mobile fun if applicable.
    * Great post about it https://www.oberhofer.co/mediastreamtrack-and-its-capabilities/
    */
    toggleMobileTorch(){
        // sanity check
        console.assert(this.hasMobileTorch() === true);

        const stream = arToolkitSource.domElement.srcObject;
        if (stream instanceof MediaStream === false) {
            if (!document.getElementById("error-popup")) {
                const errorPopup = document.createElement("div");
                errorPopup.innerHTML =
                    "enabling mobile torch is available only on webcam";
                errorPopup.setAttribute("id", "error-popup");
                document.body.appendChild(errorPopup);
            }
            return;
        }

        if (this._currentTorchStatus === undefined) {
            this._currentTorchStatus = false;
        }

        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();

        if (!capabilities.torch) {
            if (!document.getElementById("error-popup")) {
                const errorPopup = document.createElement("div");
                errorPopup.innerHTML = "no mobile torch is available on your camera";
                errorPopup.setAttribute("id", "error-popup");
                document.body.appendChild(errorPopup);
            }
            return;
        }

        this._currentTorchStatus = this._currentTorchStatus === false ? true : false;
        videoTrack
            .applyConstraints({
                advanced: [
                    {
                        torch: this._currentTorchStatus,
                    },
                ],
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    domElementWidth(){
        return parseInt(this.domElement.style.width);
    }

    domElementHeight(){
        return parseInt(this.domElement.style.height);
    }

    onResizeElement(){
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // sanity check
        console.assert(arguments.length === 0);

        // compute sourceWidth, sourceHeight
        let sourceWidth, sourceHeight = null;
        if (this.domElement.nodeName === "IMG") {
            sourceWidth = this.domElement.naturalWidth;
            sourceHeight = this.domElement.naturalHeight;
        } else if (this.domElement.nodeName === "VIDEO") {
            sourceWidth = this.domElement.videoWidth;
            sourceHeight = this.domElement.videoHeight;
        } else {
            console.assert(false);
        }

        // compute sourceAspect
        const sourceAspect = sourceWidth / sourceHeight;
        // compute screenAspect
        const screenAspect = screenWidth / screenHeight;

        // if screenAspect < sourceAspect, then change the width, else change the height
        if (screenAspect < sourceAspect) {
            // compute newWidth and set .width/.marginLeft
            const newWidth = sourceAspect * screenHeight;
            this.domElement.style.width = newWidth + "px";
            this.domElement.style.marginLeft = -(newWidth - screenWidth) / 2 + "px";

            // init style.height/.marginTop to normal value
            this.domElement.style.height = screenHeight + "px";
            this.domElement.style.marginTop = "0px";
        } else {
            // compute newHeight and set .height/.marginTop
            const newHeight = 1 / (sourceAspect / screenWidth);
            this.domElement.style.height = newHeight + "px";
            this.domElement.style.marginTop = -(newHeight - screenHeight) / 2 + "px";

            // init style.width/.marginLeft to normal value
            this.domElement.style.width = screenWidth + "px";
            this.domElement.style.marginLeft = "0px";
        }
    }

    copyElementSizeTo( otherElement ){
        if (window.innerWidth > window.innerHeight) {
            //landscape
            otherElement.style.width = this.domElement.style.width;
            otherElement.style.height = this.domElement.style.height;
            otherElement.style.marginLeft = this.domElement.style.marginLeft;
            otherElement.style.marginTop = this.domElement.style.marginTop;
        } else {
            //portrait
            otherElement.style.height = this.domElement.style.height;
            otherElement.style.width =
                (parseInt(otherElement.style.height) * 4) / 3 + "px";
            otherElement.style.marginLeft =
                (window.innerWidth - parseInt(otherElement.style.width)) / 2 + "px";
            otherElement.style.marginTop = 0;
        }
    }

    copySizeTo(){
        console.warn(
            "obsolete function arToolkitSource.copySizeTo. Use arToolkitSource.copyElementSizeTo"
        );
        this.copyElementSizeTo.apply(this, arguments);
    }

    onResize( arToolkitContext, renderer, camera ){
        if (arguments.length !== 3) {
            console.warn(
                "obsolete function arToolkitSource.onResize. Use arToolkitSource.onResizeElement"
            );
            return this.onResizeElement.apply(this, arguments);
        }
    
        const trackingBackend = arToolkitContext.parameters.trackingBackend;
    
        // RESIZE DOMELEMENT
        if (trackingBackend === "artoolkit") {
            this.onResizeElement();
    
            const isAframe = renderer.domElement.dataset.aframeCanvas ? true : false;
            if (isAframe === false) {
                this.copyElementSizeTo(renderer.domElement);
            } else {
            }
    
            if (arToolkitContext.arController !== null) {
                this.copyElementSizeTo(arToolkitContext.arController.canvas);
            }
        } else console.assert(false, "unhandled trackingBackend " + trackingBackend);
    
        // UPDATE CAMERA
        if (trackingBackend === "artoolkit") {
            if (arToolkitContext.arController !== null) {
                camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
            }
        } else console.assert(false, "unhandled trackingBackend " + trackingBackend);
    }
}