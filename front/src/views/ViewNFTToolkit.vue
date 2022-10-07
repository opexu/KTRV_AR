<template>
    <div id="ARScene" ref="container" class="w-full h-full">
        <video
			loop
			autoplay
			muted
			playsinline
			id="video" ref="video"
            class="w-full h-full object-cover absolute">
		</video>
		<canvas id="canvas" ref="canvas" class="w-full h-full object-cover absolute"></canvas>
    </div>
</template>

<script>
    import { ARToolkitNFT, ARControllerNFT } from '@webarkit/jsartoolkit-nft'
    //import { ARToolkitNFT, ARControllerNFT } from "./../scripts/ARToolkitNFT.js";
    import { initCamera } from "./../scripts/index.js";
    import { start } from "./../scripts/threejs_multi_worker_ES6";

    export default {
        async mounted(){
            
            let sourceVideo;
            let targetCanvas;

            const videoEl = this.$refs.video;
            const canvasEl = this.$refs.canvas;    

            const markerUrls = [ 
                "../DataNFT/pinball",
                "../DataNFT/chalk_multi",
                "../DataNFT/kuva" 
            ];

            
            const video = await initCamera();

            // start camera playback
            sourceVideo = video;
            sourceVideo.width = 640;
            sourceVideo.height = 480;
            sourceVideo.play();

            // init target canvas
            targetCanvas = canvasEl;
            targetCanvas.width = sourceVideo.width;
            targetCanvas.height = sourceVideo.height;

            sourceVideo.addEventListener("loadeddata", event => {
                console.log("Camera is ready");
                start(
                    markerUrls, 
                    video, 
                    video.videoWidth, 
                    video.videoHeight,
                    canvasEl,
                    function() { 
                        console.log('1');
                    }, 
                    function() { 
                        console.log('2');
                });
            });
        },
    }
</script>