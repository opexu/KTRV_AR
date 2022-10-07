<template>
    <div id="ARScene" ref="container" class="w-full h-full resize"></div>
</template>

<script>
    import * as THREE from 'three';
    import { ArToolkitProfile, ArToolkitContext, ArMarkerControls } from '@ar-js-org/ar.js/three.js/build/ar-threex.js';
    import CameraPara from '../Data/camera_para.dat';
    import PattHiro from '../Data/patt.hiro';

    import ArToolkitSource from '../scripts/ArToolkitSource.js';
    //import OnResizeElement from '../scripts/OnResizeElement.js';

    export default {
        async mounted(){
            ArToolkitContext.baseURL = './';
            console.log("ARScene mounted");

            // init renderer
            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });

            // navigator.mediaDevices.getUserMedia({ video: true }).then(( mediaStream )=>{
            //     const videoTrack = mediaStream.getVideoTracks()[0];
            //     const videoCapabilities = videoTrack.getCapabilities();
            //     console.log('videoCapabilities',videoCapabilities);
                
            // });
            const width = this.$refs.container.scrollWidth;
            const height = this.$refs.container.scrollHeight;

            renderer.setSize( width, height );
            renderer.setClearColor( new THREE.Color('lightgrey'), 0 );
            renderer.setPixelRatio( window.devicePixelRatio );
            // renderer.domElement.style.position = 'absolute';
            // renderer.domElement.style.top = '0px';
            // renderer.domElement.style.left = '0px';
            this.$refs.container.appendChild( renderer.domElement );

            // array of functions for the rendering loop
            const onRenderFcts= [];

            // init scene
            const scene	= new THREE.Scene();

            const camera = new THREE.Camera();
            scene.add( camera );
            
            const arToolkitSource = new ArToolkitSource({
                sourceType: 'webcam',

                //sourceWidth: window.innerWidth > window.innerHeight ? 640 : 480,
			    //sourceHeight: window.innerWidth > window.innerHeight ? 480 : 640,

                displayWidth: width,
                displayHeight: height,

                parent: this.$refs.container
            });

            await arToolkitSource.init(function onReady(){
                console.log('arToolkitSource init ready')

                setTimeout(() => {
                    onResize();
                }, 2000);
                
            });

            // handle resize
            window.addEventListener('resize', onResize.bind(this));

            function onResize(){
                console.log('onresize');
                // arToolkitSource.onResizeElement();
                // arToolkitSource.copyElementSizeTo(renderer.domElement);
                if( arToolkitContext.arController !== null){
                    arToolkitSource.copyElementSizeTo( arToolkitContext.arController.canvas )
                }
            }

            ////////////////////////////////////////////////////////////////////////////////
            //          initialize arToolkitContext
            ////////////////////////////////////////////////////////////////////////////////

            // create atToolkitContext
            const arToolkitContext = new ArToolkitContext({
                debug: false,
                cameraParametersUrl: CameraPara, //ArToolkitContext.baseURL + 'Data/camera_para.dat',
                detectionMode: 'mono_and_matrix',
                canvasWidth: width,
                canvasHeight: height,
                imageSmoothingEnabled : true, // There is still a warning about mozImageSmoothingEnabled when using Firefox
            });

            // initialize it
            arToolkitContext.init(function onCompleted(){
                // copy projection matrix to camera
                console.log('arToolkitContext init completed')
                camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
            });

            // update artoolkit on every frame
            onRenderFcts.push(function(){
                if( arToolkitSource.ready === false ) return
                arToolkitContext.update( arToolkitSource.domElement );
            });

            ////////////////////////////////////////////////////////////////////////////////
            //          Create a ArMarkerControls
            ////////////////////////////////////////////////////////////////////////////////

            const markerGroup = new THREE.Group()
            scene.add(markerGroup)
            
            const markerControls = new ArMarkerControls(arToolkitContext, markerGroup, {
                type: 'pattern',
                patternUrl: PattHiro,//ArToolkitContext.baseURL + 'Data/patt.hiro',
                smooth: true,
                smoothCount: 5,
                smoothTolerance: 0.01,
                smoothThreshold: 2
            });

            //////////////////////////////////////////////////////////////////////////////////
            //		add an object in the scene
            //////////////////////////////////////////////////////////////////////////////////

            const markerScene = new THREE.Scene();
            markerGroup.add( markerScene );
            
            const axesHelper = new THREE.AxesHelper();
            markerScene.add( axesHelper );

            // add a torus knot
            const boxGeo = new THREE.BoxGeometry( 1, 1, 1 );
            const boxMat = new THREE.MeshNormalMaterial({
                transparent : true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const boxMesh = new THREE.Mesh( boxGeo, boxMat );
            boxMesh.position.y = boxGeo.parameters.height / 2;
            markerScene.add( boxMesh );

            // const torusGeo = new THREE.TorusKnotGeometry( 0.3, 0.1, 64, 16 );
            // const torusMat = new THREE.MeshNormalMaterial({
            //     transparent : true,
            //     opacity: 0.5,
            //     side: THREE.DoubleSide
            // });
            // const torusMesh = new THREE.Mesh( torusGeo, torusMat );
            // torusMesh.position.y = 0.5;
            // markerScene.add( torusMesh );

            // onRenderFcts.push( function( delta ){
            //     torusMesh.rotation.x += delta * Math.PI;
            // });

            //////////////////////////////////////////////////////////////////////////////////
            //		render the whole thing on the page
            //////////////////////////////////////////////////////////////////////////////////
            
            onRenderFcts.push( function(){
                renderer.render( scene, camera );
            });

             // run renderint loop

            let lastTimeMsec = null;
           
            function animate( nowMsec ){
                
                // measure time
                lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
                const deltaMsec	= Math.min(200, nowMsec - lastTimeMsec);
                lastTimeMsec = nowMsec;
                // call each update function
                onRenderFcts.forEach(function(onRenderFct){
                    onRenderFct( deltaMsec / 1000, nowMsec / 1000 );
                })

                // keep looping
                requestAnimationFrame( animate );
            }

            animate();
        },
    }
</script>