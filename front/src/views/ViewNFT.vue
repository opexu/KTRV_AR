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
    import ThreeMultiWorker from "../scripts/threejs_multi_worker_ES6_custom.js";
    import { ARToolkitNFT, ARControllerNFT } from '@webarkit/jsartoolkit-nft';


    export default {
        async mounted(){
            console.log('ARToolkitNFT',ARToolkitNFT);
            console.log('ARControllerNFT',ARControllerNFT);

            const videoEl = this.$refs.video;
            const canvasEl = this.$refs.canvas;

            const tmw = new ThreeMultiWorker( videoEl, canvasEl );
            tmw.init();            
        },
    }
</script>