<template>
    <div id="container-parent">
        <div id="container" ref="canvas_parent">
        </div>
        <button class="absolute -translate-x-1/2 translate-y-1/2 left-1/2 top-1/2 rounded-md bg-green-600 py-2 px-3 text-[0.8125rem] font-semibold leading-5 text-white hover:bg-indigo-500"
            v-on:click="startAR"
            v-if="hideButton"
            >START AR</button>
    </div>
</template>

<style scoped>
    #container-parent{
        width: auto;
        height: auto;
    }

    #container{
        width: 100vw;
        height: 100vh;
        position: relative;
        overflow: hidden;
    }
</style>

<script>
    //import * as THREE from 'three';
    import 'mind-ar/dist/mindar-image-three.prod.js';
    //import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
    //import { ARButton } from 'three/addons/webxr/ARButton.js';
    //import { ARButton } from '@/scripts/ARButton_MT.js';
    import targetImage from "@/assets/targets.mind";

    export default {
        data: function() {
            return {
                speed: 0.01,
                hideButton: true
            }
        },
        mounted(){
            console.log("On Mount");

            const THREE = MINDAR.IMAGE.THREE;

            this.mindarThree = new MINDAR.IMAGE.MindARThree({
                container: this.$refs.canvas_parent,
                imageTargetSrc: targetImage
            });
            
            const anchor = this.mindarThree.addAnchor(0);
            const geometry = new THREE.PlaneGeometry( 1, 0.55 );
            const material = new THREE.MeshBasicMaterial( { color: 0x00ffff, transparent: true, opacity: 0.5 } );
            const plane = new THREE.Mesh( geometry, material );
            
            anchor.group.add( plane );
        },
        methods: {
            async startAR(){
                console.log("startAR clicked");
                
                await this.mindarThree.start();

                this.hideButton = false;

                const { renderer, scene, camera } = this.mindarThree;

                renderer.setAnimationLoop(() => {
                    renderer.render( scene, camera );
                });
            },
        },
    }
</script>