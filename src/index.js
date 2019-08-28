import { 
    Scene,
    PerspectiveCamera, 
    WebGLRenderer, 
    BufferGeometry, 
    BufferAttribute,
    Points, 
    Vector3,
    Color,
    DirectionalLight,
    Plane,
    PlaneBufferGeometry,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    MeshLambertMaterial,
    PointLight,
} from 'three';

import Particle from './Particle';
import ParticleCloud from './ParticleCloud';
import SimplexNoise from 'simplex-noise';

import 'three/examples/js/controls/OrbitControls';


const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight);
const renderer = new WebGLRenderer({ preserveDrawingBuffer: true } );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
// renderer.autoClearColor = false;
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

let cloud;

let scrollPos = 0;
let pictures;

const numParticles = 8000;

const mousePosition = new Vector3(); // instantiate only for now

const randomness = 1;

let energy = 1;

function getParticlePosition(base) {
    const x = base.x + Math.random() * randomness - randomness / 2;
    const y = base.y + Math.random() * randomness - randomness / 2;
    const z = base.z + Math.random() * randomness - randomness / 2;
    return new Vector3(x, y, z);
}
const simplex = {
    x: new SimplexNoise('x'),
    y: new SimplexNoise('yasnads'),
    z: new SimplexNoise('z'), // seeds are arbitraty but should do the trick
};

function init() {

    cloud = new ParticleCloud(numParticles);

    // init particles
    for (let i = 0; i < numParticles; i++) {
        const particle = new Particle(getParticlePosition(mousePosition));
        cloud.addParticle(particle);
    }

    cloud.particles.forEach(particle => {
        // Position based vector field
        const now = Date.now();
        particle.addAttractor(({ x, y, z}) => {
            return new Vector3(
                simplex.x.noise3D(x / 10 + now, y / 10, z / 10),
                simplex.y.noise3D(x / 10, y / 10 + now, z / 10),
                simplex.z.noise3D(x / 10, y / 10, z / 10 + now),
            ).multiplyScalar(0.05 * energy);
        });
        // Damping
        particle.addAttractor((position, velocity) => {
            const opposite = velocity.clone().multiplyScalar(-1);
            return opposite.multiplyScalar(0.5 * velocity.lengthSq());
        });
    });

    cloud.updatePositions();
    cloud.setPosition(new Vector3(0, 0, 0));

    const light = new PointLight( 0xffffff, 1, 100 );
    light.position.set( 0, 30, 5 );
    light.castShadow = true;
    scene.add(light);

    const planeGeometry = new PlaneBufferGeometry(1000, 1000, 4, 4);
    const ground = new Mesh(planeGeometry, new MeshPhongMaterial({ color: 0xffffff }));
    ground.rotation.x = -0.5 * Math.PI;
    ground.position.y = -10;
    ground.receiveShadow = true;
    scene.add(ground);

    scene.add(cloud.points);    
    scene.add(cloud.pointsShade)

    camera.position.z = 50  ;

    document.body.appendChild( renderer.domElement );
}

let hue = 0;

function animate() {
    requestAnimationFrame( animate );
    if (cloud) {
        hue = (hue + 1) % 360;
        // cloud.material.color = new Color(`hsl(${hue}, 100%, 50%)`);
        cloud.material.color = new Color(`hsl(${hue}, 100%, 100%)`);
        cloud.material.needsUpdate = true;
        cloud.updatePositions();
        cloud.particles.filter(p => p.isDead()).forEach(p => {
            p.revive(getParticlePosition(mousePosition));
        });
        energy = energy * 0.95; // dampen
    }

    orbitControls.update();
	renderer.render(scene, camera);
}

animate();

window.onload = init;

let oldX = 0, oldY = 0;

window.addEventListener('mousemove', ({ clientX, clientY }) => {
    const difX = clientX - oldX;
    const difY = clientY - oldY;
    const dist = Math.sqrt(difX ** 2 + difY ** 2);
    energy += dist * 0.05;
    mousePosition.copy(mouseCoordinatesToWorldPosition(camera, clientX, clientY));
    oldX = clientX;
    oldY = clientY;
});

function mouseCoordinatesToWorldPosition(camera, clientX, clientY, targetZ = 0) {
    const vec = new Vector3(); // create once and reuse
    const pos = new Vector3(); // create once and reuse

    vec.set(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        - ( event.clientY / window.innerHeight ) * 2 + 1,
        0.5 );

    vec.unproject( camera );

    vec.sub( camera.position ).normalize();

    var distance = (targetZ - camera.position.z) / vec.z;

    pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

    return pos;
}