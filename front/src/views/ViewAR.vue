<template>
    <div class="container" ref="canvas_parent">
    </div>
</template>

<script>
    import * as THREE from 'three';
    import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
    
    export default {
        data: function() {
            return {
                speed: 0.01
            }
        },
        created: function() {
            console.log("On Created");

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera( 75,  window.innerWidth / window.innerHeight, 0.1, 1000 );
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({
                side: THREE.FrontSide,
                color: new THREE.Color( 1.0, 0.0, 0.0),
                wireframe: false
            });
            this.cube = new THREE.Mesh(geometry, material);
            const axes = new THREE.AxesHelper(5);

            this.scene.add( this.camera );
            this.scene.add( this.cube );
            this.scene.add( axes );
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.camera.position.x = 5;
            this.camera.position.z = 5;
            this.camera.lookAt( 0, 0, 0 );
            this.scene.background = new THREE.Color( 'hsl(0, 100%, 100%)' );
        },  
        mounted(){
            console.log("On Mount");
            this.$refs.canvas_parent.appendChild( this.renderer.domElement );
            requestAnimationFrame( this.animate )
        },
        methods: {
            animate(){
                requestAnimationFrame( this.animate )
                this.renderer.render( this.scene, this.camera )
                this.cube.rotation.y += this.speed
                //this.controls.update()
            }
        },
        computed: {
            rotate() {
                if (this.speed === '') {
                    return 0
                } else {
                    return this.speed
                }
            }
            
        }
    }
</script>