/**
 * Created with JetBrains WebStorm.
 * User: mauricio
 * Date: 4/7/13
 * Time: 2:57 PM
 * To change this template use File | Settings | File Templates.
 */

/* GLOBALS:
 * THREE
 * Coordinates
 * THREEx.FullScreen
 * T3.ObjectManager
 */

T3.Application = {
    /**
     * Clock helper (its delta method is used to update the camera)
     */
    clock: new THREE.Clock(),
    /**
     * THREE.WebGL Renderer
     */
    renderer: null,
    /**
     * Instance of T3.controller.World
     */
    controller: null,
    /**
     * Stats instance
     */
    stats: null,
    /**
     * dat.GUI instance
     */
    datGUI: new dat.GUI(),
    /**
     * Crates the WebGL Renderer and binds the fullscreen key 'f'
     * @chainable
     */
    createRender: function () {
        var me = this;

        // init the renderer
        if( !Detector.webgl ) {
            Detector.addGetWebGLMessage();
        }
        me.renderer = new THREE.WebGLRenderer({
//            antialias: true
        });
        me.renderer.shadowMapEnabled = true;
        me.renderer.shadowCameraNear = 0;
        me.renderer.shadowCameraFar = 1000;
        me.renderer.shadowCameraFov = 100;

        me.renderer.shadowMapBias = 0.0039;
        me.renderer.shadowMapDarkness = 0.5;
        me.renderer.shadowMapWidth = 2048;
        me.renderer.shadowMapHeight = 2048;
        me.renderer.setClearColorHex( 0xAAAAAA, 1 );
        me.renderer.setSize( window.innerWidth, window.innerHeight );
        document.getElementById('webgl-container').appendChild(me.renderer.domElement);

        // allow 'f' to go fullscreen where this feature is supported
        if( THREEx.FullScreen.available() ){
            THREEx.FullScreen.bindKey();
        }

        return this;
    },

    /**
     * Creates the basic scene adding some fog and lights
     * @chainable
     */
    createScene: function () {
        // instantiate the scene (global)
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );
        return this;
    },

    /**
     * Creates the lights used in the scene
     * @chainable
     */
    createSceneLights: function () {
        var light,
            k, d;

        light = new THREE.AmbientLight( 0x101010 );
        T3.ObjectManager.add('ambient-light', light);

        light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set(200, 400, 500);
//        light.castShadow = true;
//        light.shadowCameraVisible = true;
        T3.ObjectManager.add('directional-light-1', light);

        light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set(-500, 250, -200);
//        light.castShadow = true;
//        light.shadowCameraVisible = true;
        T3.ObjectManager.add('directional-light-2', light);

        // directional light to simulate sun light
        // 100W Tungsten like color: http://planetpixelemporium.com/tutorialpages/light.html
        k = 4;
        d = 1000;
        light = new THREE.DirectionalLight( 0xffd6aa, 3 );
        light.position.set(1000 * k, 100 * k, -200 * k);
        T3.ObjectManager.add('directional-light-3', light);
        light.castShadow = true;
        light.shadowCameraNear = 1000;
        light.shadowCameraFar= 5000;

        light.shadowCameraVisible = true;
        light.shadowCameraLeft = -d * 4;
        light.shadowCameraRight = 0;
        light.shadowCameraTop = d;
        light.shadowCameraBottom = -d;
//        var mesh = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
//        mesh.position.set(100, 10, -20);
//        scene.add(mesh);

        //****** sphere + point light ******
//        var colorLight = 0xffffff;
//
//        light = new THREE.PointLight( 0xffffff, 1 );
//        T3.ObjectManager.add('point-light', light);
//
//        // light representation (little sphere)
//        var sphereMesh, sphere;
//        sphereMesh = new THREE.Mesh(
//            new THREE.SphereGeometry( 100, 16, 8, 1 ),
//            new THREE.MeshBasicMaterial( {color: colorLight} )
//        );
//        sphere = new T3.model.Object3D({
//            name: 'sphere-light-point',
//            real: sphereMesh,
//            update: function () {
//                typeof this.r !== "undefined" ? (this.r += 0.01) : (this.r = 0);
//                this.real.position.x = 100 * Math.cos( this.r );
//                this.real.position.z = 100 * Math.sin( this.r );
//            }
//        });
//        sphere.real.scale.set(0.05, 0.05, 0.05);
//        sphere.real.position = light.position;

        return this;
    },

    /**
     * Initializes the world controller
     * @chainable
     */
    initController: function () {
        var me = this;
        // keyboard controller
        T3.controller.Keyboard.init();

        // World
        me.world = new T3.controller.World({
            renderer: me.renderer,
            activeCamera: T3.ObjectManager.get('camera-main')
        });
        return this;
    },

    /**
     * Initializes the Stat helper
     * @chainable
     */
    initHelpers: function () {
        var me = this;
        // add Stats.js - https://github.com/mrdoob/stats.js
        me.stats = new Stats();
        me.stats.domElement.style.position	= 'absolute';
        me.stats.domElement.style.top	= '0px';
        document.body.appendChild( me.stats.domElement );
        return this;
    },

    /**
     * Animation loop (calls Application.render)
     */
    animate: function () {
        var me = this,
            delta = T3.Application.clock.getDelta();

        // loop on request animation loop
        // - it has to be at the beggining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        requestAnimationFrame( T3.Application.animate );

        // TODO: MOVE THIS TO THE CONTROLLER
        T3.Application.stats.update();

        // do the render
        T3.Application.world.update(delta);
        T3.Application.world.render();
    },

    /************** LAUNCHER *************/
    launch: function () {
        // init the world
        this.createRender()
            .createScene()
            .createSceneLights();

        this.initHelpers();

        // inits the world controller
        this.initController();

        // animate the world and the scene
        this.animate();
    }
};

