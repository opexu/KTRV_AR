import * as THREE from 'three';

export default class ThreeMultiWorker {
    constructor( videoEl, canvasEl ){
        this.videoEl = videoEl;
        this.canvasEl = canvasEl;

        this.sourceVideo = null;
        this.targetCanvas = null;

        this.marker1 = null;
        this.marker2 = null;
        this.marker3 = null;

        this.vw = null;
        this.vh = null;
        this.sw = null;
        this.sh = null;
        this.pscale = null;
        this.sscale = null;
        this.w = null;
        this.h = null;
        this.w = null;
        this.h = null;
        this.pw = null;
        this.ph = null;
        this.ox = null;
        this.oy = null;

        this.worker = null;

        this.world = null;
        this.index = null;

        this.canvas_process = document.createElement('canvas');
        this.context_process = this.canvas_process.getContext('2d');

        this.lasttime = Date.now();
        this.time = 0;
    }

    async init(){
        const video = await this.initCamera()

        this.sourceVideo = video;
        this.sourceVideo.width = 640;
        this.sourceVideo.height = 480;
        this.sourceVideo.play();

        this.targetCanvas = this.canvasEl;
        this.targetCanvas.width = this.sourceVideo.width;
        this.targetCanvas.height = this.sourceVideo.height;

        this.sourceVideo.addEventListener("loadeddata", event => {
            this.start();
        });
    }

    async initCamera(){
        const constraints = {
            audio: false,
            video: {
                facingMode: "environment",
                width: 640,
                height: 480
            }
        };

        // initialize video source
        const video = this.videoEl;
        const stream = await navigator.mediaDevices.getUserMedia( constraints );
        video.srcObject = stream;

        return new Promise(resolve => {
            video.onloadedmetadata = () => {
                resolve( video );
            };
        });
    }

    isMobile () {
        return /Android|mobile|iPad|iPhone/i.test(navigator.userAgent);
    }

    setMatrix( matrix, value ){
        const array = [];
        for (const key in value) {
            array[key] = value[key];
        }
        if (typeof matrix.elements.set === "function") {
            matrix.elements.set(array);
        } else {
            matrix.elements = [].slice.call(array);
        }
    }

