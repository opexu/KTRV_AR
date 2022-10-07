<template>
    <div id="container-parent">
        <a :href=pinballImage
            class="ui marker" target="_blank">
            🖼 Marker Image
        </a>
        <div id="container" ref="canvas_parent">
            <canvas id="canvas" ref="canvas"></canvas>
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
    import * as THREE from 'three';
    //import 'mind-ar/dist/mindar-image-three.prod.js';
    import { ARnft } from "@webarkit/ar-nft";
    import ARnftThreejs from "@webarkit/arnft-threejs";

    import pinballImage from "@/assets/pinball.jpg";

    import pinball from "@/DataNFT/pinball.fset3";
    import kuva from "@/DataNFT/kuva.fset3";
    import chalk_multi from "@/DataNFT/chalk_multi.fset3";

    import cameraPara from "@/Data/camera_para.dat";

    //import config from "@/Data/config.json";

    export default {
        data: function() {
            return {
                speed: 0.01,
                hideButton: true,
                pinballImage
            }
        },
        mounted(){
            console.log("On Mount");
        },
        methods: {
            async startAR(){
                console.log("startAR clicked");
                
                const config = {
                    addPath: "",
                    cameraPara: cameraPara,
                    container: {
                        create: true,
                        containerName: "",
                        canvasName: ""
                    },
                    videoSettings: {
                        width: {
                            min: 640,
                            max: 800
                        },
                        height: {
                            min: 480,
                            max: 600
                        },
                        facingMode: "environment",
                        targetFrameRate : 30
                    },
                    loading: {
                        create: true,
                        logo: {
                            src: "Data/arNFT-logo.gif",
                            alt: "arNFT.js logo"
                        },
                        loadingMessage: "Loading, please wait..."
                    },
                    stats: {
                        createHtml: true
                    }
                }

                let width = 640;
                let height = 480;
                ARnft.init(width, height, [[pinball]], [['pinball']], config, true)
                .then((nft) => {
                    let mat = new THREE.MeshLambertMaterial({
                        color: 0xff0000
                    });
                    let boxGeom = new THREE.BoxGeometry(1, 1, 1);
                    let cube = new THREE.Mesh(boxGeom, mat);
                    cube.position.z = 90;
                    cube.scale.set(180, 180, 180);

                    document.addEventListener('containerEvent', function (ev) {

                        let canvas = this.$refs.canvas;
                        let fov = 0.8 * 180 / Math.PI;
                        let ratio = width / height;
                        let config = {
                            "renderer": {
                                "alpha": true,
                                "antialias": true,
                                "context": null,
                                "precision": "mediump",
                                "premultipliedAlpha": true,
                                "stencil": true,
                                "depth": true,
                                "logarithmicDepthBuffer": true
                            },
                            "camera": {
                                "fov": fov,
                                "ratio": ratio,
                                "near": 0.01,
                                "far": 1000
                            }
                        }

                        let sceneThreejs = new ARnftThreejs.SceneRendererTJS(config, canvas, nft.uuid, true);
                        sceneThreejs.initRenderer();

                        let nftAddTJS = new ARnftThreejs.NFTaddTJS(nft.uuid);
                        nftAddTJS.oef = true;
                        nftAddTJS.add(cube, 'pinball', false);

                        const tick = () => {
                            sceneThreejs.draw();
                            window.requestAnimationFrame(tick)
                        }
                        tick()

                    })
                }).catch((error) => {
                    console.log(error);
                });
            },
        },
    }
</script>