/************** START THE APPLICATION **************/
(function () {
    T3.AssetLoader.debug();
    T3.AssetLoader
        .registerAsset('texture-glass', THREE.ImageUtils.loadTexture('images/textures/glass.jpg'))
        .registerAsset('texture-glass_2', THREE.ImageUtils.loadTexture('images/textures/glass_2.jpg'))
        .registerAsset('texture-office', THREE.ImageUtils.loadTexture('images/textures/offices.jpg'))
        .registerAsset('texture-road-x', THREE.ImageUtils.loadTexture('images/textures/roadposx.png'))
        .registerAsset('texture-road-z', THREE.ImageUtils.loadTexture('images/textures/roadposz.png'))
        .registerAsset('texture-sidewalk', THREE.ImageUtils.loadTexture('images/textures/sidewalk.jpg'))
        .registerAsset('texture-residential', THREE.ImageUtils.loadTexture('images/textures/residential.jpg'))
        .registerAsset('lensflare-0', THREE.ImageUtils.loadTexture('images/lensflare0_alpha.png'));
    T3.AssetLoader
        .addToLoadQueue('obj/Skyline.body.js', 'car-body-geometry')
        .addToLoadQueue('obj/Skyline.exhaust.js', 'car-exhaust-geometry')
        .addToLoadQueue('obj/Skyline.windows.js', 'car-windows-geometry')
        .addToLoadQueue('obj/Skyline.lightsBack.js', 'car-lights-back-geometry')
        .addToLoadQueue('obj/Skyline.lightsFront.js', 'car-lights-front-geometry')
        .addToLoadQueue('obj/Skyline.tire.js', 'car-tire-geometry')
        .addToLoadQueue('obj/Skyline.rim.js', 'car-rim-geometry')
        .addToLoadQueue('obj/Skyline.interior.js', 'car-interior-geometry');
    T3.AssetLoader.load(T3.Application.launch, T3.Application);
})();