    start() {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.targetCanvas, 
            alpha: true, 
            antialias: true });
        this.renderer.setPixelRatio( window.devicePixelRatio );
      
        this.scene = new THREE.Scene();

        this.camera = new THREE.Camera();
        this.camera.matrixAutoUpdate = false;
      
        this.scene.add( this.camera );

        this.root = new THREE.Object3D();
        this.scene.add( this.root );

        this.sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 8, 8),
            new THREE.MeshNormalMaterial()
        );
      
        this.cube = new THREE.Mesh(
            new THREE.BoxGeometry(0.5),
            new THREE.MeshNormalMaterial()
        );
      
        this.cone = new THREE.Mesh(
            new THREE.ConeGeometry( 0.5, 1, 32 ),
            new THREE.MeshNormalMaterial()
        );

        this.sphere.material.flatShading;
        this.sphere.scale.set(200, 200, 200);
    
        this.cube.material.flatShading;
        this.cube.scale.set(200, 200, 200);
    
        this.cone.material.flatShading;
        this.cone.rotation.x = 90;
        this.cone.scale.set(200, 200, 200);
      
        this.root.matrixAutoUpdate = false;
        this.root.add( this.sphere );
        this.root.add( this.cube );
        this.root.add( this.cone );

        this.vw = this.sourceVideo.videoWidth;
        this.vh = this.sourceVideo.videoHeight;
    
        this.pscale = 320 / Math.max(this.vw, this.vh / 3 * 4);
        this.sscale = this.isMobile() ? window.outerWidth / this.sourceVideo.videoWidth : 1;
    
        this.sw = this.vw * this.sscale;
        this.sh = this.vh * this.sscale;
    
        this.w = this.vw * this.pscale;
        this.h = this.vh * this.pscale;
        this.pw = Math.max(this.w, this.h / 3 * 4);
        this.ph = Math.max(this.h, this.w / 4 * 3);
        this.ox = (this.pw - this.w) / 2;
        this.oy = (this.ph - this.h) / 2;
        this.canvas_process.style.clientWidth = this.pw + "px";
        this.canvas_process.style.clientHeight = this.ph + "px";
        this.canvas_process.width = this.pw;
        this.canvas_process.height = this.ph;
    
        this.renderer.setSize( this.sw, this.sh );
        
        const camera_para = '../Data/camera_para.dat'
        const markerUrls = [ 
            "../DataNFT/pinball",
            "../DataNFT/chalk_multi",
            "../DataNFT/kuva" 
        ];

        this.worker = new Worker('../src/scripts/artoolkitNFT_multi_ES6.worker.js')
    
        this.worker.postMessage({ type: "load", pw: this.pw, ph: this.ph, camera_para: camera_para, marker: markerUrls });
    
        this.worker.onmessage = this.onmessage.bind(this);

        this.tick();
        this.process();
    }
    
    found( msg ) {
        if (!msg) {
            this.world = null;
        } else {
            this.world = JSON.parse( msg.matrixGL_RH );
            this.index = JSON.parse( msg.index );
        }
    };

    onmessage( ev ){
        const msg = ev.data;
        switch (msg.type) {
            case "loaded": {
                const proj = JSON.parse(msg.proj);
                const ratioW = this.pw / this.w;
                const ratioH = this.ph / this.h;
                proj[0] *= ratioW;
                proj[4] *= ratioW;
                proj[8] *= ratioW;
                proj[12] *= ratioW;
                proj[1] *= ratioH;
                proj[5] *= ratioH;
                proj[9] *= ratioH;
                proj[13] *= ratioH;
                this.setMatrix( this.camera.projectionMatrix, proj );
                break;
            }
            case "endLoading": {
                if (msg.end == true) {
                    // removing loader page if present
                    const loader = document.getElementById('loading');
                    if (loader) {
                        loader.querySelector('.loading-text').innerText = 'Start the tracking!';
                        setTimeout(function(){
                            loader.parentElement.removeChild(loader);
                        }, 2000);
                    }
                }
                break;
            }
            case 'found': {
                this.found(msg);
                break;
            }
            case 'not found': {
                this.found(null);
                break;
            }
            case 'markerInfos': {
                this.marker1 = msg.marker1;
                this.marker2 = msg.marker2;
                this.marker3 = msg.marker3;
            }
        }
        this.process();
    }

    draw() {
        const now = Date.now();
        const dt = now - this.lasttime;
        this.time += dt;
        this.lasttime = now;
    
        if (!this.world) {
          this.sphere.visible = false;
          this.cube.visible = false;
          this.cone.visible = false;
      } else {
          if (this.index == 0) {
              this.sphere.visible = true;
              this.sphere.position.y = ((this.marker1.height / this.marker1.dpi) * 2.54 * 10) / 2.0;
              this.sphere.position.x = ((this.marker1.width / this.marker1.dpi) * 2.54 * 10) / 2.0;
              this.cube.visible = false;
              this.cone.visible = false;
          }
          else if(this.index == 1) {
              this.sphere.visible = false;
              this.cube.visible = true;
              this.cube.position.y = ((this.marker2.height / this.marker2.dpi) * 2.54 * 10) / 2.0;
              this.cube.position.x = ((this.marker2.width / this.marker2.dpi) * 2.54 * 10) / 2.0;
              this.cone.visible = false;
          }
          else if(this.index == 2) {
              this.sphere.visible = false;
              this.cube.visible = false;
              this.cone.visible = true;
              this.cone.position.y = ((this.marker3.height / this.marker3.dpi) * 2.54 * 10) / 2.0;
              this.cone.position.x = ((this.marker3.width / this.marker3.dpi) * 2.54 * 10) / 2.0;
          }
          // set matrix of 'root' by detected 'world' matrix
          this.setMatrix( this.root.matrix, this.world );
        }
        this.renderer.render( this.scene, this.camera );
    };

    tick() {
        this.draw();
        requestAnimationFrame( this.tick.bind(this) );
    };

    process() {
        this.context_process.fillStyle = 'black';
        this.context_process.fillRect(0, 0, this.pw, this.ph);
        this.context_process.drawImage( this.sourceVideo, 0, 0, this.vw, this.vh, this.ox, this.oy, this.w, this.h);
    
        const imageData = this.context_process.getImageData(0, 0, this.pw, this.ph);
        this.worker.postMessage({ type: 'process', imagedata: imageData }, [imageData.data.buffer]);
    }
}